import { useState, useCallback, useEffect, useRef } from "react";
import { useMutation, useConvex } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { CATEGORIES } from "@/lib/categories";
import { OfferMap } from "../map/OfferMap";
import { compressImage, validateImageFile } from "@/lib/image";
import { toast } from "@/lib/toast";
import { useTranslation } from "@/lib/i18n";
import { getLocationWithFallback, requestGPSLocation } from "@/lib/location";
import { getVisitorId } from "@/lib/visitor";
import { RichText } from "./RichText";
import { useNavigate } from "@tanstack/react-router";
import type { Id } from "../../../convex/_generated/dataModel";

const ALLOWED_TAGS = ["verified", "limited-stock", "online-only", "in-store-only", "members-only", "new-arrival"] as const;

interface FormData {
  storeName: string;
  title: string;
  discountPercent: string;
  category: string;
  latitude: number | null;
  longitude: number | null;
  address: string;
  // Optional "more details"
  description: string;
  originalPrice: string;
  offerPrice: string;
  startDate: string;
  endDate: string;
  couponCode: string;
}

interface FormErrors {
  storeName?: string;
  title?: string;
  discountPercent?: string;
  category?: string;
  location?: string;
  address?: string;
  dates?: string;
}

function todayDateStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const initialForm: FormData = {
  storeName: "",
  title: "",
  discountPercent: "",
  category: "",
  latitude: null,
  longitude: null,
  address: "",
  description: "",
  originalPrice: "",
  offerPrice: "",
  startDate: todayDateStr(),
  endDate: "",
  couponCode: "",
};

const DISCOUNT_QUICK_PICKS = ["10", "20", "25", "30", "50", "70"];

