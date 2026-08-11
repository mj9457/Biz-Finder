"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const COMPANY_LIST_PATH = "/companies";

function shouldGoBack() {
  if (typeof window === "undefined") {
    return false;
  }

  if (!document.referrer) {
    return false;
  }

  try {
    const referrerUrl = new URL(document.referrer);
    return referrerUrl.origin === window.location.origin;
  } catch {
    return false;
  }
}

export function CompanyBackButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        if (shouldGoBack()) {
          router.back();
          return;
        }

        router.push(COMPANY_LIST_PATH);
      }}
      className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-[0_2px_6px_rgb(15_23_42_/_0.06)] transition hover:border-primary hover:text-primary hover:shadow-sm"
    >
      <ChevronLeft className="size-4" aria-hidden="true" />
      목록으로
    </button>
  );
}
