import { Link } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { useEffect, useRef, useState } from "react";
import { Popup } from "react-map-gl/maplibre";
import { isBookmarked as checkBookmarked, toggleBookmark } from "@/lib/bookmarks";
import type { CategoryId } from "@/lib/categories";
import { CATEGORY_MAP } from "@/lib/categories";
import { getDirectionsUrl } from "@/lib/directions";
import { formatOfferDate, isEndingToday, isExpiringSoon } from "@/lib/expiry";
import { useTranslation } from "@/lib/i18n";
import { getWhatsAppShareUrl, shareOffer } from "@/lib/share";
import { toast } from "@/lib/toast";
import type { Offer } from "@/types/offer";
import { api } from "../../../convex/_generated/api";
import { CouponBadge } from "../offers/CouponBadge";
import { ImageLightbox } from "../ui/ImageLightbox";
import { TrustBadge } from "../voting/TrustBadge";
import { VoteButtons } from "../voting/VoteButtons";

interface OfferPopupProps {
  offer: Offer;
  onClose: () => void;
  onBookmarkChange?: () => void;
}

export function OfferPopup({ offer, onClose, onBookmarkChange }: OfferPopupProps) {
  const { t } = useTranslation();
  const category = CATEGORY_MAP[offer.category as CategoryId];
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [bookmarked, setBookmarked] = useState(() => checkBookmarked(offer._id));
  const incrementView = useMutation(api.offers.incrementView);
  const viewedRef = useRef(false);

  // Track view once per session
  useEffect(() => {
    if (viewedRef.current) return;
    const key = `offerlagbe_viewed_${offer._id}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    viewedRef.current = true;
    incrementView({ id: offer._id });
  }, [offer._id, incrementView]);

  const handleBookmark = () => {
    const added = toggleBookmark(offer._id);
    setBookmarked(added);
    toast(added ? t("offer.saved") : t("offer.bookmarkRemoved"), added ? "success" : "info");
    onBookmarkChange?.();
  };

  const shareData = {
    title: offer.title,
    storeName: offer.storeName,
    discountPercent: offer.discountPercent,
    offerId: offer._id,
  };

  return (
    <>
      <Popup
        latitude={offer.latitude}
        longitude={offer.longitude}
        anchor="bottom"
        onClose={onClose}
        offset={20}
        maxWidth="340px"
      >
        <div className="glass-strong rounded-2xl p-4 min-w-[260px] max-w-[340px] animate-scale-in shadow-2xl relative">
          {/* Top right buttons: Bookmark + Close */}
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
            <button
              onClick={handleBookmark}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-800/80 transition-colors hover:bg-slate-700"
              aria-label={bookmarked ? "Remove bookmark" : "Save offer"}
            >
              <svg
                className={`w-3.5 h-3.5 transition-colors ${bookmarked ? "text-pink-400 fill-pink-400" : "text-slate-400 hover:text-pink-300"}`}
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
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              aria-label="Close popup"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Header */}
          <div className="flex items-start gap-3 mb-3 pr-16">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                {category && (
                  <span
                    className="inline-block w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: category.color }}
                  />
                )}
                <span className="text-[11px] text-slate-400 truncate font-medium">
                  {category?.label ?? offer.category}
                </span>
                {offer.status === "flagged" && (
                  <span className="text-[9px] bg-amber-500/15 text-amber-400 px-1.5 py-0.5 rounded-full font-medium">
                    {t("offer.flagged")}
                  </span>
                )}
                {isExpiringSoon(offer.endDate) && (
                  <span className="flex items-center gap-0.5 text-[9px] bg-orange-500/10 text-orange-400 px-1.5 py-0.5 rounded-full font-medium">
                    <span className="w-1 h-1 rounded-full bg-orange-400 animate-pulse" />
                    {isEndingToday(offer.endDate!) ? t("offer.endsToday") : t("offer.expiringSoon")}
                  </span>
                )}
              </div>
              <h3 className="text-sm font-semibold text-white leading-snug">{offer.title}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{offer.storeName}</p>
            </div>
            <div
              className="flex-shrink-0 rounded-xl px-3 py-2 text-center"
              style={{
                backgroundColor: `${category?.color ?? "#64748b"}15`,
                border: `1px solid ${category?.color ?? "#64748b"}30`,
              }}
            >
              <span className="text-lg font-bold leading-none" style={{ color: category?.color ?? "#64748b" }}>
                {offer.discountPercent}%
              </span>
              <span className="block text-[9px] text-slate-500 mt-0.5 font-medium">{t("offer.off")}</span>
            </div>
          </div>

          {/* Description */}
          {offer.description && (
            <p className="text-xs text-slate-300 mb-3 leading-relaxed line-clamp-3">{offer.description}</p>
          )}

          {/* Tags */}
          {offer.tags && offer.tags.length > 0 && (
            <div className="flex gap-1 mb-3 flex-wrap">
              {offer.tags.slice(0, 2).map((tag) => (
                <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-700/40 text-slate-400">
                  {t(`tag.${tag}` as Parameters<typeof t>[0])}
                </span>
              ))}
            </div>
          )}

          {/* Price */}
          {offer.originalPrice != null && (
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-slate-500 line-through">৳{offer.originalPrice.toLocaleString()}</span>
              {offer.offerPrice != null && (
                <span className="text-sm font-bold text-emerald-400">৳{offer.offerPrice.toLocaleString()}</span>
              )}
            </div>
          )}

          {/* Images */}
          {offer.imageUrls.length > 0 && (
            <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1 -mx-1 px-1">
              {offer.imageUrls.map((url: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setLightboxIndex(i)}
                  className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 hover:opacity-80 transition-opacity active:scale-95 ring-1 ring-slate-700/30"
                >
                  <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          )}

          {/* Coupon Code */}
          {offer.couponCode && (
            <div className="mb-3">
              <CouponBadge code={offer.couponCode} compact />
            </div>
          )}

          {/* Location + Directions */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
            <svg
              className="w-3.5 h-3.5 flex-shrink-0 text-slate-500"
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
            <span className="truncate flex-1">{offer.address}</span>
            <a
              href={getDirectionsUrl(offer.latitude, offer.longitude, offer.storeName)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex-shrink-0 text-blue-400 hover:text-blue-300 transition-colors"
              title={t("offer.getDirections")}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
            </a>
          </div>

          {/* Dates */}
          {(offer.startDate || offer.endDate) && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
              <svg
                className="w-3.5 h-3.5 flex-shrink-0 text-slate-500"
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
          {(offer.views ?? 0) > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
              <svg
                className="w-3.5 h-3.5 flex-shrink-0 text-slate-500"
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
                {offer.views} {offer.views === 1 ? "view" : t("offer.views")}
              </span>
            </div>
          )}

          {/* Flagged warning */}
          {offer.status === "flagged" && (
            <div className="bg-amber-500/8 border border-amber-500/20 rounded-xl px-3 py-2 mb-3">
              <p className="text-[11px] text-amber-400 font-medium">{t("offer.flaggedWarning")}</p>
            </div>
          )}

          {/* Share + WhatsApp */}
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => shareOffer(shareData)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-slate-800/60 text-slate-400 hover:bg-indigo-500/10 hover:text-indigo-300 transition-all active:scale-95"
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
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all active:scale-95"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              </svg>
              WhatsApp
            </a>
          </div>

          {/* Trust + Voting */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-700/30">
            <div className="flex items-center gap-2.5">
              <TrustBadge upvotes={offer.upvotes} downvotes={offer.downvotes} />
              <Link
                to="/offer/$id"
                params={{ id: offer._id }}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-indigo-300 transition-colors"
                title={t("comments.title")}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <VoteButtons offerId={offer._id} upvotes={offer.upvotes} downvotes={offer.downvotes} />
              <Link
                to="/offer/$id"
                params={{ id: offer._id }}
                onClick={(e) => e.stopPropagation()}
                className="w-7 h-7 rounded-lg bg-slate-800/60 flex items-center justify-center text-slate-500 hover:text-indigo-300 hover:bg-slate-700 transition-colors"
                aria-label="View full details"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </Popup>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <ImageLightbox images={offer.imageUrls} initialIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />
      )}
    </>
  );
}
