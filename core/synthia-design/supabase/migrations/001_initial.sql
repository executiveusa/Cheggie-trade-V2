create table public.profiles (
  id uuid references auth.users primary key,
  username text unique not null,
  display_name text,
  bio text,
  avatar_url text,
  language text default 'es',
  country text default 'MX',
  tier text default 'free' check (tier in ('free','starter','pro','operator')),
  creem_customer_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.brain_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  type text not null check (type in ('conversation','document','note','project')),
  title text not null,
  content text not null,
  source text not null,
  tags text[] default '{}',
  is_public boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index brain_entries_user_id_idx on public.brain_entries(user_id);

create table public.generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  studio text not null,
  model text,
  prompt text,
  result_url text,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);
create index generations_user_id_idx on public.generations(user_id);

create table public.portfolio_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  title text not null,
  description text,
  thumbnail_url text,
  result_url text,
  studio text,
  prompt text,
  is_public boolean default true,
  remix_count integer default 0,
  tags text[] default '{}',
  created_at timestamptz default now()
);
create index portfolio_public_idx on public.portfolio_projects(is_public, created_at desc);

alter table public.profiles enable row level security;
alter table public.brain_entries enable row level security;
alter table public.generations enable row level security;
alter table public.portfolio_projects enable row level security;

create policy "Users own their profile" on public.profiles for all using (auth.uid() = id);
create policy "Users own their brain" on public.brain_entries for all using (auth.uid() = user_id);
create policy "Users own their generations" on public.generations for all using (auth.uid() = user_id);
create policy "Users manage their portfolio" on public.portfolio_projects for all using (auth.uid() = user_id);
create policy "Public portfolio readable" on public.portfolio_projects for select using (is_public = true);
