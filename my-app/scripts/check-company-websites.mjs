import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const ROOT = process.cwd();
const APPLY_CHANGES = process.argv.includes("--apply");
const REQUEST_TIMEOUT_MS = 8000;
const PAGE_SIZE = 500;
const CONCURRENCY = 8;

function loadEnvFile() {
  const envPath = path.join(ROOT, ".env.local");
  const content = fs.readFileSync(envPath, "utf8");
  const env = {};

  for (const line of content.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);

    if (!match) {
      continue;
    }

    const [, key, rawValue] = match;
    env[key] = rawValue.replace(/^(['"])(.*)\1$/, "$2");
  }

  return env;
}

function getWebsiteCandidates(value) {
  const website = value.trim();

  if (!website || /^(mailto:|tel:|javascript:)/i.test(website)) {
    return [];
  }

  const withoutProtocol = website.replace(/^https?:\/\//i, "");

  return [...new Set([`https://${withoutProtocol}`, `http://${withoutProtocol}`])];
}

async function checkWebsite(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36",
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "accept-language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
      },
    });

    response.body?.cancel();

    if (response.status >= 200 && response.status < 400) {
      return {
        ok: true,
        status: response.status,
        resolvedUrl: response.url || url,
      };
    }

    return {
      ok: false,
      status: response.status,
      error: `HTTP ${response.status}`,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function findWorkingWebsite(value) {
  const candidates = getWebsiteCandidates(value);

  for (const candidate of candidates) {
    const result = await checkWebsite(candidate);

    if (result.ok) {
      return {
        ...result,
        originalUrl: value.trim(),
        checkedUrl: candidate,
      };
    }
  }

  return {
    ok: false,
    originalUrl: value.trim(),
  };
}

async function mapWithConcurrency(items, worker, concurrency) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function runWorker() {
    while (true) {
      const index = nextIndex++;

      if (index >= items.length) {
        return;
      }

      results[index] = await worker(items[index], index);
    }
  }

  await Promise.all(
    Array.from(
      { length: Math.min(concurrency, items.length) },
      () => runWorker(),
    ),
  );

  return results;
}

async function loadCompanies(supabase) {
  const companies = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("companies")
      .select("id, website")
      .order("id", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      throw new Error(`Supabase load failed: ${error.message}`);
    }

    companies.push(...(data ?? []));

    if (!data || data.length < PAGE_SIZE) {
      return companies;
    }

    from += PAGE_SIZE;
  }
}

async function updateWebsite(supabase, id, website) {
  const { error } = await supabase
    .from("companies")
    .update({ website })
    .eq("id", id);

  if (error) {
    throw new Error(`Supabase update failed for id=${id}: ${error.message}`);
  }
}

const env = loadEnvFile();
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey =
  env.SUPABASE_SERVICE_ROLE_KEY ?? env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local",
  );
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const companies = await loadCompanies(supabase);
const companiesWithWebsites = companies.filter(
  (company) => typeof company.website === "string" && company.website.trim(),
);
let changed = 0;
let unchanged = 0;
let failed = 0;
const failures = [];

console.log(
  `Checking ${companiesWithWebsites.length} website URLs (${APPLY_CHANGES ? "apply mode" : "dry-run mode"})...`,
);

await mapWithConcurrency(
  companiesWithWebsites,
  async (company, index) => {
    const result = await findWorkingWebsite(company.website);

    if (!result.ok) {
      failed += 1;
      failures.push({ id: company.id, website: company.website });
    } else if (result.resolvedUrl === company.website.trim()) {
      unchanged += 1;
    } else {
      changed += 1;

      if (APPLY_CHANGES) {
        await updateWebsite(supabase, company.id, result.resolvedUrl);
      }
    }

    if ((index + 1) % 50 === 0 || index + 1 === companiesWithWebsites.length) {
      console.log(`Progress: ${index + 1}/${companiesWithWebsites.length}`);
    }
  },
  CONCURRENCY,
);

console.log(
  JSON.stringify(
    {
      mode: APPLY_CHANGES ? "apply" : "dry-run",
      totalCompanies: companies.length,
      checked: companiesWithWebsites.length,
      changed,
      unchanged,
      failed,
      failures,
    },
    null,
    2,
  ),
);
