import { useEffect, useRef } from "react";
import type { UserLocation } from "@/lib/location";
import { getDistanceKm } from "@/lib/location";
import { toast } from "@/lib/toast";
import type { Offer } from "@/types/offer";

export function useNewOfferNotification(
  offers: Offer[] | undefined,
  onOfferClick?: (offer: Offer) => void,
  userLocation?: UserLocation | null,
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
      // Only notify for offers within 10km of user (or all if no location)
      const nearby = userLocation
        ? newOffers.filter(
            (o) => getDistanceKm(userLocation.latitude, userLocation.longitude, o.latitude, o.longitude) <= 10,
          )
        : newOffers;

      if (nearby.length > 0) {
        const newest = nearby.sort((a, b) => b.createdAt - a.createdAt)[0];
        toast(
          `🆕 ${newest.title} — ${newest.discountPercent}% OFF at ${newest.storeName}`,
          "info",
          6000,
          onOfferClick ? () => onOfferClick(newest) : undefined,
        );
      }
    }

    prevIdsRef.current = new Set(offers.map((o) => o._id));
  }, [offers, onOfferClick, userLocation]);
}
