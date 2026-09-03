# 경기동부상공회의소 회원사 검색 서비스

경기동부상공회의소 회원사를 쉽고 빠르게 찾고, 기업별 상세 정보와 지역 분포를 확인할 수 있는 웹 서비스입니다. 남양주·구리·가평 지역을 중심으로 기업명, 대표자, 업종, 주요 품목 등을 검색할 수 있습니다.

## 주요 기능

- **통합 검색**: 기업명, 대표자명, 업종, 주요 생산품을 기준으로 회원사를 검색합니다.
- **다중 조건 필터**: 지역, 임원사 여부·직책, 업종 분류, 종업원 수 조건을 조합해 결과를 좁힙니다.
- **목록·카드 보기와 정렬**: 표/카드 보기 전환 및 기업명·대표자명 기준 정렬을 제공합니다.
- **기업 상세 페이지**: 대표자, 주소, 연락처, 업종, 주요 품목, 설립일, 종업원 수, 홈페이지 등 기업 정보를 표시합니다.
- **회원사 지도**: Leaflet 및 카카오맵 기반 클러스터 지도에서 회원사 분포와 업종·지역별 현황을 확인합니다.
- **CSV 다운로드**: 현재 검색·필터 결과를 인증 코드 확인 후 CSV 파일로 내려받을 수 있습니다.
- **SEO·PWA 지원**: 구조화 데이터, 사이트맵, 로봇 규칙, 지역/업종별 랜딩 페이지와 설치 가능한 웹 앱 환경을 포함합니다.

## 기술 스택

- Next.js 16 / React 19 / TypeScript
- Tailwind CSS 4
- Supabase (회원사 데이터 조회 및 필터 집계)
- Leaflet, Leaflet MarkerCluster, Kakao Maps JavaScript SDK
- Vercel Analytics, Speed Insights

## 시작하기

### 요구 사항

- Node.js 20 이상
- npm 또는 pnpm
- `companies` 테이블과 아래 마이그레이션이 적용된 Supabase 프로젝트

### 설치 및 실행

```bash
git clone <repository-url>
cd my-app
npm install
```

프로젝트 루트에 `.env.local` 파일을 만들고 필요한 값을 설정합니다.

```dotenv
# 필수: 브라우저에서 공개되어도 되는 Supabase 프로젝트 URL과 anon key
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-key>

# 권장: 배포된 서비스의 정규 URL
NEXT_PUBLIC_SITE_URL=https://<your-domain>

# 카카오맵 페이지 및 기업 상세 지도 사용 시 필요
NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY=<kakao-javascript-key>

# CSV 다운로드 요청 검증용 비밀 코드
COMPANY_CSV_DOWNLOAD_AUTH_CODE=<strong-secret>

# scripts/check-company-websites.mjs에서 --apply 실행 시에만 필요
SUPABASE_SERVICE_ROLE_KEY=<supabase-service-role-key>
```

`NEXT_PUBLIC_*` 값은 클라이언트 번들에 포함됩니다. 서비스 역할 키와 CSV 다운로드 인증 코드는 절대 `NEXT_PUBLIC_` 접두사로 노출하지 말고, 저장소에도 커밋하지 마세요.

```bash
# 개발 서버
npm run dev

# 코드 품질 검사 (ESLint + TypeScript)
npm run check

# 프로덕션 빌드 및 실행
npm run build
npm run start
```

개발 서버는 기본적으로 [http://localhost:3000](http://localhost:3000)에서 실행됩니다. 서비스의 주요 진입점은 `/companies`입니다.

## 주요 경로

| 경로 | 설명 |
| --- | --- |
| `/companies` | 회원사 통합 검색 및 필터링 |
| `/companies/[id]` | 회원사 상세 정보 |
| `/companies/namyangju`, `/companies/guri`, `/companies/gapyeong` | 지역별 검색 랜딩 페이지 |
| `/companies/industry/[slug]` | 업종별 검색 랜딩 페이지 |
| `/companies/map` | Leaflet 기반 회원사 지도 |
| `/companies/kakaomap` | 카카오맵 기반 회원사 지도 |
| `/api/companies/export` | 인증된 CSV 내보내기 API (`POST`) |

## 데이터 및 마이그레이션

회원사 검색은 Supabase의 `public.companies` 테이블을 사용합니다. 애플리케이션은 다음 컬럼을 조회합니다.

`id`, `business_number`, `company_type`, `location`, `industry_chamber`, `industry_code`, `standard_industry`, `company_name`, `ceo_name`, `executive`, `address`, `phone`, `email`, `employee_count`, `main_products`, `established_date`, `website`, `description`, `tags`, `region`, `primary_category`, `latitude`, `longitude`

저장소의 마이그레이션을 Supabase 프로젝트에 적용하세요.

```bash
# Supabase CLI를 프로젝트에 연결한 뒤 실행
npx supabase db push

# 또는 supabase/migrations의 SQL을 Supabase SQL Editor에서 순서대로 실행
```

포함된 마이그레이션은 검색 성능용 인덱스·임원 우선순위와 필터별 집계 RPC(`get_company_filtered_facets`)를 추가합니다. RPC를 아직 적용하지 않은 환경에서도 서비스는 호환 가능한 조회 방식으로 동작하지만, 운영 환경에는 적용을 권장합니다.

Supabase 연결이나 데이터 원본을 사용할 수 없는 경우에는 `features/companies/data/companies.ts`의 로컬 예시 데이터로 일부 화면을 표시합니다. 단, 애플리케이션 시작 자체에는 Supabase URL과 anon key가 필요합니다.

## 운영 도구

등록된 홈페이지 주소를 점검하고 리디렉션된 최종 주소를 확인할 수 있습니다.

```bash
# 결과만 확인 (데이터 변경 없음)
node scripts/check-company-websites.mjs

# 확인된 최종 URL을 DB에 반영
node scripts/check-company-websites.mjs --apply
```

`--apply`는 Supabase 서비스 역할 키를 사용해 데이터를 수정하므로, 점검 결과를 먼저 확인한 뒤 실행하세요.

## 프로젝트 구조

```text
app/                         # 라우트, API, 메타데이터
  companies/                 # 검색·상세·지도·SEO 랜딩 페이지
  api/companies/export/      # CSV 내보내기 API
features/
  companies/                 # 도메인 타입, 쿼리, 필터, 지도 UI
  pwa/                       # 서비스 워커 설치 안내
  seo/                       # JSON-LD 구조화 데이터
lib/                         # Supabase 클라이언트, 사이트·표시 유틸리티
supabase/migrations/         # DB 인덱스 및 RPC 마이그레이션
scripts/                     # 데이터 품질 점검 스크립트
public/                      # 로고, 아이콘, 서비스 워커 등 정적 파일
```

## 배포

Vercel 배포를 기준으로 구성되어 있습니다. 배포 환경에 위의 환경 변수를 모두 등록하고, `NEXT_PUBLIC_SITE_URL`을 운영 도메인으로 설정하세요. `NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY`를 사용하는 경우 카카오 디벨로퍼스 콘솔에 운영 도메인도 등록해야 합니다.

배포 전에는 다음을 확인합니다.

```bash
npm run check
npm run build
```

## 라이선스

이 저장소의 사용 및 배포 권한은 경기동부상공회의소의 정책을 따릅니다.
