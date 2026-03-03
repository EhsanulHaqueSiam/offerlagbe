import type { Id } from "../../convex/_generated/dataModel";

/**
 * Client-side offer type. Note: `resolveOffer` on the server strips
 * `submitterId`, `imageStorageIds`, and `logoStorageId` before sending
 * to the client, replacing them with resolved `logoUrl` and `imageUrls`.
 */
export interface Offer {
  _id: Id<"offers">;
  _creationTime: number;
  title: string;
  description?: string;
  category: string;
  discountPercent: number;
  originalPrice?: number;
  offerPrice?: number;
  latitude: number;
  longitude: number;
  address?: string;
  googleMapsUrl?: string;
  storeName: string;
  logoUrl: string | null;
  imageUrls: string[];
  upvotes: number;
  downvotes: number;
  status: "active" | "flagged" | "removed" | "expired";
  startDate?: string;
  endDate?: string;
  views?: number;
  couponCode?: string;
  tags?: string[];
  commentCount?: number;
  verificationCount?: number;
  createdAt: number;
}

export type SortOption = "newest" | "nearest" | "discount" | "trusted";
