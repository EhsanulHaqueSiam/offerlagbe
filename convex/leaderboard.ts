import { v } from "convex/values";
import { query } from "./_generated/server";

export const getLeaderboard = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const offers = await ctx.db.query("offers").collect();
    const limit = Math.min(Math.max(1, args.limit ?? 20), 100);

    // Group by submitterId, sum upvotes
    const contributors = new Map<string, { totalUpvotes: number; offerCount: number }>();

    for (const offer of offers) {
      if (!offer.submitterId || offer.status === "removed") continue;

      const existing = contributors.get(offer.submitterId);
      if (existing) {
        existing.totalUpvotes += offer.upvotes;
        existing.offerCount += 1;
      } else {
        contributors.set(offer.submitterId, {
          totalUpvotes: offer.upvotes,
          offerCount: 1,
        });
      }
    }

    const sorted = Array.from(contributors.entries())
      .map(([submitterId, data]) => ({
        submitterId: submitterId.slice(0, 8),
        totalUpvotes: data.totalUpvotes,
        offerCount: data.offerCount,
      }))
      .sort((a, b) => b.totalUpvotes - a.totalUpvotes)
      .slice(0, limit);

    return sorted;
  },
});
