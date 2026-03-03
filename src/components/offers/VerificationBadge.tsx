import { useTranslation } from "@/lib/i18n";

interface VerificationBadgeProps {
  upvotes: number;
  commentCount?: number;
  compact?: boolean;
}

export function VerificationBadge({ upvotes, commentCount, compact }: VerificationBadgeProps) {
  const { t } = useTranslation();

  if (upvotes < 5 || (commentCount ?? 0) < 3) {
    return null;
  }

  if (compact) {
    return (
      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[9px] font-medium">
        <svg
          className="w-2.5 h-2.5 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        {t("badge.verified")}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-medium">
      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
      {t("badge.communityVerified")}
    </span>
  );
}
