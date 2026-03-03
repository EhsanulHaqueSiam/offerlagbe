import { useState, useEffect } from "react";
import { getCountdown } from "@/lib/countdown";
import { useTranslation } from "@/lib/i18n";

interface CountdownTimerProps {
  endDate: string;
  compact?: boolean;
}

export function CountdownTimer({ endDate, compact }: CountdownTimerProps) {
  const { t } = useTranslation();
  const [countdown, setCountdown] = useState(() => getCountdown(endDate));

  useEffect(() => {
    const id = setInterval(() => setCountdown(getCountdown(endDate)), 1000);
    return () => clearInterval(id);
  }, [endDate]);

  if (countdown.expired) {
    return (
      <span className="text-[9px] bg-red-500/15 text-red-400 px-1.5 py-0.5 rounded-full font-medium">
        {t("countdown.expired")}
      </span>
    );
  }

  const { days, hours, minutes, seconds } = countdown;

  if (compact) {
    if (days > 2) return null; // Only show countdown within 48h
    return (
      <span className="flex items-center gap-0.5 text-[9px] bg-orange-500/10 text-orange-400 px-1.5 py-0.5 rounded-full font-medium">
        <span className="w-1 h-1 rounded-full bg-orange-400 animate-pulse" />
        {days > 0 && `${days}${t("countdown.days")} `}
        {hours}{t("countdown.hours")} {minutes}{t("countdown.minutes")}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-slate-400 text-xs">{t("countdown.endsIn")}</span>
      <div className="flex items-center gap-1">
        {days > 0 && (
          <span className="bg-orange-500/10 text-orange-400 px-2 py-1 rounded-lg font-bold text-xs">
            {days}{t("countdown.days")}
          </span>
        )}
        <span className="bg-orange-500/10 text-orange-400 px-2 py-1 rounded-lg font-bold text-xs">
          {hours}{t("countdown.hours")}
        </span>
        <span className="bg-orange-500/10 text-orange-400 px-2 py-1 rounded-lg font-bold text-xs">
          {minutes}{t("countdown.minutes")}
        </span>
        {days === 0 && (
          <span className="bg-red-500/10 text-red-400 px-2 py-1 rounded-lg font-bold text-xs tabular-nums">
            {seconds}{t("countdown.seconds")}
          </span>
        )}
      </div>
    </div>
  );
}
