# Test Layout

The app keeps tests split by the side they protect:

- `src/tests/frontend`: component and UI-facing tests
- `src/tests/backend`: route, contract, and service tests

Why this helps:

- future CI can run frontend and backend test jobs separately without inventing a new repo split
- the current pre-VM app still lives in one Next.js package, so this keeps boundaries visible while staying practical
- route handlers and services stay tested as backend concerns even though they live beside the web app entrypoints
