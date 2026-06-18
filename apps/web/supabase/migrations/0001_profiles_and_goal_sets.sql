create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  age smallint,
  sex text check (sex in ('female', 'male', 'other', 'prefer_not_to_say')),
  height_cm numeric(5,2),
  weight_kg numeric(5,2),
  timezone text not null default 'UTC',
  preferred_units text not null default 'metric' check (preferred_units in ('metric', 'imperial')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.goal_sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  calorie_target integer not null check (calorie_target > 0),
  protein_grams_target numeric(6,2) not null check (protein_grams_target > 0),
  carbs_grams_target numeric(6,2) not null check (carbs_grams_target > 0),
  fat_grams_target numeric(6,2) not null check (fat_grams_target > 0),
  effective_from date not null,
  effective_to date,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  constraint goal_sets_window check (effective_to is null or effective_to >= effective_from)
);

create index if not exists goal_sets_user_effective_from_idx
  on public.goal_sets (user_id, effective_from desc);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.goal_sets enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "goal_sets_select_own" on public.goal_sets;
create policy "goal_sets_select_own"
on public.goal_sets
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "goal_sets_insert_own" on public.goal_sets;
create policy "goal_sets_insert_own"
on public.goal_sets
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "goal_sets_update_own" on public.goal_sets;
create policy "goal_sets_update_own"
on public.goal_sets
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
