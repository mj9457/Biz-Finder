import type { CompanyEmployeeRange, CompanyRegion } from "../types";
import type { CompanyExecutiveRole } from "../data/executive-roles";

export function getExecutiveRoleKey(roles: CompanyExecutiveRole[]) {
  return [...roles].toSorted((a, b) => a.localeCompare(b, "ko-KR")).join("|");
}

export function getCategoryFacetContextKey(
  region: CompanyRegion | "",
  employeeRange: CompanyEmployeeRange | "",
  roles: CompanyExecutiveRole[],
) {
  return `${region || "*"}::${employeeRange || "*"}::${getExecutiveRoleKey(roles)}`;
}
