import { memo, useCallback, useRef, useState } from "react";
import type { CategoryId } from "@/lib/categories";
import { useTranslation } from "@/lib/i18n";
import type { UserLocation } from "@/lib/location";
import type { Offer, SortOption } from "@/types/offer";
import { CategoryFilter } from "../offers/CategoryFilter";
import { OfferCard } from "../offers/OfferCard";
import { SearchBar } from "../offers/SearchBar";

export type PriceRange = "all" | "0-500" | "500-2000" | "2000-5000" | "5000+";
export type DateFilter = "all" | "today" | "week" | "month";

interface SidebarProps {
  offers: Offer[];
  activeCategories: Set<CategoryId>;
  onToggleCategory: (id: CategoryId) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  userLocation: UserLocation | null;
  onOfferClick?: (offer: Offer) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  nearMeActive: boolean;
  onToggleNearMe: () => void;
  showSavedOnly: boolean;
  onToggleSaved: () => void;
  bookmarkedIds: Set<string>;
  onToggleBookmark: (id: string) => void;
  trendingOffers: Offer[];
  bestThisWeek: Offer[];
  priceRange: PriceRange;
  onPriceRangeChange: (range: PriceRange) => void;
  dateFilter: DateFilter;
  onDateFilterChange: (filter: DateFilter) => void;
}

const SORT_OPTIONS: {
  value: SortOption;
  labelKey: "sidebar.newest" | "sidebar.nearest" | "sidebar.bestDeals" | "sidebar.mostTrusted";
}[] = [
  { value: "newest", labelKey: "sidebar.newest" },
  { value: "nearest", labelKey: "sidebar.nearest" },
  { value: "discount", labelKey: "sidebar.bestDeals" },
  { value: "trusted", labelKey: "sidebar.mostTrusted" },
];

const PRICE_OPTIONS: {
  value: PriceRange;
  labelKey:
    | "filter.priceAll"
    | "filter.price0to500"
    | "filter.price500to2000"
    | "filter.price2000to5000"
    | "filter.price5000plus";
}[] = [
  { value: "all", labelKey: "filter.priceAll" },
  { value: "0-500", labelKey: "filter.price0to500" },
  { value: "500-2000", labelKey: "filter.price500to2000" },
  { value: "2000-5000", labelKey: "filter.price2000to5000" },
  { value: "5000+", labelKey: "filter.price5000plus" },
];

const DATE_OPTIONS: {
  value: DateFilter;
  labelKey: "filter.dateAll" | "filter.dateToday" | "filter.dateWeek" | "filter.dateMonth";
}[] = [
  { value: "all", labelKey: "filter.dateAll" },
  { value: "today", labelKey: "filter.dateToday" },
  { value: "week", labelKey: "filter.dateWeek" },
  { value: "month", labelKey: "filter.dateMonth" },
];

