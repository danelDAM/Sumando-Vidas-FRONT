# AGENTS.md

## Project

Vite + React + TypeScript website for Por Ellos.

## Rules

- Make the smallest change necessary to complete the task.
- Inspect only files relevant to the task.
- Do not read the entire repository unless necessary.
- Before creating anything, check whether an existing component, hook, utility, style, or data structure can be reused.
- Prefer modifying existing code over creating parallel implementations.
- Do not refactor unrelated code.
- Do not introduce dependencies, frameworks, libraries, or tooling unless required.
- Preserve existing architecture and conventions.
- Keep all user-facing text available in every supported language: Spanish, Catalan, and Basque.
- Whenever UI copy or other user-facing content changes, update the matching keys in `src/locales/es.json`, `src/locales/ca.json`, and `src/locales/eu.json` in the same change.
- Prefer translation keys over user-visible string literals in components; preserve proper names where translation is not appropriate.
- Keep UI responsive and consistent with the existing design.
- Do not invent content, data, claims, or organization information.

## Git, Supabase, And Payments

- `develop` is the integration branch and maps to Supabase DEV project `lneaejwtcffridriuwpp` (`SumandoVidas-Dev`). `main` maps to Production project `hhapfybsavgenvfqyeyq` (`SumandoVidasDB`). Work on `feature/<topic>` branches from `develop`; use PRs to integrate. Do not develop directly on `main`.
- Supabase preview branching is unavailable in the current Free organization. DEV and Production are independent projects with different URLs and keys; never reuse credentials between them.
- Frontend local config belongs in ignored `.env.local`: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, and `VITE_API_URL` (defaults to `http://localhost:4242`). Vite variables are public at runtime: never put a secret/service-role key in any `VITE_*` variable.
- Payment requests go through the backend FakeMoney API in development. Send stable Supabase UUIDs for campaign/stop/product (never `fallback-*` IDs from `src/data/publicFallbacks.ts`) and use `Idempotency-Key`; do not insert/update `donations` from the browser, assert `paid` from a redirect, or call Supabase with service credentials.
- Donations are anonymous unless the user opts in: a public donation sends `isAnonymous=false`, `participantType` (`person`/`company`) and `donorName`. The backend creates and publishes the participant only after the payment is `paid`; the browser never creates participants.
- FakeMoney is a simulator, not a processor. Do not expose its simulation controls in production. The server confirms payment state; after it returns `paid`, refetch public leaderboard views rather than maintaining client-side totals.
- Schema changes belong in `supabase/migrations`. Apply and validate on DEV first; only promote to Production after review/PR and controlled application. Never delete donations or write test donations to Production.
- The backend CI runs `npm test`; this frontend CI runs `npm run build` on `develop` and `main` pushes/PRs. Keep checks free of remote credentials and database writes.

## Structure

- `src/main.tsx` → application entry
- `src/App.tsx` → routes
- `src/components/` → shared components
- `src/pages/` → pages
- `src/data/` → navigation and reusable content
- `src/styles/` → global/shared styles
- `src/hooks/` → custom hooks
- `src/services/` → Supabase public reads and backend API calls (payments, contact)
- `src/locales/` → `es`, `ca`, `eu` translations
- `supabase/migrations` → database schema shared with the backend
- Backend lives in the sibling repo `../Por ellos back` (Express, CommonJS)

## Workflow

1. Understand the request.
2. Locate only the relevant files.
3. Reuse existing code where possible.
4. Make the smallest viable change.
5. Validate with `npm run build` when code was modified.
6. Report only relevant changes and issues.

## Token efficiency

- Do not explain obvious code or architecture.
- Do not repeat information already present in the repository.
- Do not inspect unrelated files.
- Do not generate large amounts of code when a smaller change is sufficient.
- Prefer targeted searches over reading large files.
- Stop investigating once enough context is available to safely implement the task.