import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CATEGORIES, type CategoryKey } from "../types";

interface CategoryTabsProps {
  activeCategory: CategoryKey;
  onSelectCategory: (key: CategoryKey) => void;
}

export const CategoryTabs = ({
  activeCategory,
  onSelectCategory,
}: CategoryTabsProps) => {
  const tabsScrollRef = useRef<HTMLDivElement>(null);

  const scrollTabs = (amount: number) => {
    tabsScrollRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <div className="flex items-center gap-1 border-b border-gray-200 mb-6">
      <button
        type="button"
        onClick={() => scrollTabs(-200)}
        className="shrink-0 p-1.5 rounded-full text-[#667085] hover:bg-gray-100 hover:text-[#333333] cursor-pointer"
        aria-label="Scroll tabs left"
      >
        <ChevronLeft size={18} />
      </button>

      <div
        ref={tabsScrollRef}
        className="flex flex-1 gap-1 overflow-x-auto scrollbar-hide pb-px"
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            type="button"
            onClick={() => onSelectCategory(cat.key)}
            className={`shrink-0 whitespace-nowrap px-3.5 py-2.5 text-[13px] font-medium border-b-2 -mb-px transition-colors cursor-pointer ${
              activeCategory === cat.key
                ? "border-[#2C9993] text-[#2C9993]"
                : "border-transparent text-[#667085] hover:text-[#333333]"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => scrollTabs(200)}
        className="shrink-0 p-1.5 rounded-full text-[#667085] hover:bg-gray-100 hover:text-[#333333] cursor-pointer"
        aria-label="Scroll tabs right"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
};