export const Sidebar = memo(function Sidebar({
  offers,
  activeCategories,
  onToggleCategory,
  searchTerm,
  onSearchChange,
  userLocation,
  onOfferClick,
  sortBy,
  onSortChange,
  nearMeActive,
  onToggleNearMe,
  showSavedOnly,
  onToggleSaved,
  bookmarkedIds,
  onToggleBookmark,
  trendingOffers,
  bestThisWeek,
  priceRange,
  onPriceRangeChange,
  dateFilter,
  onDateFilterChange,
}: SidebarProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [dragStartY, setDragStartY] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches,
  );
  const sheetRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setDragStartY(e.touches[0].clientY);
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (dragStartY === null) return;
      const delta = e.changedTouches[0].clientY - dragStartY;
      if (delta > 80) setIsOpen(false);
      setDragStartY(null);
    },
    [dragStartY],
  );

  const activeFilterCount =
    (activeCategories.size > 0 ? 1 : 0) +
    (sortBy !== "newest" ? 1 : 0) +
    (priceRange !== "all" ? 1 : 0) +
    (dateFilter !== "all" ? 1 : 0);

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed bottom-5 left-4 z-40 glass rounded-2xl w-12 h-12 flex items-center justify-center shadow-xl hover:bg-glass-hover active:scale-95 transition-all"
        aria-label={isOpen ? "Close offers panel" : "Open offers panel"}
      >
        {isOpen ? (
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <div className="relative">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
            </svg>
            {offers.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-indigo-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                {offers.length > 99 ? "99" : offers.length}
              </span>
            )}
          </div>
        )}
      </button>

      {/* Desktop sidebar / Mobile bottom sheet */}
      <aside
        className={`
          fixed z-30 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
          md:top-20 md:left-3 lg:left-4 md:bottom-3 lg:bottom-4 md:w-[340px] lg:w-[360px] md:translate-x-0 md:translate-y-0
          bottom-0 left-0 right-0 md:right-auto
          ${isOpen ? "translate-y-0" : "translate-y-full md:translate-y-0"}
        `}
      >
        <div
          ref={sheetRef}
          className="glass-strong rounded-t-2xl md:rounded-2xl h-[85dvh] md:h-full flex flex-col shadow-2xl overflow-hidden"
        >
          {/* Mobile drag handle */}
          <div
            className="md:hidden flex justify-center pt-2.5 pb-1 cursor-grab active:cursor-grabbing"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div className="w-9 h-1 bg-slate-600 rounded-full" />
          </div>

          {/* Search — stays in fixed header */}
          <div className="px-3.5 sm:px-4 pt-2 pb-2">
            <SearchBar value={searchTerm} onChange={onSearchChange} />
          </div>

          {/* Count + filter toggle + actions — stays in fixed header */}
          <div className="px-3.5 sm:px-4 pb-2 flex items-center justify-between gap-2">
            <p className="text-[11px] text-slate-500 font-medium">
              {offers.length} {offers.length !== 1 ? t("sidebar.offersPlural") : t("sidebar.offers")}
            </p>
            <div className="flex items-center gap-1.5">
              {/* Filter toggle */}
              <button
                onClick={() => setShowFilters((v) => !v)}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium transition-all active:scale-95 ${
                  showFilters || activeFilterCount > 0
                    ? "bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/40"
                    : "bg-slate-800/40 text-slate-500 hover:bg-slate-800/60"
                }`}
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
                {activeFilterCount > 0 && <span>{activeFilterCount}</span>}
              </button>

              {/* Near Me */}
              <button
                onClick={onToggleNearMe}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium transition-all active:scale-95 ${
                  nearMeActive
                    ? "bg-blue-500/20 text-blue-300 ring-1 ring-blue-500/40"
                    : "bg-slate-800/40 text-slate-500 hover:bg-slate-800/60"
                }`}
                aria-label="Filter nearby offers"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z"
                  />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2m0 16v2m10-10h-2M4 12H2" />
                </svg>
              </button>

              {/* Saved */}
              <button
                onClick={onToggleSaved}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium transition-all active:scale-95 ${
                  showSavedOnly
                    ? "bg-pink-500/20 text-pink-300 ring-1 ring-pink-500/40"
                    : "bg-slate-800/40 text-slate-500 hover:bg-slate-800/60"
                }`}
                aria-label="Show saved offers"
              >
                <svg
                  className="w-3 h-3"
                  fill={showSavedOnly ? "currentColor" : "none"}
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                {bookmarkedIds.size > 0 && <span>{bookmarkedIds.size}</span>}
              </button>

              {/* Clear filters */}
              {activeCategories.size > 0 && (
                <button
                  onClick={() => {
                    for (const cat of activeCategories) onToggleCategory(cat);
                  }}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                >
                  {t("sidebar.clear")}
                </button>
              )}
            </div>
          </div>

          {/* Scrollable content — trending, bestThisWeek, filters, offers all scroll together */}
          <div className="flex-1 overflow-y-auto">
            {/* Trending section */}
            {trendingOffers.length > 0 && (
              <div className="px-3.5 sm:px-4 pb-2">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-sm">🔥</span>
                  <span className="text-[11px] font-semibold text-orange-400 uppercase tracking-wide">
                    {t("sidebar.trending")}
                  </span>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 snap-x">
                  {trendingOffers.map((offer) => (
                    <button
                      key={offer._id}
                      onClick={() => onOfferClick?.(offer)}
                      className="flex-shrink-0 snap-start w-[140px] bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700/20 rounded-xl px-2.5 py-2 text-left transition-all active:scale-[0.97] group"
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-xs">🏷️</span>
                        <span className="text-[10px] text-slate-500 truncate font-medium">{offer.storeName}</span>
                      </div>
                      <p className="text-[11px] text-white font-medium truncate group-hover:text-indigo-300 transition-colors leading-snug">
                        {offer.title}
                      </p>
                      <span className="text-[11px] font-bold text-emerald-400 mt-0.5 block">
                        {offer.discountPercent}% {t("offer.off")}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Best This Week */}
            {bestThisWeek.length > 0 && (
              <div className="px-3.5 sm:px-4 pb-2">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-sm">⭐</span>
                  <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wide">
                    {t("sidebar.bestThisWeek")}
                  </span>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 snap-x">
                  {bestThisWeek.map((offer) => (
                    <button
                      key={offer._id}
                      onClick={() => onOfferClick?.(offer)}
                      className="flex-shrink-0 snap-start w-[140px] bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700/20 rounded-xl px-2.5 py-2 text-left transition-all active:scale-[0.97] group"
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-xs">🏷️</span>
                        <span className="text-[10px] text-slate-500 truncate font-medium">{offer.storeName}</span>
                      </div>
                      <p className="text-[11px] text-white font-medium truncate group-hover:text-amber-300 transition-colors leading-snug">
                        {offer.title}
                      </p>
                      <span className="text-[11px] font-bold text-emerald-400 mt-0.5 block">
                        {offer.discountPercent}% {t("offer.off")}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Collapsible filter panel */}
            {showFilters && (
              <>
                {/* Sort pills */}
                <div className="px-3.5 sm:px-4 pb-2 flex gap-1.5 overflow-x-auto">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => onSortChange(opt.value)}
                      disabled={opt.value === "nearest" && !userLocation}
                      className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all active:scale-95 ${
                        sortBy === opt.value
                          ? "bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/40"
                          : "bg-slate-800/40 text-slate-500 hover:bg-slate-800/60 hover:text-slate-300"
                      } disabled:opacity-30 disabled:pointer-events-none`}
                    >
                      {t(opt.labelKey)}
                    </button>
                  ))}
                </div>

                {/* Categories */}
                <div className="px-3.5 sm:px-4 pb-2.5">
                  <CategoryFilter activeCategories={activeCategories} onToggle={onToggleCategory} />
                </div>

                {/* Price range pills */}
                <div className="px-3.5 sm:px-4 pb-2 flex gap-1.5 overflow-x-auto">
                  <span className="text-[10px] text-slate-600 font-medium flex-shrink-0 self-center">
                    {t("filter.price")}:
                  </span>
                  {PRICE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => onPriceRangeChange(opt.value)}
                      className={`flex-shrink-0 px-2 py-1 rounded-lg text-[10px] font-medium transition-all active:scale-95 ${
                        priceRange === opt.value
                          ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40"
                          : "bg-slate-800/40 text-slate-500 hover:bg-slate-800/60 hover:text-slate-300"
                      }`}
                    >
                      {t(opt.labelKey)}
                    </button>
                  ))}
                </div>

                {/* Date filter pills */}
                <div className="px-3.5 sm:px-4 pb-2 flex gap-1.5 overflow-x-auto">
                  <span className="text-[10px] text-slate-600 font-medium flex-shrink-0 self-center">
                    {t("filter.date")}:
                  </span>
                  {DATE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => onDateFilterChange(opt.value)}
                      className={`flex-shrink-0 px-2 py-1 rounded-lg text-[10px] font-medium transition-all active:scale-95 ${
                        dateFilter === opt.value
                          ? "bg-purple-500/20 text-purple-300 ring-1 ring-purple-500/40"
                          : "bg-slate-800/40 text-slate-500 hover:bg-slate-800/60 hover:text-slate-300"
                      }`}
                    >
                      {t(opt.labelKey)}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Offer list */}
            <div className="px-3.5 sm:px-4 pb-4 space-y-2">
              {offers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-slate-800/60 flex items-center justify-center mb-3">
                    <svg
                      className="w-7 h-7 text-slate-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-slate-400">{t("sidebar.noOffers")}</p>
                  <p className="text-xs text-slate-600 mt-1">{t("sidebar.noOffersHint")}</p>
                </div>
              ) : (
                offers.map((offer) => (
                  <OfferCard
                    key={offer._id}
                    offer={offer}
                    userLocation={userLocation}
                    onClick={() => onOfferClick?.(offer)}
                    isBookmarked={bookmarkedIds.has(offer._id)}
                    onToggleBookmark={onToggleBookmark}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-20 animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
});
