# Prompts — cabin-profile-mvp post-bolt follow-ups

**Date:** 2026-05-28
**Bolt:** [cabin-profile-mvp](../ops/build/bolts/cabin-profile-mvp.md) (already Done; these are same-day UX/contract fixes surfaced by full-stack smoke testing)
**Units impacted:** [cabin-registration](../ops/build/units/cabin-registration.md), [cabin-view-edit](../ops/build/units/cabin-view-edit.md), [cabin-operational-details](../ops/build/units/cabin-operational-details.md)
**Operator:** Hiran (mob with Copilot)

---

## Session 1: "Community id is required" + amenity selection + button gating

**Context:** Owner running the app locally could not complete cabin registration: server rejected the request with `Community id is required.`, amenity checkboxes appeared not to toggle, and the dashboard offered Register/Edit/Operational regardless of whether a cabin already existed.

**Constraints:**
- Keep API contract snake_case at the boundary; do not change DTO casing on the backend.
- Do not introduce destructive changes — flag remains opt-in via `VITE_FF_CABIN_PROFILE_MVP`.
- Preserve existing tests; add regression coverage where the bug slipped through.
- User explicit guidance: "dont need to fix all" — focus on the two reported symptoms.

**Acceptance Criteria:**
- Registering with a selected community succeeds (no 400 from missing `community_id`).
- Amenity checkboxes visually toggle in the browser and persist into the submitted payload.
- Dashboard buttons reflect actionability: Register enabled only when no cabin; Edit/Operational enabled only when a cabin exists.
- Frontend tests + production build green.

**Output Format:** Targeted code edits + regression tests + brief explanation.

### Files changed
- `src/frontend/src/api/client.ts` — explicit snake_case body for `createCabin`, `updateOwnCabin`, `upsertOwnCabinOperational`.
- `src/frontend/src/pages/register-cabin-page.tsx` — `currentTarget.checked` for amenity toggle; active-community filter; `communitiesLoading`; `canSubmit` gate; placeholder helper for the community `<select>`.
- `src/frontend/src/pages/edit-cabin-page.tsx` — same `currentTarget.checked` handler.
- `src/frontend/src/pages/owner-home-page.tsx` — probes `getOwnCabin()` to set `hasCabin`; replaces `<Link>` with `<button onClick={navigate}>` so disabled state is honored; relabels Register to "Cabin already registered" when one exists.
- `src/frontend/src/styles.css` — scoped `.amenity-chip input` override restoring `appearance: auto`, fixed 16×16 size, zero padding (fixes the real root cause: the global `input { appearance: none; ... }` was stripping the native checkbox glyph).
- `src/backend/CabinConnect.Api/appsettings.Development.json` — `Cors:AllowedOrigins` extended to include Vite fallback ports 5174 and 5175.

### Tests added
- `src/frontend/src/api/client.test.ts` — asserts `POST /api/cabins` body uses `community_id` (snake_case).
- `src/frontend/src/pages/register-cabin-page.test.tsx` — full happy-path render → select community → toggle Wi-Fi → submit, verifying `createCabin` is called with the expected payload.
- `src/frontend/src/pages/edit-cabin-page.test.tsx` — edit flow including community change and Parking toggle.

### Verification
- `npm run test -- --run` → 9 files, 29 tests passed.
- `npm run build` → tsc + vite build succeeded.
- Manual: hard-reload of Vite dev page shows amenity check glyphs and dashboard button disabled states behaving per spec.

### Lessons / retro inputs
- JSDOM-only tests can mask CSS regressions — always smoke a real browser before declaring UI work done.
- The API client is the single right place to translate TS field names to wire JSON. Don't rely on field-name coincidence between camelCase TS interfaces and the API contract.
- `<Link>` cannot be disabled; for state-gated actions use `<button onClick={navigate}>`.
- Dev-port CORS must enumerate every fallback Vite may pick (5173/5174/5175) or pin a fixed `--port`.

---

## Session 2: Docs and hygiene

**Context:** After fixes landed, update README so a fresh clone can run the new contract and gating; tighten `.gitignore` defenses given prior credential exposure.

**Constraints:**
- README must stay terse; defer full setup to `ai-dlc/guidelines/dev-setup.md`.
- `.gitignore` additions limited to clearly justified categories (secrets, Supabase local, EF scratch, backups).

**Acceptance Criteria:**
- README "Running Locally" lists ports, flag, snake_case contract, button-gating, troubleshooting for the four issues hit this session.
- `.gitignore` denies common Supabase local artifacts and `*.local` env files.

**Output Format:** Single README section + appended `.gitignore` block.

### Files changed
- `README.md` — added "Running Locally" with prerequisites, env-var template, migration commands, run commands, verification steps, test/build commands, and a troubleshooting table.
- `.gitignore` — added `**/secrets.json`, `*.env.local`, Supabase local dirs, EF scratch, common backup extensions, AI-DLC local incident scope.
