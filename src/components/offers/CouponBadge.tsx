import { useState } from "react";
import { useTranslation } from "@/lib/i18n";

interface CouponBadgeProps {
  code: string;
  compact?: boolean;
}

export function CouponBadge({ code, compact }: CouponBadgeProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  if (compact) {
    return (
      <button
        onClick={handleCopy}
        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md border border-dashed border-amber-500/30 bg-amber-500/5 text-[9px] font-mono text-amber-400 hover:bg-amber-500/10 transition-colors active:scale-95"
        title={t("offer.tapToCopy")}
      >
        <svg
          className="w-2.5 h-2.5 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
          />
        </svg>
        <span className="truncate max-w-[60px]">{copied ? t("offer.codeCopied") : code}</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2.5 w-full px-3.5 py-2.5 rounded-xl border border-dashed border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 transition-all active:scale-[0.98] group"
    >
      <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
        <svg
          className="w-3.5 h-3.5 text-amber-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
          />
        </svg>
      </div>
      <div className="flex-1 text-left min-w-0">
        <p className="text-[10px] text-slate-500 font-medium">{t("offer.couponCode")}</p>
        <p className="text-sm font-mono font-bold text-amber-300 tracking-wider truncate">{code}</p>
      </div>
      <div className="flex-shrink-0 px-2.5 py-1 rounded-lg bg-amber-500/10 text-[10px] font-medium text-amber-400 group-hover:bg-amber-500/20 transition-colors">
        {copied ? (
          t("offer.codeCopied")
        ) : (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        )}
      </div>
    </button>
  );
}
