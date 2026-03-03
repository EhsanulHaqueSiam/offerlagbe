import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useMemo, useRef, useState } from "react";
import MapGL, { Marker } from "react-map-gl/maplibre";
import { CommentSection, CommentSectionSkeleton } from "@/components/offers/CommentSection";
import { CountdownTimer } from "@/components/offers/CountdownTimer";
import { CouponBadge } from "@/components/offers/CouponBadge";
import { ImageCarousel } from "@/components/offers/ImageCarousel";
import { NearbyOffersSection } from "@/components/offers/NearbyOffersSection";
import { ReportModal } from "@/components/offers/ReportModal";
import { RichText } from "@/components/offers/RichText";
import { ImageLightbox } from "@/components/ui/ImageLightbox";
import { TrustBadge } from "@/components/voting/TrustBadge";
import { VoteButtons } from "@/components/voting/VoteButtons";
import { isBookmarked, toggleBookmark } from "@/lib/bookmarks";
import type { CategoryId } from "@/lib/categories";
import { CATEGORY_MAP } from "@/lib/categories";
import { getDirectionsUrl } from "@/lib/directions";
import { formatOfferDate } from "@/lib/expiry";
import { useTranslation } from "@/lib/i18n";
import { getWhatsAppShareUrl, shareOffer } from "@/lib/share";
import { toast } from "@/lib/toast";
import type { Offer } from "@/types/offer";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

export const Route = createFileRoute("/offer/$id")({
  component: OfferDetailPage,
});

