# MEMORY.md

Project state snapshot for Por Ellos web + back. Update when it changes. Last review: 2026-10-11.

## Git state

- Web: on `develop`; local `develop` is 2 commits ahead of `origin/develop` (`d5920b4`, `d6a8213`), not pushed.
- Web: `AGENTS.md`, `README.md` modified and `CLAUDE.md`, `MEMORY.md` new, all uncommitted. Remote `origin` → `github.com/danelDAM/Sumando-Vidas-FRONT`.
- Back: on `develop`, in sync with `back/develop` (`6d8e72f`), with **uncommitted** work in `src/services/paymentService.js`, `src/services/paymentRepository.js`, `test/payment.test.js` (public participant flow, see below) plus doc updates and its own `CLAUDE.md`/`MEMORY.md`. Backend-only details: `../Por ellos back/MEMORY.md`. `npm test` 28/28 on 2026-10-11.
- CI: web runs `npm run build`, back runs `npm test`, on push/PR to `develop` and `main`. Branch protection not configured (needs admin).

## Environments

| Branch | Supabase project | Ref |
| --- | --- | --- |
| `develop` | `SumandoVidas-Dev` (eu-west-1) | `lneaejwtcffridriuwpp` |
| `main` | `SumandoVidasDB` (real data) | `hhapfybsavgenvfqyeyq` |

- Local web `.env.local`: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_API_URL` set (DEV).
- Local back `.env`: `PORT`, `NODE_ENV`, `FAKE_MONEY_ENABLED`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `FRONTEND_URL`, `FRONTEND_URLS` set. `SMTP_*` are **not** in `.env`, so contact email fails locally unless provided another way.
- All 4 migrations applied in DEV. Production got the additive FakeMoney migration with explicit authorization; it still holds one old anonymous 1 EUR `fake_money` test donation (no campaign/stop/participant, outside leaderboards). Do not add more.
- `.mcp.json` `supabase` server points to Production (`hhapfybsavgenvfqyeyq`), not DEV.

## Database (from `supabase/migrations`)

- Tables: `projects`, `campaigns`, `events`, `campaign_stops`, `products`, `stories`, `sponsors`, `impact_metrics`, `transparency_reports`, `participants`, `donations`, `contact_messages`, `stripe_webhook_events`. RLS on all; public read policies only for published/active rows.
- Views (from `paid` donations, all `security_invoker = false`): `monthly_leaderboard`, `historic_leaderboard`, `public_city_leaderboard`. `historic_leaderboard` does not require `paid_at is not null` (the other two do).
- `participants`, `donations`, `stripe_webhook_events` have no public policies (service role only). `contact_messages` allows anon insert but the backend sends mail instead of inserting.
- No SQL functions or triggers: `updated_at` is never refreshed automatically.
- Race order (user, 2026-10-12): Barcelona, Málaga, Madrid, Donosti, Valencia. Migration `20261012010000_reorder_por_ellos_stops.sql` renumbers existing stops in place (keeps ids/donations); applied to DEV on 2026-10-12 (via the API with the backend DEV key); **not applied** to Production yet. Event dates in the seed (Valencia 2026-10-25, Málaga 2027-03-07, Madrid 2027-04-04) do not match this order.
- Seed (original order): 5 stops (Málaga, Donosti, Madrid, Valencia, Barcelona) and 6 EUR products (dorsal 18, pack-apoyo-familiar 24, medalla 22, taza 16, kit-caminata 28, pack-meta 30).
- FakeMoney fields on `donations`: `idempotency_key`, `payment_provider`, `payment_reference`, `paid_at`, `metadata`.

## Backend API (`http://localhost:4242`)

- `POST /api/contact` `{ name, email, reason, message }`; reason ∈ `general|volunteer|company|project|press`; mails `associacionsumandovida@gmail.com` with sender as Reply-To.
- `POST /api/payments/create-checkout-session` (UUID `Idempotency-Key`) → `pending` donation; returns `donationId, status, statusUrl, simulationUrl`.
- `POST /api/payments/:id/fake-money` `{ outcome: approved|cancelled|failed }`.
- `GET /api/payments/:id` → server-confirmed status.
- All payment routes return 503 unless `FAKE_MONEY_ENABLED=true` and `NODE_ENV!=production`.

## In progress (back, uncommitted)

- Public donor flow: request carries `isAnonymous`/`is_anonymous`, `participantType`, `donorName` (camel and snake aliases must match). Intent is stored in `metadata.participant_intent`. On `approved`, a participant is created (or the given active one reused), attached to the donation and published (`publicly_listed=true`, `public_consent_at=now`). Cancelled/failed never create participants. Idempotency also compares the participant intent.
- Back `AGENTS.md`/`README.md` were updated on 2026-10-11 to describe this flow (they used to say participants are never created).
- **Unresolved security issue:** sending `isAnonymous=false` with an existing `participantId` lets the backend overwrite that participant's `display_name`/type and publish it. Anyone with an active participant's UUID could rename/publish it. Needs a decision before promoting to `main`.
- The web `payments.ts` already sends both alias forms.

