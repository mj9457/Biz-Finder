export const SITE_NAME = "경기동부상공회의소";
export const SITE_TITLE = "경기동부상공회의소 회원사 검색 서비스";

const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
const vercelSiteUrl =
  process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;

export const SITE_URL = (
  configuredSiteUrl ||
  (vercelSiteUrl ? `https://${vercelSiteUrl}` : "http://localhost:3000")
).replace(/\/$/, "");

export function absoluteUrl(path: string) {
  return new URL(path, `${SITE_URL}/`).toString();
}
