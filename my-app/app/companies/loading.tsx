import { CompanyLoadingSpinner } from "@/features/companies/components/company-loading-spinner";

export default function Loading() {
  return (
    <main className="min-h-screen px-5 py-6 sm:px-8">
      <CompanyLoadingSpinner />
    </main>
  );
}
