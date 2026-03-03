import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { validateVisitorId } from "./validators";

export const create = mutation({
  args: {
    offerId: v.id("offers"),
    visitorId: v.string(),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    validateVisitorId(args.visitorId);

    const offer = await ctx.db.get(args.offerId);
    if (!offer) throw new Error("Offer not found");

    // Rate limit: 1 photo per visitor per offer
    const existing = await ctx.db
      .query("verificationPhotos")
      .withIndex("by_visitor_offer", (q) => q.eq("visitorId", args.visitorId).eq("offerId", args.offerId))
      .first();

    if (existing) {
      throw new Error("Already verified this offer");
    }

    await ctx.db.insert("verificationPhotos", {
      offerId: args.offerId,
      visitorId: args.visitorId,
      storageId: args.storageId,
      createdAt: Date.now(),
    });

    await ctx.db.patch(args.offerId, {
      verificationCount: (offer.verificationCount ?? 0) + 1,
    });
  },
});

export const listByOffer = query({
  args: { offerId: v.id("offers") },
  handler: async (ctx, args) => {
    const photos = await ctx.db
      .query("verificationPhotos")
      .withIndex("by_offer", (q) => q.eq("offerId", args.offerId))
      .collect();

    const resolved = await Promise.all(
      photos.map(async (photo) => {
        const url = await ctx.storage.getUrl(photo.storageId);
        if (!url) return null;
        return {
          _id: photo._id,
          url,
          createdAt: photo.createdAt,
        };
      }),
    );

    return resolved.filter((p): p is NonNullable<typeof p> => p !== null).sort((a, b) => b.createdAt - a.createdAt);
  },
});
