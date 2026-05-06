import type { CompanyCategory } from "../types";

const categoryStyles: Record<CompanyCategory, string> = {
  "금융 & 보험": "bg-blue-50 text-blue-700 ring-blue-200",
  건설: "bg-stone-100 text-stone-700 ring-stone-300",
  제조: "bg-orange-50 text-orange-700 ring-orange-200",
  기타: "bg-slate-100 text-slate-700 ring-slate-300",
  "숙박 & 음식점": "bg-amber-50 text-amber-700 ring-amber-200",
  유통: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  서비스: "bg-violet-50 text-violet-700 ring-violet-200",
  "부동산 & 임대": "bg-rose-50 text-rose-700 ring-rose-200",
  환경: "bg-green-50 text-green-700 ring-green-200",
  광: "bg-zinc-100 text-zinc-700 ring-zinc-300",
  운수: "bg-sky-50 text-sky-700 ring-sky-200",
  방송통신: "bg-cyan-50 text-cyan-700 ring-cyan-200",
  "전기 & 수도": "bg-yellow-50 text-yellow-800 ring-yellow-200",
};

const categoryFilterStyles: Record<CompanyCategory, string> = {
  "금융 & 보험": "border-blue-300 bg-blue-50 text-blue-900",
  건설: "border-stone-300 bg-stone-100 text-stone-900",
  제조: "border-orange-300 bg-orange-50 text-orange-900",
  기타: "border-slate-300 bg-slate-100 text-slate-900",
  "숙박 & 음식점": "border-amber-300 bg-amber-50 text-amber-900",
  유통: "border-emerald-300 bg-emerald-50 text-emerald-900",
  서비스: "border-violet-300 bg-violet-50 text-violet-900",
  "부동산 & 임대": "border-rose-300 bg-rose-50 text-rose-900",
  환경: "border-green-300 bg-green-50 text-green-900",
  광: "border-zinc-300 bg-zinc-100 text-zinc-900",
  운수: "border-sky-300 bg-sky-50 text-sky-900",
  방송통신: "border-cyan-300 bg-cyan-50 text-cyan-900",
  "전기 & 수도": "border-yellow-300 bg-yellow-50 text-yellow-900",
};

export function getCategoryBadgeClassName(category: CompanyCategory) {
  return categoryStyles[category];
}

export function getSelectedCategoryFilterClassName(category: CompanyCategory) {
  return categoryFilterStyles[category];
}
