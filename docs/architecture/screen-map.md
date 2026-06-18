# MVP Screen Map

This screen map now reflects the current pre-VM frontend that exists in `apps/web`, not only the original intent.

## 1. Auth

- `Login`
- `Magic link or OTP confirmation`

## 2. Onboarding

- `Profile setup`
- `Goals setup`

Current frontend behavior:

- both screens are implemented as real forms over the current API and service contracts
- each screen now includes status/help context so setup blockers are visible without reading backend docs

## 3. Core logging

- `Daily dashboard`
- `Meal logging`
- `Meal review/confirm` if USDA matching needs user correction

Current frontend behavior:

- `Daily dashboard` is implemented as a date-aware screen using the saved daily summary and meal list for a selected day
- `Meal logging` is implemented as a real save flow with parser warnings, success/error states, and saved-item feedback
- `Meal review/confirm` is still not implemented because the current backend still auto-selects the first USDA match

## 4. Summaries

- `Daily summary` in Sprint 1
- `Weekly summary` in Sprint 2
- `Monthly summary` in Sprint 2

Current frontend behavior:

- the daily dashboard is the current daily-summary surface
- weekly and monthly summary screens are now implemented and let the user navigate through prior/future periods
- both read the current persisted `daily_summaries` layer instead of resumming raw meals on the client

## Daily dashboard modules

- date selector
- active goals card
- consumed vs target macros
- meals list
- add meal CTA
- errors and empty states

Why the dashboard is built this way:

- the selected day keeps the frontend aligned with the existing summary service contract
- empty/setup states are intentionally explicit so users can tell whether they are blocked by missing meals, missing goals, or an incomplete profile
- weekly and monthly pages stay cheap because the dashboard and summaries share the same daily aggregation layer

## Meal logging flow

1. user enters meal text and meal time
2. service validates request
3. future LLM adapter may suggest item candidates
4. USDA client resolves food matches and nutrients
5. user confirms or edits uncertain items
6. meal and meal items are stored
7. daily summary is recomputed

Current frontend note:

- step 5 is still a future slice
- the current frontend explains this gap and shows the first saved resolution immediately after submit
