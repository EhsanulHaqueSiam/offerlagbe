import { useEffect, useState } from "react";
import { getCachedOffers } from "@/lib/offlineStore";
import type { Offer } from "@/types/offer";

export function useOfflineOffers(): { cachedOffers: Offer[]; isOffline: boolean } {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [cachedOffers, setCachedOffers] = useState<Offer[]>([]);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!isOffline) return;
    getCachedOffers()
      .then(setCachedOffers)
      .catch(() => setCachedOffers([]));
  }, [isOffline]);

  return { cachedOffers, isOffline };
}
