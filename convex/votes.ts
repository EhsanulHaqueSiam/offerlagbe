import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { isValidVisitorId, validateVisitorId } from "./validators";

// Only flag when truly overwhelmingly negative:
// Need at least 15 total votes AND less than 20% are positive
// This means a small angry mob can't kill a legit offer
const FLAG_MIN_VOTES = 15;
const FLAG_TRUST_THRESHOLD = 20;

// To remove (hide completely): need 30+ votes and <10% trust
// This is the "too much negative" threshold — really extreme
const REMOVE_MIN_VOTES = 30;
const REMOVE_TRUST_THRESHOLD = 10;

// Recovery: if community rallies, unflag when trust rises above 35%
const UNFLAG_TRUST_THRESHOLD = 35;

export const getVisitorVote = query({
  args: {
    offerId: v.id("offers"),
    visitorId: v.string(),
  },
  handler: async (ctx, args) => {
    if (!isValidVisitorId(args.visitorId)) return null;
    const vote = await ctx.db
      .query("votes")
      .withIndex("by_visitor_offer", (q) => q.eq("visitorId", args.visitorId).eq("offerId", args.offerId))
      .first();
    return vote?.voteType ?? null;
  },
});

export const vote = mutation({
  args: {
    offerId: v.id("offers"),
    visitorId: v.string(),
    voteType: v.union(v.literal("up"), v.literal("down")),
  },
  handler: async (ctx, args) => {
    validateVisitorId(args.visitorId);
    const offer = await ctx.db.get(args.offerId);
    if (!offer) throw new Error("Offer not found");

    // Don't allow voting on removed offers
    if (offer.status === "removed") {
      throw new Error("This offer has been removed");
    }

    // Rate limit: max 30 votes per visitor per hour
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const recentVotes = await ctx.db
      .query("votes")
      .withIndex("by_visitor_offer", (q) => q.eq("visitorId", args.visitorId))
      .collect();
    const recentCount = recentVotes.filter((v) => v.createdAt > oneHourAgo).length;
    if (recentCount >= 30) {
      throw new Error("Too many votes. Please wait.");
    }

    // Check for existing vote
    const existing = await ctx.db
      .query("votes")
      .withIndex("by_visitor_offer", (q) => q.eq("visitorId", args.visitorId).eq("offerId", args.offerId))
      .first();

    if (existing) {
      if (existing.voteType === args.voteType) {
        // Toggle off — remove the vote
        await ctx.db.delete(existing._id);
        if (args.voteType === "up") {
          await ctx.db.patch(args.offerId, {
            upvotes: Math.max(0, offer.upvotes - 1),
          });
        } else {
          await ctx.db.patch(args.offerId, {
            downvotes: Math.max(0, offer.downvotes - 1),
          });
        }
        return "removed";
      } else {
        // Switch vote direction
        await ctx.db.patch(existing._id, {
          voteType: args.voteType,
          createdAt: Date.now(),
        });
        if (args.voteType === "up") {
          await ctx.db.patch(args.offerId, {
            upvotes: offer.upvotes + 1,
            downvotes: Math.max(0, offer.downvotes - 1),
          });
        } else {
          await ctx.db.patch(args.offerId, {
            upvotes: Math.max(0, offer.upvotes - 1),
            downvotes: offer.downvotes + 1,
          });
        }
      }
    } else {
      // New vote
      await ctx.db.insert("votes", {
        offerId: args.offerId,
        visitorId: args.visitorId,
        voteType: args.voteType,
        createdAt: Date.now(),
      });
      if (args.voteType === "up") {
        await ctx.db.patch(args.offerId, { upvotes: offer.upvotes + 1 });
      } else {
        await ctx.db.patch(args.offerId, { downvotes: offer.downvotes + 1 });
      }
    }

    // Re-read to get updated counts
    const updated = await ctx.db.get(args.offerId);
    if (!updated) return "voted";

    const total = updated.upvotes + updated.downvotes;
    const trustScore = total > 0 ? (updated.upvotes / total) * 100 : 100;

    // Tier 1: Remove completely — overwhelming negative (30+ votes, <10% trust)
    if (total >= REMOVE_MIN_VOTES && trustScore < REMOVE_TRUST_THRESHOLD && updated.status !== "removed") {
      await ctx.db.patch(args.offerId, { status: "removed" });
    }
    // Tier 2: Flag as suspicious — significant negative (15+ votes, <20% trust)
    else if (total >= FLAG_MIN_VOTES && trustScore < FLAG_TRUST_THRESHOLD && updated.status === "active") {
      await ctx.db.patch(args.offerId, { status: "flagged" });
    }
    // Recovery: community brings trust back up
    else if (updated.status === "flagged" && trustScore >= UNFLAG_TRUST_THRESHOLD) {
      await ctx.db.patch(args.offerId, { status: "active" });
    }

    return "voted";
  },
});
