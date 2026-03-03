import { useMutation, useQuery } from "convex/react";
import { useRef, useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { compressImage } from "@/lib/image";
import { toast } from "@/lib/toast";
import { getVisitorId } from "@/lib/visitor";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

interface PhotoVerificationProps {
  offerId: Id<"offers">;
}

export function PhotoVerification({ offerId }: PhotoVerificationProps) {
  const { t } = useTranslation();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const photos = useQuery(api.verificationPhotos.listByOffer, { offerId }) as
    | { _id: string; url: string; createdAt: number }[]
    | undefined;

  const createVerificationPhoto = useMutation(api.verificationPhotos.create);
  const generateUploadUrl = useMutation(api.offers.generateUploadUrl);

  const photoCount = photos?.length ?? 0;

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset the input so the same file can be selected again
    e.target.value = "";

    setUploading(true);
    try {
      const visitorId = getVisitorId();

      // Compress image and fetch upload URL concurrently
      const [compressed, uploadUrl] = await Promise.all([compressImage(file), generateUploadUrl({ visitorId })]);

      // Upload the file
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": compressed.type },
        body: compressed,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const { storageId } = (await response.json()) as { storageId: Id<"_storage"> };

      // Save the verification photo record
      await createVerificationPhoto({ offerId, visitorId, storageId });

      toast(t("verify.submitted"), "success");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      toast(message, "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="glass rounded-2xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {t("verify.title")}
        </h3>
        <span className="text-[10px] text-slate-500 font-medium">
          {photos && photos.length > 0
            ? t("verify.verifiedBy").replace("{n}", String(photoCount))
            : t("verify.beFirst")}
        </span>
      </div>

      {/* Photo gallery — horizontal scroll */}
      {photos && photos.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 mb-3 snap-x">
          {photos.map((photo) => (
            <div
              key={photo._id}
              className="flex-shrink-0 snap-start w-20 h-20 rounded-xl overflow-hidden border border-slate-700/30 bg-slate-800/40"
            >
              <img
                src={photo.url}
                alt="Verification photo"
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
                width={80}
                height={80}
              />
            </div>
          ))}
        </div>
      )}

      {/* Verify button */}
      <button
        onClick={handleButtonClick}
        disabled={uploading}
        className="flex items-center justify-center gap-2 w-full px-3.5 py-2.5 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 text-xs font-medium transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        {uploading ? t("verify.uploading") : t("verify.button")}
      </button>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