function OfferDetailPage() {
  const { t } = useTranslation();
  const { id } = Route.useParams();
  const offer = useQuery(api.offers.getById, {
    id: id as Id<"offers">,
  }) as Offer | null | undefined;

  const incrementView = useMutation(api.offers.incrementView);
  const viewedRef = useRef(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [bookmarkVersion, setBookmarkVersion] = useState(0);
  const [showReport, setShowReport] = useState(false);

  // Lazy load comments via IntersectionObserver
  const [commentsVisible, setCommentsVisible] = useState(false);
  const commentsRef = useRef<HTMLDivElement>(null);

  // Lazy load nearby offers
  const [nearbyVisible, setNearbyVisible] = useState(false);
  const nearbyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const refs = [
      { ref: commentsRef, setter: setCommentsVisible, visible: commentsVisible },
      { ref: nearbyRef, setter: setNearbyVisible, visible: nearbyVisible },
    ];
    const observers: IntersectionObserver[] = [];
    for (const { ref, setter, visible } of refs) {
      if (!ref.current || visible) continue;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setter(true);
        },
        { rootMargin: "200px" },
      );
      observer.observe(ref.current);
      observers.push(observer);
    }
    return () => {
      for (const o of observers) o.disconnect();
    };
  }, [commentsVisible, nearbyVisible]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: bookmarkVersion triggers recomputation
  const bookmarked = useMemo(() => {
    void bookmarkVersion;
    return offer ? isBookmarked(offer._id) : false;
  }, [offer?._id, bookmarkVersion]);

  // Track view once per session
  useEffect(() => {
    if (!offer || viewedRef.current) return;
    const key = `offerlagbe_viewed_${offer._id}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    viewedRef.current = true;
    incrementView({ id: offer._id });
  }, [offer, incrementView]);

  if (offer === undefined) {
    return (
      <div className="min-h-screen bg-slate-950 animate-fade-in">
        <div className="glass-strong sticky top-0 z-50 border-b border-slate-700/30">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 skeleton" />
            <div className="w-32 h-5 skeleton" />
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
          <div className="flex items-start gap-4">
            <div className="flex-1 space-y-2">
              <div className="w-20 h-3 skeleton" />
              <div className="w-full h-6 skeleton" />
              <div className="w-28 h-4 skeleton" />
            </div>
            <div className="w-20 h-16 skeleton rounded-2xl" />
          </div>
          <div className="w-full h-4 skeleton" />
          <div className="w-3/4 h-4 skeleton" />
          <div className="glass rounded-2xl p-4 space-y-3">
            <div className="w-48 h-4 skeleton" />
            <div className="w-full h-32 skeleton rounded-xl" />
            <div className="w-24 h-3 skeleton" />
          </div>
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div className="w-24 h-6 skeleton rounded-full" />
              <div className="flex gap-2">
                <div className="w-16 h-8 skeleton rounded-xl" />
                <div className="w-16 h-8 skeleton rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (offer === null) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
        <p className="text-lg text-slate-400">{t("detail.offerNotFound")}</p>
        <Link to="/" className="text-indigo-400 hover:text-indigo-300 text-sm font-medium">
          {t("detail.backToOffers")}
        </Link>
      </div>
    );
  }

  const category = CATEGORY_MAP[offer.category as CategoryId];

  const shareData = {
    title: offer.title,
    storeName: offer.storeName,
    discountPercent: offer.discountPercent,
    offerId: offer._id,
  };

  const handleBookmark = () => {
    const added = toggleBookmark(offer._id);
    setBookmarkVersion((v) => v + 1);
    toast(added ? t("offer.saved") : t("offer.bookmarkRemoved"), added ? "success" : "info");
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="glass-strong sticky top-0 z-50 border-b border-slate-700/30">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              to="/"
              className="w-8 h-8 rounded-lg bg-slate-800/60 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-base font-semibold text-white truncate">{offer.storeName}</h1>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleBookmark}
              className="w-8 h-8 rounded-lg bg-slate-800/60 flex items-center justify-center transition-colors hover:bg-slate-700"
              aria-label={bookmarked ? "Remove bookmark" : "Save offer"}
            >
              <svg
                className={`w-4 h-4 ${bookmarked ? "text-pink-400 fill-pink-400" : "text-slate-400"}`}
                fill={bookmarked ? "currentColor" : "none"}
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
            </button>
            <button
              onClick={() => shareOffer(shareData)}
              className="w-8 h-8 rounded-lg bg-slate-800/60 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              aria-label="Share offer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
            </button>
            <button
              onClick={() => setShowReport(true)}
              className="w-8 h-8 rounded-lg bg-slate-800/60 flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-slate-700 transition-colors"
              aria-label="Report offer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5 animate-fade-in-up">
        {/* Hero images */}
        {offer.imageUrls.length > 0 && (
          <ImageCarousel images={offer.imageUrls} onImageClick={(i) => setLightboxIndex(i)} />
        )}

        {/* Title + Discount + Badges */}
        <div className="flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: category?.color }} />
              <span className="text-xs text-slate-400 font-medium">{category?.label ?? offer.category}</span>
              {offer.endDate && <CountdownTimer endDate={offer.endDate} />}
            </div>
            <h2 className="text-xl font-bold text-white leading-snug">{offer.title}</h2>
            <Link
              to="/store/$name"
              params={{ name: offer.storeName }}
              className="text-sm text-slate-400 hover:text-indigo-400 transition-colors mt-1 inline-block"
            >
              {offer.storeName}
            </Link>
          </div>
          <div
            className="flex-shrink-0 rounded-2xl px-4 py-3 text-center"
            style={{
              backgroundColor: `${category?.color ?? "#64748b"}15`,
              border: `1px solid ${category?.color ?? "#64748b"}30`,
            }}
          >
            <span className="text-2xl font-bold leading-none" style={{ color: category?.color }}>
              {offer.discountPercent}%
            </span>
            <span className="block text-[10px] text-slate-500 mt-0.5 font-medium">{t("offer.off")}</span>
          </div>
        </div>

        {/* Description */}
        {offer.description && <RichText text={offer.description} />}

        {/* Tags */}
        {offer.tags && offer.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {offer.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700/40 text-slate-400 font-medium"
              >
                {t(`tag.${tag}` as Parameters<typeof t>[0])}
              </span>
            ))}
          </div>
        )}

        {/* Price */}
        {offer.originalPrice != null && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500 line-through">৳{offer.originalPrice.toLocaleString()}</span>
            {offer.offerPrice != null && (
              <span className="text-lg font-bold text-emerald-400">৳{offer.offerPrice.toLocaleString()}</span>
            )}
          </div>
        )}

        {/* Coupon Code */}
        {offer.couponCode && <CouponBadge code={offer.couponCode} />}

        {/* Info cards */}
        <div className="glass rounded-2xl p-4 space-y-3">
          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <svg
              className="w-4 h-4 flex-shrink-0 text-slate-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{offer.address}</span>
          </div>

          {/* Mini map */}
          <div className="h-32 rounded-xl overflow-hidden border border-slate-700/30">
            <MapGL
              initialViewState={{ latitude: offer.latitude, longitude: offer.longitude, zoom: 15 }}
              mapStyle="https://tiles.openfreemap.org/styles/positron"
              style={{ width: "100%", height: "100%" }}
              scrollZoom={false}
              dragPan={false}
              doubleClickZoom={false}
              touchZoomRotate={false}
              keyboard={false}
            >
              <Marker latitude={offer.latitude} longitude={offer.longitude} anchor="bottom">
                <div
                  className="w-6 h-6 rounded-full border-[2.5px] border-white shadow-lg"
                  style={{ backgroundColor: category?.color ?? "#6366f1" }}
                />
              </Marker>
            </MapGL>
          </div>

          {/* Get Directions */}
          <a
            href={getDirectionsUrl(offer.latitude, offer.longitude, offer.storeName)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500/15 transition-all active:scale-[0.98] text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
            {t("offer.getDirections")}
          </a>

          {/* Dates */}
          {(offer.startDate || offer.endDate) && (
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <svg
                className="w-4 h-4 flex-shrink-0 text-slate-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>
                {offer.startDate && formatOfferDate(offer.startDate)}
                {offer.startDate && offer.endDate && " — "}
                {offer.endDate && formatOfferDate(offer.endDate)}
              </span>
            </div>
          )}

          {/* Views */}
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <svg
              className="w-4 h-4 flex-shrink-0 text-slate-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            <span>
              {offer.views ?? 0} {(offer.views ?? 0) === 1 ? "view" : t("offer.views")}
            </span>
          </div>
        </div>

        {/* Flagged warning */}
        {offer.status === "flagged" && (
          <div className="bg-amber-500/8 border border-amber-500/20 rounded-xl px-4 py-3">
            <p className="text-xs text-amber-400 font-medium">{t("offer.flaggedWarning")}</p>
          </div>
        )}

        {/* Trust + Voting */}
        <div className="glass rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <TrustBadge upvotes={offer.upvotes} downvotes={offer.downvotes} />
            <VoteButtons offerId={offer._id} upvotes={offer.upvotes} downvotes={offer.downvotes} />
          </div>

          {/* Share row */}
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-700/30">
            <button
              onClick={() => shareOffer(shareData)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800/60 text-slate-400 hover:bg-indigo-500/10 hover:text-indigo-300 transition-all active:scale-95"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
              {t("offer.share")}
            </button>
            <a
              href={getWhatsAppShareUrl(shareData)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all active:scale-95"
            >
              WhatsApp
            </a>
          </div>
        </div>

        {/* Nearby offers (lazy loaded) */}
        <div ref={nearbyRef}>
          {nearbyVisible ? <NearbyOffersSection offerId={offer._id} /> : <div className="h-20" />}
        </div>

        {/* Comments (lazy loaded) */}
        <div ref={commentsRef}>
          {commentsVisible ? <CommentSection offerId={offer._id} /> : <CommentSectionSkeleton />}
        </div>
      </div>

      {/* Back to offers link */}
      <div className="text-center pt-2 pb-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-400 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          {t("detail.backToOffers")}
        </Link>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <ImageLightbox images={offer.imageUrls} initialIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />
      )}

      {/* Report modal */}
      {showReport && <ReportModal offerId={offer._id} onClose={() => setShowReport(false)} />}
    </div>
  );
}
