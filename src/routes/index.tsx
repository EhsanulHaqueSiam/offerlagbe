import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { api } from "../../convex/_generated/api";
import { OfferMap } from "@/components/map/OfferMap";
import { Header } from "@/components/ui/Header";
import { Sidebar } from "@/components/ui/Sidebar";
import type { PriceRange, DateFilter } from "@/components/ui/Sidebar";
import { LocationSettings } from "@/components/ui/LocationSettings";
import {
  getUserLocation,
  setUserLocation as saveUserLocation,
  getLocationWithFallback,
  getDistanceKm,
  type UserLocation,
} from "@/lib/location";
import { getBookmarks, toggleBookmark } from "@/lib/bookmarks";
import { cacheOffers } from "@/lib/offlineStore";
import { useOfflineOffers } from "@/hooks/useOfflineOffers";
import { toast } from "@/lib/toast";
import { useTranslation } from "@/lib/i18n";
import { useNewOfferNotification } from "@/hooks/useNewOfferNotification";
import type { Offer, SortOption } from "@/types/offer";
import type { CategoryId } from "@/lib/categories";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const { t } = useTranslation();
  const allOffers = useQuery(api.offers.list, {}) as Offer[] | undefined;
  const [activeCategories, setActiveCategories] = useState<Set<CategoryId>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [showLocationSettings, setShowLocationSettings] = useState(false);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(getUserLocation);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);

  // New feature states
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [nearMeActive, setNearMeActive] = useState(false);
  const [bookmarkVersion, setBookmarkVersion] = useState(0);
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [priceRange, setPriceRange] = useState<PriceRange>("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");

  // Offline support
  const { cachedOffers, isOffline } = useOfflineOffers();

  // Cache offers to IndexedDB whenever allOffers updates
  useEffect(() => {
    if (allOffers && allOffers.length > 0) {
      cacheOffers(allOffers).catch(() => {});
    }
  }, [allOffers]);

  // Compute trending + bestThisWeek client-side (saves 2 Convex subscriptions)
  const trendingOffers = useMemo(() => {
    if (!allOffers) return [];
    const cutoff = Date.now() - 48 * 60 * 60 * 1000;
    return allOffers
      .filter((o) => o.createdAt >= cutoff && (!o.endDate || new Date(o.endDate).getTime() >= Date.now()))
      .sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes))
      .slice(0, 5);
  }, [allOffers]);

  const bestThisWeek = useMemo(() => {
    if (!allOffers) return [];
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return allOffers
      .filter((o) => o.createdAt >= cutoff && (!o.endDate || new Date(o.endDate).getTime() >= Date.now()))
      .sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes))
      .slice(0, 10);
  }, [allOffers]);

  // Live notification when new offers are added
  useNewOfferNotification(allOffers, setSelectedOffer);

  // Ask for location on first visit if not already saved
  useEffect(() => {
    if (userLocation) return;
    let cancelled = false;
    getLocationWithFallback().then((loc) => {
      if (cancelled || !loc) return;
      const newLoc: UserLocation = {
        latitude: loc.latitude,
        longitude: loc.longitude,
        label: "Current Location",
      };
      saveUserLocation(newLoc);
      setUserLocation(newLoc);
    });
    return () => {
      cancelled = true;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const searchResults = useQuery(
    api.offers.search,
    searchTerm.trim().length >= 2 ? { searchTerm: searchTerm.trim() } : "skip",
  ) as Offer[] | undefined;

  // Bookmark IDs (re-computed when bookmarkVersion changes)
  const bookmarkedIds = useMemo(() => {
    void bookmarkVersion;
    return new Set(getBookmarks());
  }, [bookmarkVersion]);

  const handleToggleBookmark = useCallback((id: string) => {
    toggleBookmark(id);
    setBookmarkVersion((v) => v + 1);
  }, []);

  const effectiveOffers = isOffline ? cachedOffers : (allOffers ?? []);

  const filteredOffers = useMemo(() => {
    let offers = searchTerm.trim().length >= 2
      ? searchResults ?? []
      : effectiveOffers;

    // Category filter
    if (activeCategories.size > 0) {
      offers = offers.filter((o) =>
        activeCategories.has(o.category as CategoryId),
      );
    }

    // Near Me filter (5km radius)
    if (nearMeActive && userLocation) {
      offers = offers.filter((o) => {
        const dist = getDistanceKm(
          userLocation.latitude,
          userLocation.longitude,
          o.latitude,
          o.longitude,
        );
        return dist <= 5;
      });
    }

    // Saved only filter
    if (showSavedOnly) {
      offers = offers.filter((o) => bookmarkedIds.has(o._id));
    }

    // Price range filter
    if (priceRange !== "all") {
      offers = offers.filter((o) => {
        const price = o.offerPrice ?? o.originalPrice;
        if (price === undefined) return false;
        if (priceRange === "0-500") return price <= 500;
        if (priceRange === "500-2000") return price > 500 && price <= 2000;
        if (priceRange === "2000-5000") return price > 2000 && price <= 5000;
        return price > 5000;
      });
    }

    // Date range filter
    if (dateFilter !== "all") {
      const now = Date.now();
      const cutoffs = {
        today: now - 24 * 60 * 60 * 1000,
        week: now - 7 * 24 * 60 * 60 * 1000,
        month: now - 30 * 24 * 60 * 60 * 1000,
      };
      offers = offers.filter((o) => o.createdAt >= cutoffs[dateFilter]);
    }

    // Sort
    const sorted = [...offers];
    switch (sortBy) {
      case "nearest":
        if (userLocation) {
          sorted.sort((a, b) => {
            const dA = getDistanceKm(userLocation.latitude, userLocation.longitude, a.latitude, a.longitude);
            const dB = getDistanceKm(userLocation.latitude, userLocation.longitude, b.latitude, b.longitude);
            return dA - dB;
          });
        }
        break;
      case "discount":
        sorted.sort((a, b) => b.discountPercent - a.discountPercent);
        break;
      case "trusted":
        sorted.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
        break;
      case "newest":
      default:
        sorted.sort((a, b) => b.createdAt - a.createdAt);
        break;
    }

    return sorted;
  }, [effectiveOffers, searchResults, activeCategories, searchTerm, sortBy, nearMeActive, userLocation, showSavedOnly, bookmarkedIds, priceRange, dateFilter]);

  const handleToggleCategory = useCallback((id: CategoryId) => {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleOfferClick = useCallback((offer: Offer) => {
    setSelectedOffer(offer);
  }, []);

  const handleToggleNearMe = useCallback(() => {
    if (!userLocation) {
      setShowLocationSettings(true);
      toast(t("toast.setLocationFirst"), "info");
      return;
    }
    setNearMeActive((v) => !v);
  }, [userLocation, t]);

  const handleToggleSaved = useCallback(() => {
    setShowSavedOnly((v) => !v);
  }, []);

  // Loading state (skip if offline with cached data)
  if (allOffers === undefined && !isOffline) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-3 animate-fade-in">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-sm text-slate-400 font-medium">{t("loading.offers")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      {/* Offline banner */}
      {isOffline && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500/90 text-amber-950 text-xs font-medium text-center py-1.5">
          {t("offline.banner")}
        </div>
      )}

      <OfferMap
        offers={filteredOffers}
        userLocation={userLocation}
        selectedOffer={selectedOffer}
        onSelectOffer={setSelectedOffer}
        onBookmarkChange={() => setBookmarkVersion((v) => v + 1)}
      />
      <Header
        onOpenLocationSettings={() => setShowLocationSettings(true)}
        userLocation={userLocation}
      />
      <Sidebar
        offers={filteredOffers}
        activeCategories={activeCategories}
        onToggleCategory={handleToggleCategory}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        userLocation={userLocation}
        onOfferClick={handleOfferClick}
        sortBy={sortBy}
        onSortChange={setSortBy}
        nearMeActive={nearMeActive}
        onToggleNearMe={handleToggleNearMe}
        showSavedOnly={showSavedOnly}
        onToggleSaved={handleToggleSaved}
        bookmarkedIds={bookmarkedIds}
        onToggleBookmark={handleToggleBookmark}
        trendingOffers={trendingOffers}
        bestThisWeek={bestThisWeek}
        priceRange={priceRange}
        onPriceRangeChange={setPriceRange}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
      />

      {showLocationSettings && (
        <LocationSettings
          onClose={() => setShowLocationSettings(false)}
          onLocationChange={setUserLocation}
        />
      )}
    </div>
  );
}
