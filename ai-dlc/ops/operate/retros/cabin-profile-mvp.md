# Retrospective: Cabin Profile MVP

**Bolt:** [cabin-profile-mvp](../../build/bolts/cabin-profile-mvp.md)
**Date:** 2026-05-28
**Participants:** Hiran, GitHub Copilot
**Facilitator:** Hiran

---

## What Went Well
- Wave decomposition (1+2, then 3, then 4+5) reduced merge risk and made failures easier to isolate.
- Unit-level acceptance criteria were concrete enough to drive direct test-first verification for each endpoint set.
- Security-sensitive boundaries held: operational details stayed out of public cabin DTOs and owner scoping remained central.
- Frontend and backend stayed contract-aligned after amenity-code normalization and snake_case payload alignment.

## What Didn't Go Well
- Auth debugging took longer than expected because two independent failures looked identical to end users (frontend session race vs backend JWT key discovery).
- Running API processes caused intermittent build/test lock errors (MSB3027/MSB3021), creating avoidable churn.
- Bolt closeout artifacts lagged implementation completion, so status tracking briefly trailed reality.

## AI-Specific Observations

### Prompts that worked as expected
- End-to-end task prompts that included concrete paths, endpoint contracts, and "run tests/build" requirements produced shippable iterations with fewer retries.
- "Continue remaining waves" worked once units/backlog context was already established.

### Prompts that needed revision before output was usable
- Auth issue prompts initially lacked enough runtime evidence; once concrete network/log artifacts were supplied (401 invalid_token, signature key not found), fixes became deterministic.

### Quality gate failures caught
- TypeScript strict-mode regressions were caught immediately by `npm run build` after UI additions.
- Missing log-scrubbing coverage for app logs was detected during closeout review and resolved with dedicated test infrastructure.

### Cases where AI output was accepted without enough review
- Initial Wave 3 closeout was declared before explicit app-log scrubbing assertions existed.
- This was corrected in the same day with `InMemoryLogCollector` and a targeted log-scrubbing integration test.

---

## Actions

| Action | Owner | Target | Improvement File |
|---|---|---|---|
| Add a mandatory "secret-field log assertion" checklist item to API units that handle sensitive fields | Hiran | 2026-05-29 | N/A (captured in this retro; no standalone rule file yet) |
| Include "stop/verify running dev servers" before `dotnet test` in session workflow snippets | Hiran | 2026-05-29 | [2026-05-28-elaborate-runtime-env](../improvements/2026-05-28-elaborate-runtime-env.md) |

## Improvements Triggered
- [x] Existing improvement already created and applicable: [2026-05-28-elaborate-runtime-env](../improvements/2026-05-28-elaborate-runtime-env.md)
- [x] Existing improvement already created and applicable: [2026-05-28-supabase-pooler-default](../improvements/2026-05-28-supabase-pooler-default.md)
- [x] No additional improvement file created for closeout-lag issue because this was a one-day sequencing issue resolved in-session; no recurring rule change warranted yet.

## New Intents Triggered
- None identified — no new product capability gap surfaced; remaining work is operational/process closeout.

---

## Post-Bolt Follow-ups (2026-05-28, same day)

Small UX/contract issues surfaced when running the full stack end-to-end after closeout. All fixed in-session; tests + build green.

| # | Symptom | Root cause | Fix |
|---|---|---|---|
| 1 | "Community id is required." on register submit | Frontend client sent `communityId` (camelCase) instead of the API contract's `community_id` | Explicit snake_case mapping in [src/frontend/src/api/client.ts](../../../../src/frontend/src/api/client.ts) for `createCabin`, `updateOwnCabin`, `upsertOwnCabinOperational`; added regression test in [client.test.ts](../../../../src/frontend/src/api/client.test.ts) |
| 2 | Amenity checkboxes appeared not to toggle | Global `input { appearance: none; width: 100%; padding: 12px 13px; }` in [styles.css](../../../../src/frontend/src/styles.css) stripped the native check glyph from the amenity checkboxes | Scoped `.amenity-chip input` override restoring `appearance: auto`, fixed size, zero padding |
| 3 | Owner dashboard always offered Register/Edit/Operational | No knowledge of whether the user already has a cabin | [owner-home-page.tsx](../../../../src/frontend/src/pages/owner-home-page.tsx) now probes `getOwnCabin()` and disables the wrong-state buttons (`Register` when cabin exists, `Edit`/`Operational` when it doesn't) |
| 4 | Inactive communities offered on register page | Page did not filter by `active` flag (Edit page already did) | Active filter + loading state + disabled select placeholder in [register-cabin-page.tsx](../../../../src/frontend/src/pages/register-cabin-page.tsx); submit button gated on `canSubmit` |
| 5 | "Cabin profile is currently disabled" / "Failed to fetch" | Stale Vite dev server + CORS allow-list didn't cover the actual Vite port | Added 5173/5174/5175 to `Cors:AllowedOrigins`; documented in README troubleshooting table |

**Tests added:** [register-cabin-page.test.tsx](../../../../src/frontend/src/pages/register-cabin-page.test.tsx), [edit-cabin-page.test.tsx](../../../../src/frontend/src/pages/edit-cabin-page.test.tsx), snake_case assertion in [client.test.ts](../../../../src/frontend/src/api/client.test.ts).

**Lessons captured:**
- JSDOM tests can pass while a CSS regression hides the UX outcome — always smoke-test in a real browser before declaring UI units done.
- API boundary mapping should live in one client module; never rely on field-name coincidence between TS interfaces and JSON contracts.
- Action buttons that depend on backend state (`hasCabin`) should be gated, not just routed — `<Link>` cannot be disabled; use `<button onClick={navigate}>` instead.
- Dev-port CORS list must include every fallback port Vite may pick (5173/5174/5175) or document a fixed `--port`.

**Prompt log:** [ai-dlc/prompts/2026-05-28-cabin-profile-mvp-followups.md](../../../prompts/2026-05-28-cabin-profile-mvp-followups.md)
