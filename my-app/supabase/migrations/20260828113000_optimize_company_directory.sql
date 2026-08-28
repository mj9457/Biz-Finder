-- Directory search performance:
-- - Persist the application-level executive ordering in PostgreSQL.
-- - Support the filters and substring search used by the companies page.

create extension if not exists pg_trgm;

alter table public.companies
  add column if not exists executive_priority integer not null default 999;

create or replace function public.set_company_executive_priority()
returns trigger
language plpgsql
as $$
declare
  executive_roles text[];
begin
  executive_roles := regexp_split_to_array(
    regexp_replace(coalesce(new.executive, ''), '\s+', '', 'g'),
    E'[,/|·•\\n\\r]+'
  );

  new.executive_priority := case
    when '회장' = any(executive_roles) then 0
    when '명예회장' = any(executive_roles) then 1
    when '부회장' = any(executive_roles) then 2
    when '감사' = any(executive_roles) then 3
    when '상임의원' = any(executive_roles) then 4
    when '경제자문' = any(executive_roles) then 5
    when '의원' = any(executive_roles) then 6
    when '특별의원' = any(executive_roles) then 7
    else 999
  end;

  return new;
end;
$$;

create trigger companies_set_executive_priority
before insert or update of executive on public.companies
for each row execute function public.set_company_executive_priority();

-- Populate the new sort key for the rows that already exist.
update public.companies
set executive = executive;

create index if not exists companies_default_sort_idx
  on public.companies (executive_priority, company_name, id);

create index if not exists companies_search_text_trgm_idx
  on public.companies using gin (search_text gin_trgm_ops);

create index if not exists companies_region_idx
  on public.companies (region);

create index if not exists companies_category_idx
  on public.companies (primary_category);

create index if not exists companies_employee_count_idx
  on public.companies (employee_count);

create index if not exists companies_executive_idx
  on public.companies (executive);
