import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { CATEGORIES } from "@/lib/categories";
import { useTranslation } from "@/lib/i18n";
import { requestGPSLocation } from "@/lib/location";
import { isPushSupported, urlBase64ToUint8Array, VAPID_PUBLIC_KEY } from "@/lib/notifications";
import { toast } from "@/lib/toast";
import { getVisitorId } from "@/lib/visitor";
import { api } from "../../../convex/_generated/api";

interface NotificationSettingsProps {
  onClose: () => void;
}

export function NotificationSettings({ onClose }: NotificationSettingsProps) {
  const { t } = useTranslation();
  const visitorId = getVisitorId();
  const subscription = useQuery(api.notifications.getSubscription, { visitorId });
  const subscribeMutation = useMutation(api.notifications.subscribe);
  const unsubscribeMutation = useMutation(api.notifications.unsubscribe);

  const [selectedCategories, setSelectedCategories] = useState<string[]>(subscription?.categories ?? []);
  const [radius, setRadius] = useState(subscription?.radius ?? 5);
  const [loading, setLoading] = useState(false);

  const isSubscribed = subscription !== null && subscription !== undefined;

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    );
  };

  const handleEnable = async () => {
    if (!isPushSupported()) return;
    if (!VAPID_PUBLIC_KEY) {
      toast("Push notifications are not configured yet", "error");
      return;
    }

    setLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast("Notification permission denied", "error");
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      const keys = pushSubscription.toJSON().keys;
      if (!keys?.p256dh || !keys?.auth) {
        toast("Failed to get push subscription keys", "error");
        return;
      }

      // Use browser geolocation for subscription location
      const location = await requestGPSLocation();
      if (!location) {
        toast("Could not determine your location", "error");
        return;
      }

      await subscribeMutation({
        visitorId,
        endpoint: pushSubscription.endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        categories: selectedCategories.length > 0 ? selectedCategories : CATEGORIES.map((c) => c.id),
        radius,
        latitude: location.latitude,
        longitude: location.longitude,
      });

      toast(t("notify.enable"), "success");
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to enable notifications";
      toast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    setLoading(true);
    try {
      await unsubscribeMutation({ visitorId });
      toast(t("notify.disable"), "success");
      onClose();
    } catch {
      toast("Failed to disable notifications", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="glass-strong rounded-2xl p-5 w-full max-w-sm relative animate-scale-in max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          aria-label="Close"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M1 1l12 12M13 1L1 13" />
          </svg>
        </button>

        <h3 className="text-base font-semibold text-white mb-4">{t("notify.title")}</h3>

        {!isPushSupported() ? (
          <p className="text-sm text-slate-400">{t("notify.unsupported")}</p>
        ) : (
          <>
            {/* Category selection */}
            <div className="mb-4">
              <p className="text-sm text-slate-300 mb-2">{t("notify.categories")}</p>
              <div className="grid grid-cols-2 gap-1.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => toggleCategory(cat.id)}
                    className={`text-left px-3 py-2 rounded-xl text-xs transition-all ${
                      selectedCategories.includes(cat.id)
                        ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300"
                        : "bg-slate-800/40 border border-slate-700/20 text-slate-400 hover:bg-slate-800/60"
                    }`}
                  >
                    <span className="mr-1.5">{cat.emoji}</span>
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Radius slider */}
            <div className="mb-5">
              <label className="flex items-center justify-between text-sm text-slate-300 mb-2">
                <span>{t("notify.radius")}</span>
                <span className="text-white font-medium">{radius} km</span>
              </label>
              <input
                type="range"
                min={1}
                max={20}
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>1 km</span>
                <span>20 km</span>
              </div>
            </div>

            {/* Enable/Disable button */}
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-slate-800/60 text-slate-400 hover:bg-slate-700 transition-colors"
              >
                {t("comments.cancel")}
              </button>
              {isSubscribed ? (
                <button
                  onClick={handleDisable}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {loading ? "..." : t("notify.disable")}
                </button>
              ) : (
                <button
                  onClick={handleEnable}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {loading ? "..." : t("notify.enable")}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
