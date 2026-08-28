-- Computes the filter-dependent sidebar counts in PostgreSQL. The larger,
-- static facet context remains cacheable in the application, while this RPC
-- avoids repeatedly transferring and scanning all company rows per selection.
create or replace function public.get_company_filtered_facets(
  p_region text default '',
  p_executive_only boolean default false,
  p_executive_roles text[] default '{}'::text[],
  p_categories text[] default '{}'::text[],
  p_employee_ranges text[] default '{}'::text[]
)
returns jsonb
language sql
stable
set search_path = public
as $$
  with
  category_options(value, sort_order) as (
    values
      ('금융 & 보험', 1), ('건설', 2), ('제조', 3), ('기타', 4),
      ('숙박 & 음식점', 5), ('유통', 6), ('서비스', 7),
      ('부동산 & 임대', 8), ('환경', 9), ('광', 10), ('운수', 11),
      ('방송통신', 12), ('전기 & 수도', 13)
  ),
  role_options(value, sort_order) as (
    values
      ('회장', 1), ('명예회장', 2), ('부회장', 3), ('감사', 4),
      ('상임의원', 5), ('경제자문', 6), ('의원', 7), ('특별의원', 8)
  ),
  employee_matches as (
    select c.*
    from public.companies c
    where cardinality(p_employee_ranges) = 0
      or ('lt-5' = any(p_employee_ranges) and c.employee_count <= 4)
      or ('5-9' = any(p_employee_ranges) and c.employee_count between 5 and 9)
      or ('10-49' = any(p_employee_ranges) and c.employee_count between 10 and 49)
      or ('50-299' = any(p_employee_ranges) and c.employee_count between 50 and 299)
      or ('300' = any(p_employee_ranges) and c.employee_count >= 300)
  ),
  category_base as (
    select c.*
    from employee_matches c
    where (p_region = '' or c.region = p_region)
      and (not p_executive_only or nullif(trim(c.executive), '') is not null)
      and (
        cardinality(p_executive_roles) = 0
        or exists (
          select 1
          from regexp_split_to_table(coalesce(c.executive, ''), E'[,/|·•\\n\\r]+') role
          where regexp_replace(trim(role), '\\s+', '', 'g') = any(p_executive_roles)
        )
      )
  ),
  role_base as (
    select c.*
    from employee_matches c
    where (p_region = '' or c.region = p_region)
      and (cardinality(p_categories) = 0 or c.primary_category = any(p_categories))
  ),
  executive_base as (
    select c.*
    from employee_matches c
    where (p_region = '' or c.region = p_region)
      and (cardinality(p_categories) = 0 or c.primary_category = any(p_categories))
      and nullif(trim(c.executive), '') is not null
  ),
  category_counts as (
    select option.value, count(company.id)::integer as count, option.sort_order
    from category_options option
    left join category_base company on company.primary_category = option.value
    group by option.value, option.sort_order
  ),
  role_counts as (
    select option.value, count(distinct company.id)::integer as count, option.sort_order
    from role_options option
    left join role_base company on exists (
      select 1
      from regexp_split_to_table(coalesce(company.executive, ''), E'[,/|·•\\n\\r]+') role
      where regexp_replace(trim(role), '\\s+', '', 'g') = option.value
    )
    group by option.value, option.sort_order
  )
  select jsonb_build_object(
    'filteredCategoryCounts', (
      select coalesce(jsonb_agg(jsonb_build_object('value', value, 'count', count) order by sort_order), '[]'::jsonb)
      from category_counts
    ),
    'filteredExecutiveRoleCounts', (
      select coalesce(jsonb_agg(jsonb_build_object('value', value, 'count', count) order by sort_order), '[]'::jsonb)
      from role_counts
    ),
    'filteredExecutiveCount', (select count(*)::integer from executive_base)
  );
$$;
