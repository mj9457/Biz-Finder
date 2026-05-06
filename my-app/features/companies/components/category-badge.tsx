import { getCategoryBadgeClassName } from "../lib/category-style";
import type { CompanyCategory } from "../types";

type CategoryBadgeProps = {
  category: CompanyCategory;
  className?: string;
};

export function CategoryBadge({ category, className = "" }: CategoryBadgeProps) {
  return (
    <span
      className={[
        "rounded-md px-2.5 py-1 text-xs font-medium ring-1",
        getCategoryBadgeClassName(category),
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {category}
    </span>
  );
}
