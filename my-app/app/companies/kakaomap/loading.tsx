import { CompanyLoadingSpinner } from "@/features/companies/components/company-loading-spinner";

export default function Loading() {
  return (
    <CompanyLoadingSpinner
      label="카카오맵 대시보드를 불러오는 중"
      variant="overlay"
    />
  );
}
