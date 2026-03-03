import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { validateVisitorId, isValidVisitorId } from "./validators";

const AUTO_FLAG_THRESHOLD = 5;

export const getVisitorReport = query({
  args: {
    offerId: v.id("offers"),
    visitorId: v.string(),
  },
  handler: async (ctx, args) => {
    if (!isValidVisitorId(args.visitorId)) return false;
    const existing = await ctx.db
      .query("reports")
      .withIndex("by_visitor_offer", (q) =>
        q.eq("visitorId", args.visitorId).eq("offerId", args.offerId),
      )
      .first();
    return existing !== null;
  },
});

export const getReportCount = query({
  args: { offerId: v.id("offers") },
  handler: async (ctx, args) => {
    const reports = await ctx.db
      .query("reports")
      .withIndex("by_offer", (q) => q.eq("offerId", args.offerId))
      .collect();
    return reports.length;
  },
});

export const report = mutation({
  args: {
    offerId: v.id("offers"),
    visitorId: v.string(),
    reason: v.union(
      v.literal("spam"),
      v.literal("fake"),
      v.literal("expired"),
      v.literal("inappropriate"),
    ),
  },
  handler: async (ctx, args) => {
    validateVisitorId(args.visitorId);
    // Idempotent: one report per visitor per offer
    const existing = await ctx.db
      .query("reports")
      .withIndex("by_visitor_offer", (q) =>
        q.eq("visitorId", args.visitorId).eq("offerId", args.offerId),
      )
      .first();

    if (existing) {
      return "already_reported";
    }

    await ctx.db.insert("reports", {
      offerId: args.offerId,
      visitorId: args.visitorId,
      reason: args.reason,
      createdAt: Date.now(),
    });

    // Auto-flag if threshold reached
    const allReports = await ctx.db
      .query("reports")
      .withIndex("by_offer", (q) => q.eq("offerId", args.offerId))
      .collect();

    if (allReports.length >= AUTO_FLAG_THRESHOLD) {
      const offer = await ctx.db.get(args.offerId);
      if (offer && offer.status === "active") {
        await ctx.db.patch(args.offerId, { status: "flagged" });
      }
    }

    return "reported";
  },
});
