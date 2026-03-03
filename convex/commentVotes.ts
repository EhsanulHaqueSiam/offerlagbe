import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { isValidVisitorId, validateVisitorId } from "./validators";

export const getVisitorCommentVote = query({
  args: {
    commentId: v.id("comments"),
    visitorId: v.string(),
  },
  handler: async (ctx, args) => {
    if (!isValidVisitorId(args.visitorId)) return false;
    const existing = await ctx.db
      .query("commentVotes")
      .withIndex("by_visitor_comment", (q) => q.eq("visitorId", args.visitorId).eq("commentId", args.commentId))
      .first();
    return existing !== null;
  },
});

export const toggleCommentVote = mutation({
  args: {
    commentId: v.id("comments"),
    visitorId: v.string(),
  },
  handler: async (ctx, args) => {
    validateVisitorId(args.visitorId);

    // Rate limit: max 30 comment votes per visitor per hour
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const recentVotes = await ctx.db
      .query("commentVotes")
      .withIndex("by_visitor_comment", (q) => q.eq("visitorId", args.visitorId))
      .collect();
    const recentCount = recentVotes.filter((v) => v.createdAt > oneHourAgo).length;
    if (recentCount >= 30) {
      throw new Error("Too many votes. Please wait.");
    }

    const existing = await ctx.db
      .query("commentVotes")
      .withIndex("by_visitor_comment", (q) => q.eq("visitorId", args.visitorId).eq("commentId", args.commentId))
      .first();

    const comment = await ctx.db.get(args.commentId);
    if (!comment) throw new Error("Comment not found");

    if (existing) {
      await ctx.db.delete(existing._id);
      await ctx.db.patch(args.commentId, {
        upvotes: Math.max(0, (comment.upvotes ?? 0) - 1),
      });
      return "removed";
    }

    await ctx.db.insert("commentVotes", {
      commentId: args.commentId,
      visitorId: args.visitorId,
      createdAt: Date.now(),
    });
    await ctx.db.patch(args.commentId, {
      upvotes: (comment.upvotes ?? 0) + 1,
    });
    return "added";
  },
});
