export function OfferCardSkeleton() {
  return (
    <div className="w-full bg-slate-800/30 border border-slate-700/20 rounded-2xl p-3.5">
      <div className="flex items-start gap-3">
        {/* Logo placeholder */}
        <div className="w-11 h-11 rounded-xl skeleton flex-shrink-0" />

        <div className="flex-1 min-w-0">
          {/* Store name line */}
          <div className="h-2.5 w-20 skeleton rounded-full mb-2" />
          {/* Title line */}
          <div className="h-3.5 w-3/4 skeleton rounded-full mb-2" />
          {/* Discount line */}
          <div className="h-3 w-1/3 skeleton rounded-full" />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-700/20">
        <div className="flex items-center gap-2.5">
          {/* Address placeholder */}
          <div className="h-2.5 w-24 skeleton rounded-full" />
        </div>
        {/* Trust badge placeholder */}
        <div className="h-5 w-14 skeleton rounded-full" />
      </div>
    </div>
  );
}
