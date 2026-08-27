import { CompanyNotFoundPage } from "@/features/companies/components/company-not-found-page";

export default function NotFound() {
  return (
    <CompanyNotFoundPage
      title="기업 정보를 찾을 수 없습니다."
      description="요청하신 기업이 삭제되었거나 잘못된 주소로 접속하셨습니다. 문제가 계속되면 아래 연락처로 문의해 주세요."
      primaryHref="/companies"
      primaryLabel="기업 목록으로 이동"
      secondaryHref="/companies/kakaomap"
      secondaryLabel="회원사 지도로 이동"
    />
  );
}
