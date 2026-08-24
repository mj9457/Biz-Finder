type CompanyUrlSource = {
  id: string;
  name: string;
};

function slugify(value: string) {
  return value
    .trim()
    .toLocaleLowerCase("ko-KR")
    // Keep Hangul in NFC form; NFKD would decompose it into unreadable Jamo
    // characters in the generated URL.
    .normalize("NFC")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

export function getCompanySlug(company: CompanyUrlSource) {
  // Local seed data already has stable, human-readable identifiers.
  if (!/^\d+$/.test(company.id)) {
    return company.id;
  }

  // Database records keep the numeric id suffix so a renamed company does
  // not collide with another record and old numeric URLs remain resolvable.
  return `${slugify(company.name) || "company"}-${company.id}`;
}

export function getCompanyHref(company: CompanyUrlSource) {
  return `/companies/${encodeURIComponent(getCompanySlug(company))}`;
}

export function getCompanyIdFromSlug(slug: string) {
  const decodedSlug = decodeURIComponent(slug);
  const idMatch = decodedSlug.match(/(?:^|-)(\d+)$/);

  return idMatch?.[1] ?? (/^\d+$/.test(decodedSlug) ? decodedSlug : null);
}
