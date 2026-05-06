# Budhi Lite V1 — Supabase setup

This version stores profile and match buckets online in Supabase while keeping the OpenAI API key in `sessionStorage`.

## Tables required

Run this SQL in Supabase SQL Editor:

```sql
create table if not exists public.budhi_profiles (
  username text primary key,
  display_name text,
  lang text default 'en',
  answers jsonb default '{}'::jsonb,
  results_app jsonb default '{}'::jsonb,
  results_ai jsonb default '{}'::jsonb,
  updated_at timestamptz default now()
);

create table if not exists public.budhi_matches (
  match_id text primary key,
  user_a text not null,
  user_b text not null,
  lang text default 'en',
  results_app jsonb default '{}'::jsonb,
  results_ai jsonb default '{}'::jsonb,
  updated_at timestamptz default now()
);

alter table public.budhi_profiles enable row level security;
alter table public.budhi_matches enable row level security;

create policy "allow public read profiles"
on public.budhi_profiles
for select
to anon
using (true);

create policy "allow public write profiles"
on public.budhi_profiles
for insert
to anon
with check (true);

create policy "allow public update profiles"
on public.budhi_profiles
for update
to anon
using (true)
with check (true);

create policy "allow public read matches"
on public.budhi_matches
for select
to anon
using (true);

create policy "allow public write matches"
on public.budhi_matches
for insert
to anon
with check (true);

create policy "allow public update matches"
on public.budhi_matches
for update
to anon
using (true)
with check (true);
```

## Browser configuration

The public Supabase configuration is in:

```txt
js/supabase_client.js
```

Current configuration:

```js
const SUPABASE_CONFIG = {
  url: "https://xzcnwbkinaswwsuiymqs.supabase.co",
  anonKey: "sb_publishable_RUoYwMn0qzWwkDcrw7Tm0Q_iJI8e6IK"
};
```

Never put a `service_role` or secret key in the frontend.

## Storage behavior

- Individual profile buckets are saved to `public.budhi_profiles`.
- Match buckets are saved to `public.budhi_matches`.
- A localStorage copy is kept as a fallback cache.
- OpenAI API keys stay only in sessionStorage and are not saved to Supabase.
