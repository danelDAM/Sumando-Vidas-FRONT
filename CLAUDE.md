# CLAUDE.md

@AGENTS.md
@MEMORY.md

`AGENTS.md` holds the project rules and is the source of truth; `MEMORY.md` holds the current state of both repos. This file only adds what Claude needs on top.

## Workspace

- Frontend (this repo): `C:\Users\Danell\Desktop\SUMANDO VIDA\Por ellos web` — Vite 7 + React 19 + TS, react-router 7, i18next, `@supabase/supabase-js`. Git remote `origin`.
- Backend (sibling): `C:\Users\Danell\Desktop\SUMANDO VIDA\Por ellos back` — Express 4, CommonJS, nodemailer, supabase-js. Git remote `back`. Its own rules are in `../Por ellos back/AGENTS.md`.
- Supabase migrations for both live only here, in `supabase/migrations`.

## Commands

- Frontend: `npm run dev` (port 5173, `--host 0.0.0.0`), `npm run build` (`tsc --noEmit && vite build`, TS strict), `npm run preview`. No tests, no linter. CI uses Node 22.
- Backend: `npm run dev` (nodemon, port 4242), `npm start`, `npm test` (`node --test`, in-memory repository mocks).

## Where things are

- Public data reads: `src/services/publicData.ts` (anon Supabase client from `src/services/supabase.ts`), consumed through `usePublicQuery` (`src/hooks/usePublicQuery.ts`) and rendered with `PublicDataStatus`. Static fallbacks in `src/data/publicFallbacks.ts`, merged via `mergePublicRows`.
- Backend calls: `src/services/payments.ts` (FakeMoney checkout/status/simulate) and `src/services/contact.ts` (`POST /api/contact`). Both use `VITE_API_URL`.
- Payment UI: `DonationsPage` (free amount, no campaign; subscription mode is UI-only), `PorEllosProjectPage` (stop/product donations, anonymous/public choice), `DonationStatusPage` at `/donaciones/estado?donation_id=…` (server-confirmed status; simulation buttons only when `import.meta.env.DEV`; refetches only the city leaderboard after `paid`).
- `payments.ts` reuses one `Idempotency-Key` per payload fingerprint until success and sends both camelCase and snake_case participant fields.
- Supabase reads are anon-only. `participants`/`donations` have no public RLS policies; leaderboards are readable only through the `security_invoker = false` views.
- Routes in `src/App.tsx`; navigation lists in `src/data/navigation.ts` (unbuilt `futurePages` and legal pages render `PlaceholderPage`).
- i18n: `src/i18n.ts`, language stored in `localStorage.lang`, fallback `es`. Top-level locale keys: `common, nav, footer, home, projects, payments, porEllos, aboutPage, storiesPage`.
- Styles: `src/styles/global.css` imports the rest; page styles in `pages.css` and `por-ellos.css`. Scroll reveal uses `data-reveal` + `useScrollReveal`.

## Working notes for Claude

- Never print or copy values from `.env` / `.env.local`; checking whether a key is set is fine.
- The `supabase` MCP server in `.mcp.json` targets the **Production** project; do not use it for writes or test data. Prefer DEV and ask before any remote action.
- The user writes in Spanish; reply in Spanish.
- After editing locales, check key parity across `es`, `ca`, `eu`.
- Keep `MEMORY.md` current when the project state changes (pending work, environment status, known issues).
