import type { CategoryId } from "@/lib/categories";
import { CATEGORIES } from "@/lib/categories";

interface CategoryFilterProps {
  activeCategories: Set<CategoryId>;
  onToggle: (id: CategoryId) => void;
}

export function CategoryFilter({ activeCategories, onToggle }: CategoryFilterProps) {
  const allActive = activeCategories.size === 0;

  return (
    <div className="flex flex-wrap gap-1.5 max-h-[88px] overflow-y-auto">
      {CATEGORIES.map((cat) => {
        const isActive = allActive || activeCategories.has(cat.id);
        return (
          <button
            key={cat.id}
            onClick={() => onToggle(cat.id)}
            aria-label={`Filter by ${cat.label}`}
            aria-pressed={isActive}
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium transition-all active:scale-95 whitespace-nowrap ${
              isActive ? "text-white" : "bg-slate-800/40 text-slate-500 hover:text-slate-300 hover:bg-slate-800/60"
            }`}
            style={
              isActive
                ? {
                    backgroundColor: `${cat.color}18`,
                    color: cat.color,
                    boxShadow: `inset 0 0 0 1px ${cat.color}35`,
                  }
                : undefined
            }
          >
            <span className="text-[11px] leading-none">{cat.emoji}</span>
            <span className="hidden sm:inline">{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
}