## Known issues / tech debt

- Fallback stops/products in `src/data/publicFallbacks.ts` use non-UUID IDs (`fallback-stop-*`, `fallback-product-*`). `PorEllosProjectPage` only checks `data?.campaign.id`, so if DB rows are missing those IDs reach the payment API and the backend answers 400.
- After `paid`, `DonationStatusPage` refetches only `public_city_leaderboard`; monthly/historic refresh when `HeroesQueSumanPage` mounts.
- Locales `es`/`ca`/`eu` have 210 keys each, in parity (2026-10-12).
- Pages with hardcoded Spanish strings (no `useTranslation`): `ContactPage`, `EventsPage`, `HeroesQueSumanPage`, `TransparencyPage`, plus `PublicDataStatus`, `SponsorCarousel`. `DonationsPage`/`PorEllosProjectPage` still mix in Spanish literals; some formatting hardcodes `es-ES`. Service error messages in `payments.ts`, `contact.ts`, `supabase.ts`, `usePublicQuery.ts`, `publicData.ts` are also Spanish literals.
- Legal pages (`/aviso-legal`, `/politica-privacidad`, `/politica-cookies`) and `nuestra-historia`, `voluntariado`, `empresas-colaboradoras` are placeholders.
- Stripe is not implemented; `stripe_webhook_events` and `donations.stripe_*` exist but are unused (`payment_provider` already allows `'stripe'`).
- No deploy config (Vercel/Netlify) in either repo; production env vars are only described in docs.
- Design: palette is neutral `#1f2933` + greys/greens (`#eef1ef`, `#f4f7f5`) + gold accent (`#88671c`, `#c7a858`); indigo was removed on 2026-10-12, do not reintroduce it. Images in `public/images` are WebP (2026-10-12). The original `.png`/`.jpg` files stay only because DB rows still point to them: migration `20261012000000_webp_image_urls.sql` (rewrites `products.image_url`, `stories.image_url`, `sponsors.logo_url`) is **not applied** yet in DEV or Production; delete the originals after applying it in both.
- About page people live in `src/data/people.ts` (`founders`, `teamMembers`, `collaborators`; role/bio/alt are translation keys). Only Felipe exists; team and collaborators are empty on purpose and render silhouettes + contact CTA. Do not invent people.
- Por Ellos header is `src/components/ui/RaceScrollStory.tsx`: sticky scroll story (CSS-only 3D board shaped like mainland Spain, no 3D library; outline and city coordinates in `src/data/spainMap.ts` — a new stop city must be added to `cityCoordinates` or it is skipped on the map) that also shows goal vs raised; raised = sum of `public_city_leaderboard` amounts for the campaign.
- Héroes que suman header is `src/components/ui/HeroesScrollStory.tsx` (comic flipbook whose pages flip up like a monthly calendar, reuses the `race-story` CSS layout; names shown come from real consented `monthly_leaderboard` entries, "?" when empty). A first 3D arena/podium version was rejected by the user on 2026-10-12. Both stories share `useScrollProgress` and `useCountUp` in `src/hooks/`.
- Por Ellos city podium (`#ranking-ciudades`, light background) is a three.js scene: `src/components/ui/CityPodium3D.tsx` lazy-loads `src/components/ui/cityPodium/` (`scene.ts` podium, lights, camera fit; `cities.ts` one terraced-hill model per city based on the old skyline illustrations; `kit.ts` palette, terrain, building primitives). three.js (`three` + `@types/three`) was added on 2026-10-12 with the user's approval and ships as a separate ~158 kB gzip chunk. A new stop city needs a builder in `cities.ts` (otherwise a generic hill town is shown). The CSS podium in `PorEllosProjectPage` is only the no-WebGL fallback. The skyline images `public/images/logo{Malaga,Donosti,Madrid,Barcelona}` are no longer used.
- Donosti is modelled as La Concha bay seen from the sea (Urgull left, Igueldo right, Santa Clara island, boats, railing). Coastal cities use the terrain options `carve`, `water`, `floor` (diorama base with a water cut on the front edge) and `walls: false`; bumps with `terrace: false` are smooth (islands, wooded hills).
- Performance (2026-10-12 cleanup): every page except Home is lazy-loaded in `src/App.tsx` (`Suspense` in `Layout`). City models are merged per material by `mergeModel` in `kit.ts` (draw calls ~7.900 → ~184, same image); tiled facade textures are baked into UVs there, so keep `material.userData.recipe` when adding materials. Unused images/video and 25 unused locale keys were removed.
- Headless screenshots of WebGL need Chrome flags `--use-angle=swiftshader --enable-unsafe-swiftshader` (not `--disable-gpu`) and ~20 s of wait for the scene to build.
- Motion conventions: `prefers-reduced-motion` and `(hover: none)` blocks live at the end of `responsive-overrides.css`; `useScrollReveal` also observes `[data-reveal]` mounted after data loads.
