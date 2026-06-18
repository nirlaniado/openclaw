# MVP Screen Map

## 1. Auth

- `Login`
- `Magic link or OTP confirmation`

## 2. Onboarding

- `Profile setup`
- `Goals setup`

## 3. Core logging

- `Daily dashboard`
- `Meal logging`
- `Meal review/confirm` if USDA matching needs user correction

## 4. Summaries

- `Daily summary` in Sprint 1
- `Weekly summary` in Sprint 2
- `Monthly summary` in Sprint 2

## Daily dashboard modules

- date selector
- active goals card
- consumed vs target macros
- meals list
- add meal CTA
- errors and empty states

## Meal logging flow

1. user enters meal text and meal time
2. service validates request
3. future LLM adapter may suggest item candidates
4. USDA client resolves food matches and nutrients
5. user confirms or edits uncertain items
6. meal and meal items are stored
7. daily summary is recomputed