export function SubmitOfferForm() {
  const { t } = useTranslation();
  const [form, setForm] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [moreDetails, setMoreDetails] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);
  const [gpsRequesting, setGpsRequesting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createOffer = useMutation(api.offers.create);
  const generateUploadUrl = useMutation(api.offers.generateUploadUrl);
  const convex = useConvex();
  const navigate = useNavigate();
  const [duplicates, setDuplicates] = useState<{ _id: string; title: string; storeName: string; discountPercent: number; address: string }[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [previewMode, setPreviewMode] = useState(false);

  // Auto-detect location on mount
  useEffect(() => {
    let cancelled = false;
    getLocationWithFallback().then((loc) => {
      if (cancelled) return;
      setLocationLoading(false);
      if (loc) {
        setForm((prev) => ({
          ...prev,
          latitude: loc.latitude,
          longitude: loc.longitude,
        }));
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // "Use Current Location" button handler — always re-requests GPS
  const handleUseCurrentLocation = useCallback(async () => {
    setGpsRequesting(true);
    const loc = await requestGPSLocation();
    setGpsRequesting(false);
    if (loc) {
      setForm((prev) => ({
        ...prev,
        latitude: loc.latitude,
        longitude: loc.longitude,
      }));
      setErrors((prev) => ({ ...prev, location: undefined }));
      toast(t("toast.locationUpdated"), "success");
    } else {
      toast(t("toast.locationDenied"), "info");
    }
  }, []);

  const updateForm = (updates: Partial<FormData>) => {
    setForm((prev) => ({ ...prev, ...updates }));
    const errorKeys = Object.keys(updates) as (keyof FormErrors)[];
    setErrors((prev) => {
      const next = { ...prev };
      for (const key of errorKeys) delete next[key];
      return next;
    });
  };

  const handleMapClick = useCallback((lat: number, lng: number) => {
    setForm((prev) => ({ ...prev, latitude: lat, longitude: lng }));
    setErrors((prev) => ({ ...prev, location: undefined }));
  }, []);

  const handleImagesSelect = async (files: FileList) => {
    const remaining = 5 - imageFiles.length;
    const toProcess = Array.from(files).slice(0, remaining);

    for (const file of toProcess) {
      const err = validateImageFile(file);
      if (err) {
        toast(`${file.name}: ${err}`, "error");
        continue;
      }
      try {
        const compressed = await compressImage(file);
        setImageFiles((prev) => [...prev, compressed]);
      } catch {
        toast(`Could not process ${file.name}`, "error");
      }
    }
    if (toProcess.length > 0) toast(t("toast.photosOptimized"), "success");
  };

  const uploadFile = async (file: File): Promise<Id<"_storage">> => {
    const url = await generateUploadUrl({ visitorId: getVisitorId() });
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });
    const { storageId } = await res.json();
    return storageId;
  };

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!form.storeName.trim()) errs.storeName = t("error.storeRequired");
    if (!form.title.trim()) errs.title = t("error.titleRequired");
    const disc = Number(form.discountPercent);
    if (!form.discountPercent || disc <= 0 || disc > 100)
      errs.discountPercent = t("error.discountRange");
    if (!form.category) errs.category = t("error.categoryRequired");
    if (form.latitude === null || form.longitude === null)
      errs.location = t("error.locationRequired");
    if (!form.address.trim()) errs.address = t("error.addressRequired");
    if (form.startDate && form.endDate && form.endDate < form.startDate)
      errs.dates = t("error.dateOrder");
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const doSubmit = async () => {
    setSubmitting(true);
    try {
      const imageStorageIds: Id<"_storage">[] = [];
      if (imageFiles.length > 0) {
        setUploadProgress(`Uploading ${imageFiles.length} photo${imageFiles.length > 1 ? "s" : ""}...`);
        const uploads = await Promise.all(imageFiles.map((f) => uploadFile(f)));
        imageStorageIds.push(...uploads);
      }

      setUploadProgress("Posting offer...");
      await createOffer({
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        category: form.category,
        discountPercent: Number(form.discountPercent),
        originalPrice: form.originalPrice
          ? Number(form.originalPrice)
          : undefined,
        offerPrice: form.offerPrice ? Number(form.offerPrice) : undefined,
        latitude: form.latitude!,
        longitude: form.longitude!,
        address: form.address.trim(),
        storeName: form.storeName.trim(),
        imageStorageIds,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
        couponCode: form.couponCode.trim() || undefined,
        submitterId: getVisitorId(),
        tags: selectedTags.length > 0 ? selectedTags : undefined,
      });

      toast(t("toast.offerPosted"), "success");
      navigate({ to: "/" });
    } catch (err) {
      toast(
        err instanceof Error
          ? err.message
          : "Failed to post. Please try again.",
        "error",
      );
    } finally {
      setSubmitting(false);
      setUploadProgress("");
    }
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    // Check for duplicates before submitting
    if (form.latitude !== null && form.longitude !== null && form.title.trim()) {
      try {
        const matches = await convex.query(api.offers.checkDuplicate, {
          title: form.title.trim(),
          latitude: form.latitude,
          longitude: form.longitude,
        });
        if (matches.length > 0) {
          setDuplicates(matches);
          return;
        }
      } catch {
        // If duplicate check fails, proceed anyway
      }
    }

    doSubmit();
  };

  const inputClass = (hasError?: string) =>
    `w-full bg-slate-800/50 border ${
      hasError
        ? "border-red-500/50 focus:ring-red-500/40"
        : "border-slate-700/40 focus:ring-indigo-500/40"
    } rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all`;

  const ErrorMsg = ({ msg }: { msg?: string }) =>
    msg ? <p className="text-xs text-red-400 mt-1">{msg}</p> : null;

  return (
    <div className="max-w-lg mx-auto px-4 pt-4 pb-28">
      <div className="space-y-5 animate-fade-in-up">
        {/* Store Name */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            {t("submit.storeName")} *
          </label>
          <input
            type="text"
            value={form.storeName}
            onChange={(e) => updateForm({ storeName: e.target.value })}
            placeholder={t("submit.storeNamePlaceholder")}
            className={inputClass(errors.storeName)}
            autoFocus
          />
          <ErrorMsg msg={errors.storeName} />
        </div>

        {/* Offer Title */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            {t("submit.offerTitle")} *
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => updateForm({ title: e.target.value })}
            placeholder={t("submit.titlePlaceholder")}
            className={inputClass(errors.title)}
            maxLength={100}
          />
          <ErrorMsg msg={errors.title} />
        </div>

        {/* Discount % with quick picks */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            {t("submit.discount")} *
          </label>
          <div className="flex items-center gap-2 mb-2 overflow-x-auto pb-1 -mx-1 px-1">
            {DISCOUNT_QUICK_PICKS.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => updateForm({ discountPercent: val })}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-all active:scale-95 ${
                  form.discountPercent === val
                    ? "bg-indigo-500 text-white"
                    : "bg-slate-800/60 text-slate-400 hover:bg-slate-800"
                }`}
              >
                {val}%
              </button>
            ))}
          </div>
          <input
            type="number"
            value={form.discountPercent}
            onChange={(e) => updateForm({ discountPercent: e.target.value })}
            placeholder={t("submit.customPercent")}
            min={1}
            max={100}
            className={inputClass(errors.discountPercent)}
          />
          <ErrorMsg msg={errors.discountPercent} />
        </div>

        {/* Category chips */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            {t("submit.category")} *
          </label>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => updateForm({ category: cat.id })}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all active:scale-95 ${
                  form.category === cat.id
                    ? "text-white"
                    : "bg-slate-800/40 text-slate-400 hover:bg-slate-800/60"
                }`}
                style={
                  form.category === cat.id
                    ? {
                        backgroundColor: `${cat.color}18`,
                        color: cat.color,
                        boxShadow: `inset 0 0 0 1.5px ${cat.color}60`,
                      }
                    : undefined
                }
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
          <ErrorMsg msg={errors.category} />
        </div>

        {/* Location */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-slate-300">
              {t("submit.location")} *
            </label>
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={gpsRequesting}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 active:scale-95 transition-all disabled:opacity-50"
            >
              {gpsRequesting ? (
                <svg
                  className="w-3.5 h-3.5 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 2v2m0 16v2m10-10h-2M4 12H2"
                  />
                </svg>
              )}
              {gpsRequesting ? t("submit.detecting") : t("submit.useCurrentLocation")}
            </button>
          </div>

          {locationLoading ? (
            <div className="h-[160px] rounded-2xl overflow-hidden border border-slate-700/30 flex items-center justify-center bg-slate-800/30">
              <div className="text-center">
                <svg
                  className="w-5 h-5 mx-auto text-slate-500 animate-spin mb-2"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                <span className="text-xs text-slate-500">
                  {t("submit.detectingLocation")}
                </span>
              </div>
            </div>
          ) : (
            <div className="relative h-[160px] rounded-2xl overflow-hidden border border-slate-700/30">
              <OfferMap
                offers={[]}
                pickMode={true}
                onMapClick={handleMapClick}
                pickedLocation={
                  form.latitude !== null && form.longitude !== null
                    ? { lat: form.latitude, lng: form.longitude }
                    : null
                }
              />
              {form.latitude !== null && form.longitude !== null && (
                <div className="absolute bottom-2 left-2 glass rounded-lg px-2 py-1 text-[10px] text-slate-300 font-mono">
                  {form.latitude.toFixed(4)}, {form.longitude.toFixed(4)}
                </div>
              )}
            </div>
          )}

          {form.latitude === null && !locationLoading && (
            <p className="text-xs text-amber-400/80 mt-1.5 flex items-center gap-1">
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t("submit.tapMapHint")}
            </p>
          )}
          {form.latitude !== null && !locationLoading && (
            <p className="text-xs text-slate-500 mt-1">
              {t("submit.adjustPin")}
            </p>
          )}
          <ErrorMsg msg={errors.location} />

          <input
            type="text"
            value={form.address}
            onChange={(e) => updateForm({ address: e.target.value })}
            placeholder={t("submit.addressPlaceholder")}
            className={`${inputClass(errors.address)} mt-2`}
          />
          <ErrorMsg msg={errors.address} />
        </div>

        {/* More Details — collapsible */}
        <div>
          <button
            type="button"
            onClick={() => setMoreDetails((v) => !v)}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors w-full py-2"
          >
            <svg
              className={`w-4 h-4 transition-transform ${moreDetails ? "rotate-90" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
            <span className="font-medium">
              {t("submit.moreDetails")}{" "}
              <span className="font-normal text-slate-500">({t("submit.optional")})</span>
            </span>
          </button>

          {moreDetails && (
            <div className="space-y-4 mt-2 pl-1 animate-fade-in-up">
              {/* Description */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-slate-400">
                    {t("submit.description")}
                  </label>
                  {form.description.trim() && (
                    <button
                      type="button"
                      onClick={() => setPreviewMode(!previewMode)}
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 font-medium"
                    >
                      {previewMode ? t("submit.edit") : t("submit.preview")}
                    </button>
                  )}
                </div>
                {previewMode ? (
                  <div className="bg-slate-800/50 border border-slate-700/40 rounded-xl px-3.5 py-2.5 min-h-[60px]">
                    <RichText text={form.description} />
                  </div>
                ) : (
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      updateForm({ description: e.target.value })
                    }
                    placeholder={t("submit.descriptionPlaceholder")}
                    rows={2}
                    className={`${inputClass()} resize-none`}
                    maxLength={500}
                  />
                )}
                <p className="text-[10px] text-slate-600 mt-1">
                  {t("submit.markdownHint")}
                </p>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  {t("submit.tags")} <span className="text-slate-500 font-normal">— {t("submit.tagsHint")}</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {ALLOWED_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        setSelectedTags((prev) =>
                          prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
                        );
                      }}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all active:scale-95 ${
                        selectedTags.includes(tag)
                          ? "bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/40"
                          : "bg-slate-800/40 text-slate-400 hover:bg-slate-800/60"
                      }`}
                    >
                      {t(`tag.${tag}` as Parameters<typeof t>[0])}
                    </button>
                  ))}
                </div>
              </div>

              {/* Prices */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    {t("submit.originalPrice")} (৳)
                  </label>
                  <input
                    type="number"
                    value={form.originalPrice}
                    onChange={(e) =>
                      updateForm({ originalPrice: e.target.value })
                    }
                    placeholder="1000"
                    min={0}
                    className={inputClass()}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    {t("submit.offerPrice")} (৳)
                  </label>
                  <input
                    type="number"
                    value={form.offerPrice}
                    onChange={(e) =>
                      updateForm({ offerPrice: e.target.value })
                    }
                    placeholder="500"
                    min={0}
                    className={inputClass()}
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    {t("submit.startDate")}
                  </label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) =>
                      updateForm({ startDate: e.target.value })
                    }
                    className={inputClass(errors.dates)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    {t("submit.endDate")}
                  </label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) =>
                      updateForm({ endDate: e.target.value })
                    }
                    className={inputClass(errors.dates)}
                  />
                </div>
              </div>
              <ErrorMsg msg={errors.dates} />
              <p className="text-[10px] text-slate-600">
                {t("submit.dateHint")}
              </p>

              {/* Coupon Code */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  {t("submit.couponCode")}
                </label>
                <input
                  type="text"
                  value={form.couponCode}
                  onChange={(e) => updateForm({ couponCode: e.target.value.toUpperCase() })}
                  placeholder={t("submit.couponCodePlaceholder")}
                  maxLength={30}
                  className={`${inputClass()} font-mono tracking-wider`}
                />
              </div>

              {/* Photos */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  {t("submit.photos")}{" "}
                  <span className="text-slate-500">(max 5)</span>
                </label>
                <div className="flex gap-2 flex-wrap">
                  {imageFiles.map((file, i) => (
                    <div
                      key={i}
                      className="relative w-16 h-16 rounded-xl overflow-hidden ring-1 ring-slate-700/30 group"
                    >
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Upload ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setImageFiles((prev) =>
                            prev.filter((_, idx) => idx !== i),
                          )
                        }
                        className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/70 rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        aria-label={`Remove image ${i + 1}`}
                      >
                        <svg
                          className="w-2.5 h-2.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                  {imageFiles.length < 5 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-700/40 flex items-center justify-center hover:border-indigo-500/40 hover:bg-slate-800/30 transition-all active:scale-95"
                    >
                      <svg
                        className="w-5 h-5 text-slate-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) handleImagesSelect(e.target.files);
                      e.target.value = "";
                    }}
                  />
                </div>
                <p className="text-[10px] text-slate-600 mt-1">
                  {t("submit.photosHint")}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sticky submit button */}
      <div className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom">
        <div className="glass-strong border-t border-slate-700/30">
          <div className="max-w-lg mx-auto px-4 py-3">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold rounded-xl py-3.5 transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm"
            >
              {submitting ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  <span>{uploadProgress || t("submit.posting")}</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  {t("submit.postOffer")}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Duplicate warning modal */}
      {duplicates.length > 0 && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDuplicates([])} />
          <div className="relative glass-strong rounded-2xl p-5 max-w-sm w-full animate-scale-in shadow-2xl">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-amber-500/15 flex items-center justify-center">
                <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-white">{t("duplicate.title")}</h3>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              {t("duplicate.message")}
            </p>
            <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
              {duplicates.map((d) => (
                <div key={d._id} className="bg-slate-800/40 rounded-xl px-3 py-2">
                  <p className="text-xs text-white font-medium truncate">{d.title}</p>
                  <p className="text-[10px] text-slate-500">{d.storeName} &middot; {d.discountPercent}% OFF &middot; {d.address}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setDuplicates([])}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800/60 text-sm font-medium text-slate-300 hover:bg-slate-700 transition-colors"
              >
                {t("duplicate.cancel")}
              </button>
              <button
                onClick={() => {
                  setDuplicates([]);
                  doSubmit();
                }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-amber-500/20 text-sm font-medium text-amber-300 hover:bg-amber-500/30 transition-colors"
              >
                {t("duplicate.postAnyway")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
