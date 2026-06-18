# API and Service Boundary Proposal

## UI routes

- `/`
- `/login`
- `/dashboard`
- `/profile`
- `/goals`
- `/meals/new`
- `/summary/weekly`
- `/summary/monthly`

## Route handlers

- `GET /api/profile`
- `PUT /api/profile`
- `GET /api/goals`
- `PUT /api/goals`
- `GET /api/meals`
- `POST /api/meals`
- `GET /api/summary/daily`
- `GET /api/summary/weekly`
- `GET /api/summary/monthly`

## Service layer

### `auth-service`

- gets current session user
- ensures profile bootstrap on first login
- handles access decisions for user-scoped resources

### `profile-service`

- reads and updates profile fields
- owns profile validation and normalization

### `goals-service`

- creates new goal-set versions
- resolves active goal for a date range

### `meal-log-service`

- accepts meal text and timestamp
- optionally asks `LLMAdapter` for candidate item extraction later
- resolves foods through `USDANutritionClient`
- writes `meals` and `meal_items`
- triggers summary recompute

### `summary-service`

- computes day totals from meal items
- reads `daily_summaries` for weekly and monthly aggregation
- returns deterministic math only

## Adapter layer

### `USDANutritionClient`

- `searchFoods(query)`
- `getFoodByFdcId(fdcId)`

### `LLMAdapter`

- `parseMealText({ mealText, locale })`

Rules:

- the LLM adapter can suggest structure only
- food matching, weights, and macro totals must be resolved by deterministic services and the USDA source

## Repository layer

- `profiles-repository`
- `goal-sets-repository`
- `meals-repository`
- `meal-items-repository`
- `daily-summaries-repository`

Only repositories may speak raw Supabase row shape.
