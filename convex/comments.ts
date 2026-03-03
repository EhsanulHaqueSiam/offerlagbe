import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

function validateVisitorId(id: string) {
  if (!/^[a-f0-9]{32}$/.test(id)) throw new Error("Invalid visitor ID");
}

// Truncate visitorId in responses to prevent identity theft
function safeVisitorId(id: string): string {
  return id.slice(0, 8);
}

export const listByOffer = query({
  args: { offerId: v.id("offers") },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_offer", (q) => q.eq("offerId", args.offerId))
      .collect();

    // Sort: top-level by upvotes desc, replies by createdAt asc
    comments.sort((a, b) => {
      if (!a.parentId && !b.parentId) return (b.upvotes ?? 0) - (a.upvotes ?? 0);
      return a.createdAt - b.createdAt;
    });
    // Truncate visitorId to prevent identity theft
    return comments.map((c) => ({ ...c, visitorId: safeVisitorId(c.visitorId) }));
  },
});

export const create = mutation({
  args: {
    offerId: v.id("offers"),
    visitorId: v.string(),
    text: v.string(),
    parentId: v.optional(v.id("comments")),
  },
  handler: async (ctx, args) => {
    validateVisitorId(args.visitorId);
    const text = args.text.trim();
    if (!text || text.length > 500) {
      throw new Error("Comment must be 1-500 characters");
    }

    // Rate limit: max 5 comments per visitor per hour on this offer
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const recentComments = await ctx.db
      .query("comments")
      .withIndex("by_offer", (q) => q.eq("offerId", args.offerId))
      .collect();

    const visitorRecent = recentComments.filter(
      (c) => c.visitorId === args.visitorId && c.createdAt > oneHourAgo,
    );

    if (visitorRecent.length >= 5) {
      throw new Error("Too many comments. Please wait before posting again.");
    }

    // Validate parentId if provided
    if (args.parentId) {
      const parent = await ctx.db.get(args.parentId);
      if (!parent || parent.offerId !== args.offerId) {
        throw new Error("Invalid parent comment");
      }
    }

    return await ctx.db.insert("comments", {
      offerId: args.offerId,
      visitorId: args.visitorId,
      text,
      parentId: args.parentId,
      upvotes: 0,
      createdAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: {
    commentId: v.id("comments"),
    visitorId: v.string(),
  },
  handler: async (ctx, args) => {
    validateVisitorId(args.visitorId);
    const comment = await ctx.db.get(args.commentId);
    if (!comment) return;
    if (comment.visitorId !== args.visitorId) {
      throw new Error("Cannot delete another user's comment");
    }
    await ctx.db.delete(args.commentId);
  },
});
