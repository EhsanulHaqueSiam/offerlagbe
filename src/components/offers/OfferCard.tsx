import { Link } from "@tanstack/react-router";
import { memo } from "react";
import type { CategoryId } from "@/lib/categories";
import { CATEGORY_MAP } from "@/lib/categories";
import { isExpiringSoon } from "@/lib/expiry";
import { useTranslation } from "@/lib/i18n";
import { formatDistance, getDistanceKm, type UserLocation } from "@/lib/location";
import { shareOffer } from "@/lib/share";
import type { Offer } from "@/types/offer";
import { TrustBadge } from "../voting/TrustBadge";
import { CountdownTimer } from "./CountdownTimer";
import { VerificationBadge } from "./VerificationBadge";

interface OfferCardProps {
  offer: Offer;
  userLocation: UserLocation | null;
  onClick?: () => void;
  isBookmarked?: boolean;
  onToggleBookmark?: (id: string) => void;
}

export const OfferCard = memo(function OfferCard({
  offer,
  userLocation,
  onClick,
  isBookmarked,
  onToggleBookmark,
}: OfferCardProps) {
  const { t } = useTranslation();
  const category = CATEGORY_MAP[offer.category as CategoryId];
  const distance = userLocation
    ? getDistanceKm(userLocation.latitude, userLocation.longitude, offer.latitude, offer.longitude)
    : null;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
      className="w-full text-left bg-slate-800/30 hover:bg-slate-800/50 border border-slate-700/20 hover:border-slate-700/40 rounded-2xl p-3.5 transition-all active:scale-[0.98] group cursor-pointer"
    >
      <div className="flex items-start gap-3">
        {/* Logo / Category icon */}
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-base"
          style={{ backgroundColor: `${category?.color ?? "#64748b"}12` }}
        >
          {offer.logoUrl ? (
            <img
              src={offer.logoUrl}
              alt={`${offer.storeName} logo`}
              className="w-full h-full rounded-xl object-cover"
              loading="lazy"
              decoding="async"
              width={44}
              height={44}
            />
          ) : (
            (category?.emoji ?? "🏷️")
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: category?.color ?? "#64748b" }}
            />
            <span className="text-[10px] text-slate-500 truncate font-medium">{offer.storeName}</span>
            {offer.status === "flagged" && (
              <span className="text-[9px] bg-amber-500/15 text-amber-400 px-1.5 py-0.5 rounded-full font-medium">
                {t("offer.flagged")}
              </span>
            )}
            <VerificationBadge upvotes={offer.upvotes} commentCount={offer.commentCount} compact />
            {isExpiringSoon(offer.endDate) && <CountdownTimer endDate={offer.endDate!} compact />}
          </div>
          <h4 className="text-sm font-medium text-white truncate group-hover:text-indigo-300 transition-colors leading-snug">
            {offer.title}
          </h4>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-bold" style={{ color: category?.color ?? "#64748b" }}>
              {offer.discountPercent}% {t("offer.off")}
            </span>
            {offer.couponCode && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md border border-dashed border-amber-500/30 bg-amber-500/5 text-[9px] font-mono text-amber-400">
                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
                {offer.couponCode.length > 8 ? offer.couponCode.slice(0, 8) + "…" : offer.couponCode}
              </span>
            )}
            {offer.originalPrice != null && offer.offerPrice != null && (
              <>
                <span className="text-[10px] text-slate-600 line-through">৳{offer.originalPrice.toLocaleString()}</span>
                <span className="text-[10px] text-emerald-400 font-semibold">৳{offer.offerPrice.toLocaleString()}</span>
              </>
            )}
          </div>
        </div>

        {/* Share + Bookmark */}
        <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              shareOffer({
                title: offer.title,
                storeName: offer.storeName,
                discountPercent: offer.discountPercent,
                offerId: offer._id,
              });
            }}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-800/60 transition-all active:scale-90"
            aria-label="Share offer"
          >
            <svg
              className="w-3.5 h-3.5 text-slate-600 hover:text-indigo-300 transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
          </button>
          {onToggleBookmark && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleBookmark(offer._id);
              }}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-800/60 transition-all active:scale-90"
              aria-label={isBookmarked ? "Remove bookmark" : "Save offer"}
            >
              <svg
                className={`w-3.5 h-3.5 transition-colors ${isBookmarked ? "text-pink-400 fill-pink-400" : "text-slate-600 hover:text-pink-300"}`}
                fill={isBookmarked ? "currentColor" : "none"}
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
          )}
        </div>
      </div>

      {/* Tags */}
      {offer.tags && offer.tags.length > 0 && (
        <div className="flex gap-1 mt-2 flex-wrap">
          {offer.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-700/40 text-slate-400">
              {t(`tag.${tag}` as Parameters<typeof t>[0])}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-700/20">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="flex items-center gap-1 text-[10px] text-slate-500 min-w-0">
            <svg
              className="w-3 h-3 flex-shrink-0"
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
            </svg>
            <span className="truncate">{offer.address || offer.storeName}</span>
          </div>
          {distance !== null && (
            <span className="text-[10px] text-indigo-400 font-medium flex-shrink-0">{formatDistance(distance)}</span>
          )}
          {(offer.views ?? 0) > 0 && (
            <div className="flex items-center gap-0.5 text-[10px] text-slate-500 flex-shrink-0">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              {offer.views}
            </div>
          )}
          {(offer.verificationCount ?? 0) > 0 && (
            <div
              className="flex items-center gap-0.5 text-[10px] text-emerald-500 flex-shrink-0"
              title="Photo verified"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {offer.verificationCount}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <TrustBadge upvotes={offer.upvotes} downvotes={offer.downvotes} compact />
          <Link
            to="/offer/$id"
            params={{ id: offer._id }}
            onClick={(e) => e.stopPropagation()}
            className="w-6 h-6 rounded-md bg-slate-800/60 flex items-center justify-center text-slate-500 hover:text-indigo-300 hover:bg-slate-700 transition-colors"
            aria-label="View details"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
  );
});
