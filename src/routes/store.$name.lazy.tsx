import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { useEffect } from "react";
import type { CategoryId } from "@/lib/categories";
import { CATEGORY_MAP } from "@/lib/categories";
import { useTranslation } from "@/lib/i18n";
import type { Offer } from "@/types/offer";
import { api } from "../../convex/_generated/api";

export const Route = createLazyFileRoute("/store/$name")({
  component: StoreDetailPage,
});

function StoreDetailPage() {
  const { t } = useTranslation();
  const { name } = Route.useParams();
  const offers = useQuery(api.offers.listByStore, { storeName: name }) as Offer[] | undefined;

  useEffect(() => {
    document.title = `${name} — OfferLagbe`;
    return () => {
      document.title = "OfferLagbe";
    };
  }, [name]);

  return (
    <div className="min-h-screen bg-slate-950 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-50 glass-strong border-b border-slate-700/20">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            to="/"
            className="w-8 h-8 rounded-xl bg-slate-800/60 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold text-white truncate">{name}</h1>
            <p className="text-[11px] text-slate-500">
              {offers ? t("store.offerCount").replace("{n}", String(offers.length)) : "..."}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4">
        {offers === undefined ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-24 rounded-2xl" />
            ))}
          </div>
        ) : offers.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-500 text-sm">{t("store.noOffers")}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {offers.map((offer) => {
              const category = CATEGORY_MAP[offer.category as CategoryId];
              return (
                <Link
                  key={offer._id}
                  to="/offer/$id"
                  params={{ id: offer._id }}
                  className="block bg-slate-800/30 hover:bg-slate-800/50 border border-slate-700/20 hover:border-slate-700/40 rounded-2xl p-3.5 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-base"
                      style={{ backgroundColor: `${category?.color ?? "#64748b"}12` }}
                    >
                      {offer.logoUrl ? (
                        <img
                          src={offer.logoUrl}
                          alt=""
                          className="w-full h-full rounded-xl object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        (category?.emoji ?? "🏷️")
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: category?.color ?? "#64748b" }}
                        />
                        <span className="text-[10px] text-slate-500 font-medium">
                          {category?.label ?? offer.category}
                        </span>
                      </div>
                      <h4 className="text-[13px] font-medium text-white truncate">{offer.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-bold" style={{ color: category?.color ?? "#64748b" }}>
                          {offer.discountPercent}% {t("offer.off")}
                        </span>
                        {offer.offerPrice != null && (
                          <span className="text-[10px] text-emerald-400 font-semibold">
                            ৳{offer.offerPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
