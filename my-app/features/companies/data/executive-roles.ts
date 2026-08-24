export const COMPANY_EXECUTIVE_ROLES = [
  "회장",
  "명예회장",
  "부회장",
  "감사",
  "상임의원",
  "경제자문",
  "의원",
  "특별의원",
] as const;

export type CompanyExecutiveRole = (typeof COMPANY_EXECUTIVE_ROLES)[number];

export function normalizeCompanyExecutiveRole(value: string): string {
  const compactValue = value.replace(/\s+/g, "");

  switch (compactValue) {
    case "회장":
      return "회장";
    case "명예회장":
      return "명예회장";
    case "부회장":
      return "부회장";
    case "상임의원":
      return "상임의원";
    case "특별의원":
      return "특별의원";
    case "의원":
      return "의원";
    case "감사":
      return "감사";
    case "경제자문":
      return "경제자문";
    default:
      return value.trim();
  }
}

export function getCompanyExecutiveRoles(value?: string | null) {
  if (!value?.trim()) return [];

  return value
    .split(/[,/|·•\n\r]+/)
    .map((role) => normalizeCompanyExecutiveRole(role.trim()))
    .filter(Boolean);
}
