import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  offers: defineTable({
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
    upvotes: v.number(),
    downvotes: v.number(),
    status: v.union(
      v.literal("active"),
      v.literal("flagged"),
      v.literal("removed"),
      v.literal("expired"),
    ),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    views: v.optional(v.number()),
    couponCode: v.optional(v.string()),
    submitterId: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    createdAt: v.number(),
  })
    .index("by_category", ["category"])
    .index("by_status", ["status"])
    .index("by_created", ["createdAt"])
    .index("by_submitter", ["submitterId"])
    .searchIndex("search_title", {
      searchField: "title",
      filterFields: ["category", "status"],
    }),

  votes: defineTable({
    offerId: v.id("offers"),
    visitorId: v.string(),
    voteType: v.union(v.literal("up"), v.literal("down")),
    createdAt: v.number(),
  })
    .index("by_offer", ["offerId"])
    .index("by_visitor_offer", ["visitorId", "offerId"]),

  comments: defineTable({
    offerId: v.id("offers"),
    visitorId: v.string(),
    text: v.string(),
    parentId: v.optional(v.id("comments")),
    upvotes: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_offer", ["offerId"])
    .index("by_parent", ["parentId"]),

  reports: defineTable({
    offerId: v.id("offers"),
    visitorId: v.string(),
    reason: v.union(
      v.literal("spam"),
      v.literal("fake"),
      v.literal("expired"),
      v.literal("inappropriate"),
    ),
    createdAt: v.number(),
  })
    .index("by_offer", ["offerId"])
    .index("by_visitor_offer", ["visitorId", "offerId"]),

  commentVotes: defineTable({
    commentId: v.id("comments"),
    visitorId: v.string(),
    createdAt: v.number(),
  })
    .index("by_comment", ["commentId"])
    .index("by_visitor_comment", ["visitorId", "commentId"]),
});
