import { CompanyLoadingSpinner } from "@/features/companies/components/company-loading-spinner";

export default function Loading() {
  return (
    <CompanyLoadingSpinner
      label="검색 결과를 불러오는 중"
      variant="overlay"
    />
  );
}
