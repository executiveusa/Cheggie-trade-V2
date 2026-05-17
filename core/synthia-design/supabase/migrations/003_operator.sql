create table if not exists public.operator_instances (
  id uuid primary key default gen_random_uuid(),
  operator_id uuid references auth.users not null,
  domain text,
  country text,
  niche text,
  language text,
  user_count integer default 0,
  revenue_cents integer default 0,
  created_at timestamptz default now()
);

create index if not exists operator_instances_idx on public.operator_instances(operator_id);
