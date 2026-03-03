import { useTranslation } from "@/lib/i18n";
import type { Offer } from "@/types/offer";

interface DealOfTheDayProps {
  offer: Offer;
  onClick?: () => void;
}

export function DealOfTheDay({ offer, onClick }: DealOfTheDayProps) {
  const { t } = useTranslation();

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/30 rounded-2xl p-3.5 transition-all hover:from-amber-500/15 hover:to-yellow-500/15 hover:border-amber-500/50 active:scale-[0.97] group cursor-pointer"
    >
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-sm" aria-hidden="true">
          {"👑"}
        </span>
        <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wide">
          {t("sidebar.dealOfDay")}
        </span>
      </div>

      <div className="flex items-start gap-3">
        {/* Store logo or fallback */}
        <div className="w-11 h-11 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
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
            <span className="text-base">{"🏷️"}</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-slate-500 font-medium truncate">{offer.storeName}</p>
          <h4 className="text-sm font-medium text-white truncate group-hover:text-amber-300 transition-colors leading-snug">
            {offer.title}
          </h4>
          <span className="text-xs font-bold text-emerald-400 mt-0.5 block">
            {offer.discountPercent}% {t("offer.off")}
          </span>
        </div>
      </div>
    </button>
  );
}
