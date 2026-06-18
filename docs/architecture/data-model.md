# Data Model Proposal

## Core tables

### `profiles`

- `id uuid pk` and references `auth.users.id`
- `display_name text`
- `age smallint`
- `sex text check`
- `height_cm numeric(5,2)`
- `weight_kg numeric(5,2)`
- `timezone text`
- `preferred_units text`
- `created_at timestamptz`
- `updated_at timestamptz`

### `goal_sets`

- `id uuid pk`
- `user_id uuid fk -> profiles.id`
- `calorie_target integer`
- `protein_grams_target numeric(6,2)`
- `carbs_grams_target numeric(6,2)`
- `fat_grams_target numeric(6,2)`
- `effective_from date`
- `effective_to date null`
- `is_active boolean`
- `created_at timestamptz`

Why version this table:

- weekly and monthly summaries must use the goal active on each day
- goal edits should not rewrite historical adherence

### `meals`

- `id uuid pk`
- `user_id uuid fk -> profiles.id`
- `meal_type text`
- `source text default 'manual'`
- `meal_text text`
- `status text`
- `eaten_at timestamptz`
- `logged_at timestamptz`
- `created_at timestamptz`
- `updated_at timestamptz`

Suggested statuses:

- `draft`
- `reviewed`
- `logged`
- `error`

### `meal_items`

- `id uuid pk`
- `meal_id uuid fk -> meals.id`
- `source text`
- `source_ref text`
- `description text`
- `quantity_text text`
- `grams numeric(8,2) null`
- `calories numeric(8,2)`
- `protein_grams numeric(8,2)`
- `carbs_grams numeric(8,2)`
- `fat_grams numeric(8,2)`
- `created_at timestamptz`

Notes:

- source is usually `usda` for Sprint 1
- persist resolved nutrient values per item so future source changes do not rewrite history

### `daily_summaries`

- `id uuid pk`
- `user_id uuid fk -> profiles.id`
- `summary_date date`
- `goal_set_id uuid fk -> goal_sets.id`
- `calories_consumed numeric(8,2)`
- `protein_grams_consumed numeric(8,2)`
- `carbs_grams_consumed numeric(8,2)`
- `fat_grams_consumed numeric(8,2)`
- `meal_count integer`
- `last_recomputed_at timestamptz`

Purpose:

- fast dashboard reads
- stable aggregation point for weekly and monthly rollups

## Table policy guidance

- use row-level security on all user-owned tables
- expose only user-scoped reads and writes
- keep auth profile bootstrap separate from profile completion data
- prefer soft workflow states over silent overwrites for meal parsing/review
