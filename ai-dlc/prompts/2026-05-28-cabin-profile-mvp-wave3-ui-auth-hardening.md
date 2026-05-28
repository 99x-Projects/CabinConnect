# Prompts — cabin-profile-mvp Wave 3 UI + auth hardening

**Date:** 2026-05-28
**Bolt:** [cabin-profile-mvp](../ops/build/bolts/cabin-profile-mvp.md)
**Units impacted:** [cabin-view-edit](../ops/build/units/cabin-view-edit.md) (UI groundwork only), [owner-signup](../ops/build/units/owner-signup.md) (auth flow hardening)
**Operator:** Hiran (mob with Copilot)

---

## Session: Frontend UI implementation for shipped backend scope

**Context:** User requested implementing UIs for completed work (auth, users/me, communities, register-cabin) before Wave 3 backend endpoints land.
**Constraints:**
- Keep React calling .NET API only for data mutations
- Preserve existing feature-flag model (`cabin_profile_mvp`)
- Avoid changing backlog status for unfinished Wave 3 backend units
**Acceptance Criteria:**
- Authenticated owner flow reachable and usable from frontend
- Register-cabin UX aligned with existing API contract
- Frontend tests remain green
**Output Format:** Route wiring + page components + styling + tests.

### Frontend artefacts
- Routed protected owner pages in `src/frontend/src/app.tsx`:
  - `/my-cabin` (owner home)
  - `/my-cabin/register` (behind feature flag)
- Added owner home page:
  - `src/frontend/src/pages/owner-home-page.tsx`
- Updated auth success navigation (sign-in/sign-up) to owner area:
  - `src/frontend/src/pages/sign-in-page.tsx`
  - `src/frontend/src/pages/sign-up-page.tsx`
- Reworked register-cabin page and validations:
  - `src/frontend/src/pages/register-cabin-page.tsx`
- Fixed amenities payload mismatch by switching from labels to seeded codes:
  - `src/frontend/src/constants/amenities.ts`

### Design pass
- Added full theme + responsive layout + visual hero/illustration language:
  - `src/frontend/src/styles.css`
- Wired global stylesheet:
  - `src/frontend/src/main.tsx`
- Redesigned pages for consistent visual system:
  - `sign-in`, `sign-up`, `owner-home`, `register-cabin`, `health`

### Test status
- Frontend tests stayed green throughout (24/24 passing after each stabilization pass).

---

## Session: Auth redirect loop investigation and fixes

**Context:** User reported repeated redirect to sign-in and 401s after apparently successful Supabase sign-in.
**Constraints:**
- Keep security controls intact (no anonymous bypass of protected APIs)
- Prefer targeted fixes before broad architectural changes
- Preserve strict TypeScript and lint constraints
**Acceptance Criteria:**
- Successful sign-in does not bounce back to sign-in
- `/api/users/me` returns 200 for authenticated user
- No redirect loop in protected routes
**Output Format:** Incremental auth hardening in frontend + backend validation fix.

### Symptoms observed
- Browser local storage token key was null during failing loop.
- API response details showed: `401 invalid_token`, `The signature key was not found`.
- Supabase password grant returned `200`, confirming credentials were valid.

### Frontend hardening changes
- `AuthProvider` race fix: initial `getSession()` no longer overwrites a newer auth-state session (`current ?? data.session`).
  - `src/frontend/src/auth/auth-provider.tsx`
- Sign-in flow waits for persisted session before navigating; added explicit `setSession` using returned access/refresh tokens.
  - `src/frontend/src/pages/sign-in-page.tsx`
- Sign-in page auto-forwards if a session appears via `getSession` or `onAuthStateChange`.
  - `src/frontend/src/pages/sign-in-page.tsx`
- RequireAuth guard stabilized to avoid immediate false redirects while auth resolution is in flight.
  - `src/frontend/src/auth/require-auth.tsx`

### Backend fix that resolved 401 invalid_token
- Corrected JWT bearer metadata configuration to use OpenID discovery metadata endpoint derived from `Authority`.
  - `src/backend/CabinConnect.Api/Auth/AuthServiceCollectionExtensions.cs`
- Root issue: raw JWKS endpoint had been assigned as `MetadataAddress` in the auth middleware path under test; this caused key resolution/signature validation failure in runtime.

### Validation evidence
- User-reported backend logs after fix showed successful authenticated calls:
  - multiple `GET /api/users/me` responses with HTTP 200
  - lazy user provisioning insert succeeded
- This confirmed end-to-end auth and owner profile bootstrap behavior.

---

## Session: Cleanup

**Context:** After stabilization, user requested cleanup and server shutdown.
**Changes made:**
- Removed temporary diagnostic copy/helper from `sign-in-page`.
- Restored JWT auth failure logging from warning back to debug in auth middleware.
- Stopped backend process on port 5000.

---

## Pitfalls captured
- A running `dotnet run` process can lock API binaries and break `dotnet test`/build with MSB3027/MSB3021; kill stale PID before rebuild.
- Browser auth loops can stem from two independent causes that look similar:
  1. frontend session persistence/race issues
  2. backend JWT key discovery mismatch
- Distinguishing signals:
  - Supabase `/auth/v1/token` 200 + backend `/api/users/me` 401 with `signature key was not found` indicates backend validation config issue, not invalid credentials.
