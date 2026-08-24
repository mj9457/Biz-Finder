import {
  Award,
  BriefcaseBusiness,
  ClipboardCheck,
  Crown,
  Lightbulb,
  Star,
  UserRound,
  UsersRound,
} from "lucide-react";
import {
  COMPANY_EXECUTIVE_ROLES,
  getCompanyExecutiveRoles,
} from "../data/executive-roles";
import type { CompanyExecutiveRole } from "../data/executive-roles";

const EXECUTIVE_ROLE_ORDER = COMPANY_EXECUTIVE_ROLES;

type ExecutiveRole = CompanyExecutiveRole;

const ROLE_ICONS: Record<ExecutiveRole, typeof Crown> = {
  회장: Crown,
  명예회장: Award,
  부회장: UsersRound,
  상임의원: BriefcaseBusiness,
  특별의원: Star,
  의원: UserRound,
  감사: ClipboardCheck,
  경제자문: Lightbulb,
};

const ROLE_CLASS_NAMES: Record<ExecutiveRole, string> = {
  회장: "bg-amber-50 text-amber-800 ring-amber-200",
  명예회장: "bg-yellow-50 text-yellow-800 ring-yellow-200",
  부회장: "bg-blue-50 text-blue-800 ring-blue-200",
  상임의원: "bg-violet-50 text-violet-800 ring-violet-200",
  특별의원: "bg-slate-100 text-slate-800 ring-slate-300",
  의원: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  감사: "bg-rose-50 text-rose-800 ring-rose-200",
  경제자문: "bg-cyan-50 text-cyan-800 ring-cyan-200",
};

function getExecutiveRoleLabels(value?: string) {
  const labels = new Set(getCompanyExecutiveRoles(value));

  return [...labels].toSorted((left, right) => {
    const leftIndex = EXECUTIVE_ROLE_ORDER.indexOf(left as ExecutiveRole);
    const rightIndex = EXECUTIVE_ROLE_ORDER.indexOf(right as ExecutiveRole);

    return (
      (leftIndex < 0 ? Number.MAX_SAFE_INTEGER : leftIndex) -
      (rightIndex < 0 ? Number.MAX_SAFE_INTEGER : rightIndex)
    );
  });
}

export function ExecutiveBadges({ executive }: { executive?: string }) {
  const roles = getExecutiveRoleLabels(executive);

  if (roles.length === 0) {
    return null;
  }

  return (
    <span
      className="inline-flex flex-wrap items-center gap-1.5"
      aria-label="임·의원 직책"
    >
      {roles.map((role) => {
        const className = ROLE_CLASS_NAMES[role as ExecutiveRole];
        const RoleIcon = ROLE_ICONS[role as ExecutiveRole] ?? Award;
        return (
          <span
            key={role}
            className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium ring-1 ${className ?? "bg-slate-50 text-slate-700 ring-slate-300"}`}
          >
            <RoleIcon className="size-3.5" aria-hidden="true" />
            {role}
          </span>
        );
      })}
    </span>
  );
}

export function MemberBadge() {
  return (
    <span className="rounded-md bg-white px-2.5 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-400">
      회원사
    </span>
  );
}
