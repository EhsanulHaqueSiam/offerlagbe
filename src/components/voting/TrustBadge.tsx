interface TrustBadgeProps {
  upvotes: number;
  downvotes: number;
  compact?: boolean;
}

export function TrustBadge({ upvotes, downvotes, compact }: TrustBadgeProps) {
  const total = upvotes + downvotes;

  // Not enough votes — show "New" badge
  if (total < 3) {
    return (
      <div className={`flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-700/40 ${compact ? "" : "px-2.5 py-1"}`}>
        <span className="text-[10px] font-medium text-slate-400">New</span>
      </div>
    );
  }

  const trustScore = Math.round((upvotes / total) * 100);

  let color: string;
  let bgColor: string;
  let label: string;
  if (trustScore >= 70) {
    color = "text-emerald-400";
    bgColor = "bg-emerald-500/12";
    label = "Trusted";
  } else if (trustScore >= 40) {
    color = "text-amber-400";
    bgColor = "bg-amber-500/12";
    label = "Mixed";
  } else {
    color = "text-red-400";
    bgColor = "bg-red-500/12";
    label = "Disputed";
  }

  if (compact) {
    return (
      <div className={`flex items-center gap-1 px-2 py-0.5 rounded-lg ${bgColor}`}>
        <svg className={`w-3 h-3 ${color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <span className={`text-[10px] font-semibold ${color}`}>{trustScore}%</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl ${bgColor}`}>
      <svg className={`w-3.5 h-3.5 ${color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
      <span className={`text-xs font-semibold ${color}`}>{trustScore}%</span>
      <span className="text-[10px] text-slate-500">{label}</span>
      <span className="text-[10px] text-slate-600">
        ({total})
      </span>
    </div>
  );
}
