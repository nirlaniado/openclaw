create table if not exists public.meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  meal_type text not null check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack', 'other')),
  source text not null default 'manual',
  meal_text text not null,
  status text not null default 'logged' check (status in ('draft', 'reviewed', 'logged', 'error')),
  eaten_at timestamptz not null,
  logged_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.meal_items (
  id uuid primary key default gen_random_uuid(),
  meal_id uuid not null references public.meals (id) on delete cascade,
  source text not null default 'usda',
  source_ref text not null,
  description text not null,
  quantity_text text,
  grams numeric(8,2),
  calories numeric(8,2) not null default 0,
  protein_grams numeric(8,2) not null default 0,
  carbs_grams numeric(8,2) not null default 0,
  fat_grams numeric(8,2) not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.daily_summaries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  summary_date date not null,
  goal_set_id uuid references public.goal_sets (id) on delete set null,
  calories_consumed numeric(8,2) not null default 0,
  protein_grams_consumed numeric(8,2) not null default 0,
  carbs_grams_consumed numeric(8,2) not null default 0,
  fat_grams_consumed numeric(8,2) not null default 0,
  meal_count integer not null default 0,
  last_recomputed_at timestamptz not null default timezone('utc', now()),
  unique (user_id, summary_date)
);

create index if not exists meals_user_eaten_at_idx
  on public.meals (user_id, eaten_at desc);

create index if not exists meal_items_meal_id_idx
  on public.meal_items (meal_id);

create index if not exists daily_summaries_user_date_idx
  on public.daily_summaries (user_id, summary_date desc);

drop trigger if exists meals_set_updated_at on public.meals;
create trigger meals_set_updated_at
before update on public.meals
for each row
execute function public.set_updated_at();

alter table public.meals enable row level security;
alter table public.meal_items enable row level security;
alter table public.daily_summaries enable row level security;

drop policy if exists "meals_select_own" on public.meals;
create policy "meals_select_own"
on public.meals
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "meals_insert_own" on public.meals;
create policy "meals_insert_own"
on public.meals
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "meals_update_own" on public.meals;
create policy "meals_update_own"
on public.meals
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "meal_items_select_own" on public.meal_items;
create policy "meal_items_select_own"
on public.meal_items
for select
to authenticated
using (
  exists (
    select 1
    from public.meals
    where meals.id = meal_items.meal_id
      and meals.user_id = auth.uid()
  )
);

drop policy if exists "meal_items_insert_own" on public.meal_items;
create policy "meal_items_insert_own"
on public.meal_items
for insert
to authenticated
with check (
  exists (
    select 1
    from public.meals
    where meals.id = meal_items.meal_id
      and meals.user_id = auth.uid()
  )
);

drop policy if exists "daily_summaries_select_own" on public.daily_summaries;
create policy "daily_summaries_select_own"
on public.daily_summaries
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "daily_summaries_insert_own" on public.daily_summaries;
create policy "daily_summaries_insert_own"
on public.daily_summaries
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "daily_summaries_update_own" on public.daily_summaries;
create policy "daily_summaries_update_own"
on public.daily_summaries
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
