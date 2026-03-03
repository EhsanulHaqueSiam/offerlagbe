export type CategoryId =
  | "food"
  | "electronics"
  | "fashion"
  | "beauty"
  | "home"
  | "sports"
  | "travel"
  | "education"
  | "healthcare"
  | "entertainment"
  | "groceries"
  | "services";

export interface Category {
  id: CategoryId;
  label: string;
  color: string;
  emoji: string;
}

export const CATEGORIES: Category[] = [
  { id: "food", label: "Food & Dining", color: "#ef4444", emoji: "🍔" },
  { id: "electronics", label: "Electronics", color: "#3b82f6", emoji: "📱" },
  { id: "fashion", label: "Fashion", color: "#8b5cf6", emoji: "👗" },
  { id: "beauty", label: "Beauty & Wellness", color: "#ec4899", emoji: "💄" },
  { id: "home", label: "Home & Living", color: "#f59e0b", emoji: "🏠" },
  { id: "sports", label: "Sports & Fitness", color: "#22c55e", emoji: "⚽" },
  { id: "travel", label: "Travel", color: "#06b6d4", emoji: "✈️" },
  { id: "education", label: "Education", color: "#6366f1", emoji: "📚" },
  { id: "healthcare", label: "Healthcare", color: "#14b8a6", emoji: "🏥" },
  {
    id: "entertainment",
    label: "Entertainment",
    color: "#f97316",
    emoji: "🎬",
  },
  { id: "groceries", label: "Groceries", color: "#84cc16", emoji: "🛒" },
  { id: "services", label: "Services", color: "#64748b", emoji: "🔧" },
];

export const CATEGORY_MAP = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
) as Record<CategoryId, Category>;

export function getCategoryColor(categoryId: string): string {
  return CATEGORY_MAP[categoryId as CategoryId]?.color ?? "#64748b";
}
