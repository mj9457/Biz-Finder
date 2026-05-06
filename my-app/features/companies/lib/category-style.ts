import type { CompanyCategory } from "../types";

const categoryStyles: Record<CompanyCategory, string> = {
  제조: "bg-orange-50 text-orange-700 ring-orange-200",
  "유통/물류": "bg-emerald-50 text-emerald-700 ring-emerald-200",
  "건설/부동산": "bg-stone-100 text-stone-700 ring-stone-300",
  여성기업: "bg-rose-50 text-rose-700 ring-rose-200",
  "바이오/헬스케어": "bg-lime-50 text-lime-700 ring-lime-200",
  금융: "bg-blue-50 text-blue-700 ring-blue-200",
  교육: "bg-violet-50 text-violet-700 ring-violet-200",
  "콘텐츠/미디어": "bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200",
  "IT/소프트웨어": "bg-cyan-50 text-cyan-700 ring-cyan-200",
};

const categoryFilterStyles: Record<CompanyCategory, string> = {
  제조: "border-orange-300 bg-orange-50 text-orange-900",
  "유통/물류": "border-emerald-300 bg-emerald-50 text-emerald-900",
  "건설/부동산": "border-stone-300 bg-stone-100 text-stone-900",
  여성기업: "border-rose-300 bg-rose-50 text-rose-900",
  "바이오/헬스케어": "border-lime-300 bg-lime-50 text-lime-900",
  금융: "border-blue-300 bg-blue-50 text-blue-900",
  교육: "border-violet-300 bg-violet-50 text-violet-900",
  "콘텐츠/미디어": "border-fuchsia-300 bg-fuchsia-50 text-fuchsia-900",
  "IT/소프트웨어": "border-cyan-300 bg-cyan-50 text-cyan-900",
};

export function getCategoryBadgeClassName(category: CompanyCategory) {
  return categoryStyles[category];
}

export function getSelectedCategoryFilterClassName(category: CompanyCategory) {
  return categoryFilterStyles[category];
}
