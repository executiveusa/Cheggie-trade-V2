alter table public.profiles add column if not exists whatsapp_phone text;

create table if not exists public.whatsapp_threads (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  user_id uuid references auth.users,
  messages jsonb default '[]',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index if not exists whatsapp_threads_phone_idx on public.whatsapp_threads(phone);
