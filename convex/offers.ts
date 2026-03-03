import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { validateVisitorId, isValidVisitorId } from "./validators";

// Helper to resolve image URLs and strip sensitive fields
async function resolveOffer(ctx: any, offer: any) {
  const logoUrl = offer.logoStorageId
    ? await ctx.storage.getUrl(offer.logoStorageId)
    : null;
  const imageUrls = await Promise.all(
    offer.imageStorageIds.map((id: any) => ctx.storage.getUrl(id)),
  );
  const { submitterId: _s, imageStorageIds: _i, logoStorageId: _l, ...safe } = offer;
  return {
    ...safe,
    logoUrl,
    imageUrls: imageUrls.filter(Boolean) as string[],
  };
}

/** Haversine distance in kilometers between two lat/lng points. */
function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function isActiveOffer(o: { status: string; endDate?: string }, now: number): boolean {
  if (o.status !== "active" && o.status !== "flagged") return false;
  if (o.endDate && new Date(o.endDate).getTime() < now) return false;
  return true;
}

export const list = query({
  args: {
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const offers = args.category
      ? await ctx.db
          .query("offers")
          .withIndex("by_category", (q) => q.eq("category", args.category!))
          .collect()
      : await ctx.db.query("offers").collect();

    const now = Date.now();
    const filtered = offers.filter((o) => isActiveOffer(o, now));
    return Promise.all(filtered.map((o) => resolveOffer(ctx, o)));
  },
});

export const search = query({
  args: {
    searchTerm: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.searchTerm.trim()) return [];

    const results = await ctx.db
      .query("offers")
      .withSearchIndex("search_title", (q) =>
        q.search("title", args.searchTerm).eq("status", "active"),
      )
      .take(20);

    return Promise.all(results.map((o) => resolveOffer(ctx, o)));
  },
});

export const getById = query({
  args: { id: v.id("offers") },
  handler: async (ctx, args) => {
    const offer = await ctx.db.get(args.id);
    if (!offer) return null;
    return resolveOffer(ctx, offer);
  },
});

const ALLOWED_TAGS = ["verified", "limited-stock", "online-only", "in-store-only", "members-only", "new-arrival"];

const VALID_CATEGORIES = ["food", "electronics", "fashion", "beauty", "home", "sports", "travel", "education", "healthcare", "entertainment", "groceries", "services"];

export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    category: v.string(),
    discountPercent: v.number(),
    originalPrice: v.optional(v.number()),
    offerPrice: v.optional(v.number()),
    latitude: v.number(),
    longitude: v.number(),
    address: v.string(),
    storeName: v.string(),
    logoStorageId: v.optional(v.id("_storage")),
    imageStorageIds: v.array(v.id("_storage")),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    couponCode: v.optional(v.string()),
    submitterId: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const title = args.title.trim();
    if (!title || title.length > 150) throw new Error("Title must be 1-150 characters");
    if (args.description && args.description.length > 1000) throw new Error("Description too long");
    const storeName = args.storeName.trim();
    if (!storeName || storeName.length > 100) throw new Error("Invalid store name");
    const address = args.address.trim();
    if (!address || address.length > 300) throw new Error("Invalid address");
    if (args.discountPercent <= 0 || args.discountPercent > 100) throw new Error("Discount must be 1-100");
    if (args.latitude < -90 || args.latitude > 90) throw new Error("Invalid latitude");
    if (args.longitude < -180 || args.longitude > 180) throw new Error("Invalid longitude");
    if (!VALID_CATEGORIES.includes(args.category)) throw new Error("Invalid category");
    if (args.originalPrice !== undefined && (args.originalPrice < 0 || args.originalPrice > 10000000)) throw new Error("Invalid price");
    if (args.offerPrice !== undefined && (args.offerPrice < 0 || args.offerPrice > 10000000)) throw new Error("Invalid price");
    if (args.couponCode && args.couponCode.length > 50) throw new Error("Coupon code too long");
    if (args.imageStorageIds.length > 5) throw new Error("Maximum 5 images");

    if (args.submitterId) validateVisitorId(args.submitterId);

    // Validate dates if provided
    if (args.startDate && isNaN(Date.parse(args.startDate))) throw new Error("Invalid start date");
    if (args.endDate && isNaN(Date.parse(args.endDate))) throw new Error("Invalid end date");

    // Rate limit: max 3 offers per submitter per hour
    if (args.submitterId) {
      const oneHourAgo = Date.now() - 60 * 60 * 1000;
      const bySubmitter = await ctx.db
        .query("offers")
        .withIndex("by_submitter", (q) => q.eq("submitterId", args.submitterId!))
        .collect();
      const recentCount = bySubmitter.filter((o) => o.createdAt > oneHourAgo).length;
      if (recentCount >= 3) {
        throw new Error("Too many offers. Please wait before posting again.");
      }
    }

    const validTags = (args.tags ?? []).filter((t) => ALLOWED_TAGS.includes(t));
    return await ctx.db.insert("offers", {
      title,
      description: args.description?.trim() || undefined,
      category: args.category,
      discountPercent: args.discountPercent,
      originalPrice: args.originalPrice,
      offerPrice: args.offerPrice,
      latitude: args.latitude,
      longitude: args.longitude,
      address,
      storeName,
      logoStorageId: args.logoStorageId,
      imageStorageIds: args.imageStorageIds,
      startDate: args.startDate,
      endDate: args.endDate,
      couponCode: args.couponCode?.trim() || undefined,
      submitterId: args.submitterId,
      tags: validTags.length > 0 ? validTags : undefined,
      upvotes: 0,
      downvotes: 0,
      views: 0,
      status: "active",
      createdAt: Date.now(),
    });
  },
});

