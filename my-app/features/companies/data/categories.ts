export const COMPANY_CATEGORIES = [
  "금융 & 보험",
  "건설",
  "제조",
  "기타",
  "숙박 & 음식점",
  "유통",
  "서비스",
  "부동산 & 임대",
  "환경",
  "광",
  "운수",
  "방송통신",
  "전기 & 수도",
] as const;

export const INDUSTRY_CHAMBER_CATEGORY_MAP = {
  "금융 및 보험업": "금융 & 보험",
  건설업: "건설",
  제조업: "제조",
  기타: "기타",
  "숙박 및 음식점업": "숙박 & 음식점",
  "도매 및 소매업": "유통",
  "전문과학 및 기술서비스업": "서비스",
  "부동산업 및 임대업": "부동산 & 임대",
  "사업시설관리 및 사업지원서비스업": "서비스",
  "하수폐기물처리원료재생 및 환경복원업": "환경",
  광업: "광",
  운수업: "운수",
  "출판영상방송통신 및 정보서비스업": "방송통신",
  "전기가스증기 및 수도사업": "전기 & 수도",
} as const satisfies Record<string, (typeof COMPANY_CATEGORIES)[number]>;

export const COMPANY_REGIONS = ["남양주", "구리", "가평"] as const;

export const COMPANY_SORTS = ["relevance", "name", "employees"] as const;
