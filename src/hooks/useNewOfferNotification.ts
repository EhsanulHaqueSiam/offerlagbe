import { useEffect, useRef } from "react";
import { toast } from "@/lib/toast";
import type { Offer } from "@/types/offer";

export function useNewOfferNotification(
  offers: Offer[] | undefined,
  onOfferClick?: (offer: Offer) => void,
) {
  const prevIdsRef = useRef<Set<string> | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!offers) return;

    // Skip the initial load — don't toast for existing offers
    if (!initializedRef.current) {
      prevIdsRef.current = new Set(offers.map((o) => o._id));
      initializedRef.current = true;
      return;
    }

    const prevIds = prevIdsRef.current!;
    const newOffers = offers.filter((o) => !prevIds.has(o._id));

    if (newOffers.length > 0) {
      // Show toast for the newest one
      const newest = newOffers.sort((a, b) => b.createdAt - a.createdAt)[0];
      toast(
        `🆕 ${newest.discountPercent}% OFF at ${newest.storeName}`,
        "info",
        6000,
        onOfferClick ? () => onOfferClick(newest) : undefined,
      );
    }

    prevIdsRef.current = new Set(offers.map((o) => o._id));
  }, [offers, onOfferClick]);
}
