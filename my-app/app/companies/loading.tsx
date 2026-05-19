import { CompanyLoadingSpinner } from "@/features/companies/components/company-loading-spinner";

export default function Loading() {
  return (
    <CompanyLoadingSpinner label="잠시만 기다려 주세요" variant="overlay" />
  );
}
