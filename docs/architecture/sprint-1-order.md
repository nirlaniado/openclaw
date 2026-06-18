# Sprint 1 Implementation Order

## Milestone 1: foundation

- create workspace and Next.js app shell
- add env schema
- add shared contracts and adapter interfaces
- document architecture and data model

## Milestone 2: auth and profile

- wire Supabase SSR clients
- add login and auth callback flow
- implement profile read/update service
- add protected route pattern

## Milestone 3: goals

- add goal-set schema and repository
- implement goal versioning and active-goal resolution
- build goals form and dashboard target card

## Milestone 4: meal logging + USDA

- implement USDA adapter
- implement meal create flow
- add meal review states
- persist meals and meal items

## Milestone 5: summaries

- implement deterministic daily summary recompute
- add daily dashboard read model
- add weekly/monthly API contracts, then UI in Sprint 2

## Milestone 6: hardening

- add lint, typecheck, and smoke tests
- document env vars and rollback notes
- leave container and k8s placeholders aligned with the code boundaries
