-- updated_at auto-trigger function
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger brain_entries_updated_at
  before update on public.brain_entries
  for each row execute function public.set_updated_at();

-- generations and portfolio_projects don't have updated_at — add them
alter table public.generations add column if not exists updated_at timestamptz default now();
alter table public.portfolio_projects add column if not exists updated_at timestamptz default now();

create trigger generations_updated_at
  before update on public.generations
  for each row execute function public.set_updated_at();

create trigger portfolio_projects_updated_at
  before update on public.portfolio_projects
  for each row execute function public.set_updated_at();

-- Index for monthly usage counting
create index if not exists generations_user_created_idx
  on public.generations(user_id, created_at desc);
