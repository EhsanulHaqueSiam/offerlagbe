import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { getVisitorId } from "@/lib/visitor";
import { toast } from "@/lib/toast";
import type { Id } from "../../../convex/_generated/dataModel";
import { useState, useRef, useCallback } from "react";

interface VoteButtonsProps {
  offerId: Id<"offers">;
  upvotes: number;
  downvotes: number;
}

export function VoteButtons({ offerId, upvotes, downvotes }: VoteButtonsProps) {
  const visitorId = getVisitorId();
  const currentVote = useQuery(api.votes.getVisitorVote, { offerId, visitorId });
  const voteMutation = useMutation(api.votes.vote);
  const [loading, setLoading] = useState(false);
  const lastVoteTime = useRef(0);

  const handleVote = useCallback(
    async (voteType: "up" | "down") => {
      if (loading) return;

      // Debounce: 1 second between votes
      const now = Date.now();
      if (now - lastVoteTime.current < 1000) return;
      lastVoteTime.current = now;

      setLoading(true);
      try {
        const result = await voteMutation({ offerId, visitorId, voteType });
        if (result === "removed") {
          toast("Vote removed", "info");
        } else {
          toast(
            voteType === "up" ? "Marked as legit!" : "Reported as false",
            voteType === "up" ? "success" : "info",
          );
        }
      } catch {
        toast("Could not vote. Try again.", "error");
      } finally {
        setLoading(false);
      }
    },
    [loading, offerId, visitorId, voteMutation],
  );

  return (
    <div className="flex items-center gap-1.5">
      {/* Upvote */}
      <button
        onClick={() => handleVote("up")}
        disabled={loading}
        aria-label={`Upvote this offer. ${upvotes} upvotes.`}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all active:scale-95 ${
          currentVote === "up"
            ? "bg-emerald-500/20 text-emerald-400 shadow-sm shadow-emerald-500/10"
            : "bg-slate-800/60 text-slate-400 hover:bg-emerald-500/10 hover:text-emerald-300"
        } disabled:opacity-40 disabled:pointer-events-none`}
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
        </svg>
        <span>{upvotes}</span>
      </button>

      {/* Downvote */}
      <button
        onClick={() => handleVote("down")}
        disabled={loading}
        aria-label={`Downvote this offer. ${downvotes} downvotes.`}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all active:scale-95 ${
          currentVote === "down"
            ? "bg-red-500/20 text-red-400 shadow-sm shadow-red-500/10"
            : "bg-slate-800/60 text-slate-400 hover:bg-red-500/10 hover:text-red-300"
        } disabled:opacity-40 disabled:pointer-events-none`}
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
        <span>{downvotes}</span>
      </button>
    </div>
  );
}
