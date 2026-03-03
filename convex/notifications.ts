import { v } from "convex/values";
import { internalAction, mutation, query } from "./_generated/server";
import { validateVisitorId } from "./validators";

export const subscribe = mutation({
  args: {
    visitorId: v.string(),
    endpoint: v.string(),
    p256dh: v.string(),
    auth: v.string(),
    categories: v.array(v.string()),
    radius: v.number(),
    latitude: v.number(),
    longitude: v.number(),
  },
  handler: async (ctx, args) => {
    validateVisitorId(args.visitorId);

    // Upsert: update existing or create new subscription
    const existing = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_visitor", (q) => q.eq("visitorId", args.visitorId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        endpoint: args.endpoint,
        p256dh: args.p256dh,
        auth: args.auth,
        categories: args.categories,
        radius: args.radius,
        latitude: args.latitude,
        longitude: args.longitude,
      });
    } else {
      await ctx.db.insert("pushSubscriptions", {
        visitorId: args.visitorId,
        endpoint: args.endpoint,
        p256dh: args.p256dh,
        auth: args.auth,
        categories: args.categories,
        radius: args.radius,
        latitude: args.latitude,
        longitude: args.longitude,
        createdAt: Date.now(),
      });
    }
  },
});

export const unsubscribe = mutation({
  args: {
    visitorId: v.string(),
  },
  handler: async (ctx, args) => {
    validateVisitorId(args.visitorId);

    const existing = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_visitor", (q) => q.eq("visitorId", args.visitorId))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});

export const getSubscription = query({
  args: {
    visitorId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_visitor", (q) => q.eq("visitorId", args.visitorId))
      .first();
  },
});

export const sendNotifications = internalAction({
  args: {
    offerId: v.id("offers"),
    category: v.string(),
    latitude: v.number(),
    longitude: v.number(),
    title: v.string(),
    discountPercent: v.number(),
  },
  handler: async (_ctx, args) => {
    // Placeholder: in production, use web-push library with VAPID keys
    // configured as environment variables (VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)
    console.log(`Would send push notifications for offer: ${args.title}`);
  },
});