export const incrementView = mutation({
  args: {
    id: v.id("offers"),
    visitorId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.visitorId && !isValidVisitorId(args.visitorId)) return;
    const offer = await ctx.db.get(args.id);
    if (!offer) return;
    await ctx.db.patch(args.id, { views: (offer.views ?? 0) + 1 });
  },
});

export const checkDuplicate = query({
  args: {
    title: v.string(),
    latitude: v.number(),
    longitude: v.number(),
  },
  handler: async (ctx, args) => {
    if (!args.title.trim()) return [];

    const results = await ctx.db
      .query("offers")
      .withSearchIndex("search_title", (q) =>
        q.search("title", args.title).eq("status", "active"),
      )
      .take(10);

    const nearby = results.filter(
      (o) => haversineKm(args.latitude, args.longitude, o.latitude, o.longitude) <= 0.2,
    );

    return nearby.map((o) => ({
      _id: o._id,
      title: o.title,
      storeName: o.storeName,
      discountPercent: o.discountPercent,
      address: o.address,
    }));
  },
});

export const generateUploadUrl = mutation({
  args: {
    visitorId: v.string(),
  },
  handler: async (ctx, args) => {
    validateVisitorId(args.visitorId);
    return await ctx.storage.generateUploadUrl();
  },
});

export const listByStore = query({
  args: { storeName: v.string() },
  handler: async (ctx, args) => {
    const offers = await ctx.db.query("offers").collect();
    const now = Date.now();

    const storeOffers = offers.filter(
      (o) =>
        o.storeName === args.storeName && isActiveOffer(o, now),
    );

    storeOffers.sort((a, b) => b.createdAt - a.createdAt);

    return Promise.all(storeOffers.map((o) => resolveOffer(ctx, o)));
  },
});

export const getNearby = query({
  args: { offerId: v.id("offers") },
  handler: async (ctx, args) => {
    const target = await ctx.db.get(args.offerId);
    if (!target) return [];

    const offers = await ctx.db.query("offers").collect();
    const now = Date.now();

    const nearby = offers.filter((o) => {
      if (o._id === args.offerId) return false;
      if (o.status !== "active") return false;
      if (o.endDate && new Date(o.endDate).getTime() < now) return false;
      return haversineKm(target.latitude, target.longitude, o.latitude, o.longitude) <= 0.5;
    });

    nearby.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));

    return Promise.all(nearby.slice(0, 5).map((o) => resolveOffer(ctx, o)));
  },
});
