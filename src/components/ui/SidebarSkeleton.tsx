import { OfferCardSkeleton } from "./OfferCardSkeleton";

export function SidebarSkeleton() {
  return (
    <div className="px-3.5 sm:px-4">
      {/* Fake search bar */}
      <div className="w-full h-9 rounded-xl skeleton mb-3" />

      {/* Fake filter pills row */}
      <div className="flex gap-2 mb-4">
        <div className="h-6 w-16 skeleton rounded-lg" />
        <div className="h-6 w-20 skeleton rounded-lg" />
        <div className="h-6 w-14 skeleton rounded-lg" />
      </div>

      {/* Trending section */}
      <div className="mb-4">
        {/* Trending header */}
        <div className="h-3 w-24 skeleton rounded-full mb-2.5" />
        {/* Horizontal trending cards */}
        <div className="flex gap-2 overflow-hidden">
          <div className="flex-shrink-0 w-[140px] h-[72px] skeleton rounded-xl" />
          <div className="flex-shrink-0 w-[140px] h-[72px] skeleton rounded-xl" />
          <div className="flex-shrink-0 w-[140px] h-[72px] skeleton rounded-xl" />
        </div>
      </div>

      {/* Offer card skeletons */}
      <div className="space-y-2 pb-4">
        <OfferCardSkeleton />
        <OfferCardSkeleton />
        <OfferCardSkeleton />
        <OfferCardSkeleton />
        <OfferCardSkeleton />
      </div>
    </div>
  );
}
