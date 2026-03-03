import type { Id } from "../../convex/_generated/dataModel";

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
  address: string;
  storeName: string;
  logoStorageId?: Id<"_storage">;
  imageStorageIds: Id<"_storage">[];
  logoUrl: string | null;
  imageUrls: string[];
  upvotes: number;
  downvotes: number;
  status: "active" | "flagged" | "removed" | "expired";
  startDate?: string;
  endDate?: string;
  views?: number;
  couponCode?: string;
  submitterId?: string;
  tags?: string[];
  createdAt: number;
}

export type SortOption = "newest" | "nearest" | "discount" | "trusted";
