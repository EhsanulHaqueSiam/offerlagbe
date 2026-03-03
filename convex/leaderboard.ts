import { v } from "convex/values";
import { query } from "./_generated/server";

export const getLeaderboard = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const offers = await ctx.db.query("offers").collect();
    const limit = Math.min(Math.max(1, args.limit ?? 20), 100);
    const now = Date.now();

    // Group by storeName, aggregate stats
    const stores = new Map<
      string,
      {
        displayName: string;
        totalUpvotes: number;
        totalDownvotes: number;
        offerCount: number;
        activeCount: number;
        bestDiscount: number;
      }
    >();

    for (const offer of offers) {
      if (offer.status === "removed") continue;

      const key = offer.storeName.toLowerCase();
      const existing = stores.get(key);

      if (existing) {
        existing.totalUpvotes += offer.upvotes;
        existing.totalDownvotes += offer.downvotes;
        existing.offerCount += 1;
        if (offer.status === "active" && (!offer.endDate || new Date(offer.endDate).getTime() >= now)) {
          existing.activeCount += 1;
        }
        if (offer.discountPercent > existing.bestDiscount) {
          existing.bestDiscount = offer.discountPercent;
        }
      } else {
        const isActive = offer.status === "active" && (!offer.endDate || new Date(offer.endDate).getTime() >= now);
        stores.set(key, {
          displayName: offer.storeName,
          totalUpvotes: offer.upvotes,
          totalDownvotes: offer.downvotes,
          offerCount: 1,
          activeCount: isActive ? 1 : 0,
          bestDiscount: offer.discountPercent,
        });
      }
    }

    const sorted = Array.from(stores.entries())
      .map(([, data]) => ({
        storeName: data.displayName,
        totalUpvotes: data.totalUpvotes,
        netScore: data.totalUpvotes - data.totalDownvotes,
        offerCount: data.offerCount,
        activeCount: data.activeCount,
        bestDiscount: data.bestDiscount,
      }))
      .filter((s) => s.offerCount >= 1)
      .sort((a, b) => b.netScore - a.netScore)
      .slice(0, limit);

    return sorted;
  },
});
