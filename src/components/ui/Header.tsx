import { memo } from "react";
import { Link } from "@tanstack/react-router";
import { getUserLocation, type UserLocation } from "@/lib/location";
import { useTranslation } from "@/lib/i18n";

interface HeaderProps {
  onOpenLocationSettings: () => void;
  userLocation: UserLocation | null;
}

export const Header = memo(function Header({ onOpenLocationSettings, userLocation }: HeaderProps) {
  const savedLoc = userLocation ?? getUserLocation();
  const { lang, setLang, t } = useTranslation();

  return (
    <header className="absolute top-0 left-0 right-0 z-30 pointer-events-none">
      <div className="flex items-center justify-between gap-2 p-2.5 sm:p-3 md:p-4">
        {/* Logo */}
        <Link
          to="/"
          className="pointer-events-auto glass rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 flex items-center gap-2.5 hover:bg-glass-hover transition-all shadow-lg active:scale-[0.98]"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <svg className="w-[18px] h-[18px] text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-bold text-white leading-none tracking-tight">
              OfferLagbe
            </h1>
            <p className="text-[10px] text-slate-400 leading-none mt-0.5">
              {t("app.tagline")}
            </p>
          </div>
        </Link>

        {/* Right side actions */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Language toggle */}
          <button
            onClick={() => setLang(lang === "en" ? "bn" : "en")}
            className="glass rounded-xl px-2.5 py-2.5 flex items-center gap-1.5 hover:bg-glass-hover transition-all shadow-lg active:scale-[0.98]"
            aria-label="Switch language"
          >
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
            <span className="text-xs font-medium text-slate-300 hidden sm:inline">
              {t("lang.switch")}
            </span>
          </button>

          {/* Location setting */}
          <button
            onClick={onOpenLocationSettings}
            className={`glass rounded-xl px-3 py-2.5 flex items-center gap-2 transition-all shadow-lg active:scale-[0.98] ${
              savedLoc
                ? "hover:bg-glass-hover"
                : "hover:bg-glass-hover ring-1 ring-indigo-500/30"
            }`}
            aria-label="Set location"
          >
            <svg
              className={`w-4 h-4 ${savedLoc ? "text-emerald-400" : "text-slate-400"}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-xs font-medium text-slate-300 hidden sm:inline max-w-[100px] truncate">
              {savedLoc ? savedLoc.label : t("header.setLocation")}
            </span>
          </button>

          {/* Leaderboard */}
          <Link
            to="/leaderboard"
            className="glass rounded-xl px-2.5 py-2.5 flex items-center gap-1.5 hover:bg-glass-hover transition-all shadow-lg active:scale-[0.98]"
            aria-label="Leaderboard"
          >
            <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </Link>

          {/* Add Offer */}
          <Link
            to="/submit"
            className="glass rounded-xl px-3 py-2.5 sm:px-4 flex items-center gap-2 hover:bg-glass-hover transition-all shadow-lg group active:scale-[0.98]"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="text-sm font-medium text-white hidden sm:inline">
              {t("header.addOffer")}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
});
