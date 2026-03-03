import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { useTranslation } from "@/lib/i18n";
import { api } from "../../convex/_generated/api";

export const Route = createLazyFileRoute("/leaderboard")({
  component: LeaderboardPage,
});

function LeaderboardPage() {
  const { t } = useTranslation();
  const leaderboard = useQuery(api.leaderboard.getLeaderboard, {});

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
          <h1 className="text-sm font-semibold text-white">{t("leaderboard.title")}</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4">
        {leaderboard === undefined ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="skeleton h-16 rounded-2xl" />
            ))}
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-500 text-sm">{t("leaderboard.empty")}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((entry, index) => {
              const rank = index + 1;
              const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null;

              return (
                <div
                  key={entry.submitterId}
                  className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-colors ${
                    rank <= 3 ? "bg-indigo-500/5 border-indigo-500/20" : "bg-slate-800/30 border-slate-700/20"
                  }`}
                >
                  {/* Rank */}
                  <div className="w-8 h-8 rounded-lg bg-slate-800/60 flex items-center justify-center flex-shrink-0">
                    {medal ? (
                      <span className="text-base">{medal}</span>
                    ) : (
                      <span className="text-xs font-bold text-slate-400">#{rank}</span>
                    )}
                  </div>

                  {/* Contributor info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                        style={{
                          backgroundColor: `hsl(${parseInt(entry.submitterId.slice(0, 6), 16) % 360}, 60%, 45%)`,
                        }}
                      >
                        {entry.submitterId.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-white">#{entry.submitterId.slice(0, 6)}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {t("leaderboard.offerCount").replace("{n}", String(entry.offerCount))}
                    </p>
                  </div>

                  {/* Upvotes */}
                  <div className="flex items-center gap-1 text-sm font-bold text-emerald-400 flex-shrink-0">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                    </svg>
                    {entry.totalUpvotes}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
