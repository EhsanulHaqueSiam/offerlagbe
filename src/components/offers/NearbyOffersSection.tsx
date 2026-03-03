import { Link } from "@tanstack/react-router";
import { CATEGORY_MAP } from "@/lib/categories";
import { useTranslation } from "@/lib/i18n";
import type { Offer } from "@/types/offer";
import type { CategoryId } from "@/lib/categories";

interface NearbyOffersSectionProps {
  offers: Offer[];
}

export function NearbyOffersSection({ offers }: NearbyOffersSectionProps) {
  const { t } = useTranslation();

  if (offers.length === 0) {
    return (
      <div className="glass rounded-2xl p-4 text-center">
        <p className="text-xs text-slate-500">{t("nearby.empty")}</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        </svg>
        <h3 className="text-sm font-semibold text-white">{t("nearby.title")}</h3>
        <span className="text-[10px] text-slate-500">{t("nearby.within")}</span>
      </div>

      <div className="space-y-2">
        {offers.slice(0, 3).map((offer) => {
          const category = CATEGORY_MAP[offer.category as CategoryId];
          return (
            <Link
              key={offer._id}
              to="/offer/$id"
              params={{ id: offer._id }}
              className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/30 hover:bg-slate-800/50 border border-slate-700/20 transition-colors"
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-sm"
                style={{ backgroundColor: `${category?.color ?? "#64748b"}12` }}
              >
                {category?.emoji ?? "🏷️"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white truncate">{offer.title}</p>
                <p className="text-[10px] text-slate-500 truncate">{offer.storeName}</p>
              </div>
              <span
                className="text-xs font-bold flex-shrink-0"
                style={{ color: category?.color ?? "#64748b" }}
              >
                {offer.discountPercent}%
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
