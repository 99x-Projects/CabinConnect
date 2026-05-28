# Prompt log — supabase-project-and-auth

**Date:** 2026-05-28
**Unit:** [supabase-project-and-auth](../ops/build/units/supabase-project-and-auth.md)
**Bolt:** [repo-scaffold](../ops/build/bolts/repo-scaffold.md)
**Operator:** Hiran (with GitHub Copilot)

---

## Prompt (verbatim)

> Kick off Wave 2

(Same prompt as the other two Wave 2 logs; followed by the "no Docker" clarification — see notes in [db-migration-tooling log](2026-05-28-db-migration-tooling.md).)

## Quality Gate

- **Context:** wire Supabase Auth end-to-end. Backend (.NET 8) validates Supabase JWTs on every endpoint; frontend (React 18) provides an `AuthProvider` + token-aware API client. Real Supabase project `ctdivdwmicsqpnovczbr.supabase.co` exists; secrets stay in `.env.local` (gitignored).
- **Constraints:** CLAUDE.md §3 — authenticate every endpoint (mark `/health` as public explicitly); never expose internal errors; React app calls the .NET API only (no Supabase data calls from the browser); env vars only for keys; `anon` key only on the client — `service_role` is forbidden on the client. CLAUDE.md §6 EC-008 (expired JWT → refresh-and-retry once). Out of scope: sign-in/sign-up UI implementation (owned by `owner-signup` unit), database tables, RLS policies, OAuth providers.
- **Acceptance Criteria:** the ACs in the unit file — Backend uses `JwtBearer`; validates issuer, audience, lifetime, signature; `ClockSkew = 30s` (not the 5-minute default); `ICurrentUser` lives in Domain; `FallbackPolicy = RequireAuthenticatedUser()` so every endpoint authenticates unless `.AllowAnonymous()` is set; CORS policy explicit (rejects wildcard + credentials at startup); JWT validation matrix tests cover no-token / valid / expired / wrong-audience / wrong-issuer / `/health` anon. Frontend: `supabaseClient` singleton; `AuthProvider` exposes `{ session, user, loading, signOut }` via `useAuth`; `RequireAuth` redirects to `/sign-in`; API client attaches `Authorization: Bearer <jwt>` and retries once on 401 after `refreshSession`; `.env.example` documents `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` with a "no service_role" warning.
- **Output Format:** code in `src/backend/CabinConnect.{Api,Domain,Infrastructure}` and `src/frontend/src/{lib,auth,api,pages}`.

## Generated artifacts

Backend:
- [src/backend/CabinConnect.Domain/Auth/ICurrentUser.cs](../../src/backend/CabinConnect.Domain/Auth/ICurrentUser.cs)
- [src/backend/CabinConnect.Api/Auth/AuthServiceCollectionExtensions.cs](../../src/backend/CabinConnect.Api/Auth/AuthServiceCollectionExtensions.cs)
- [src/backend/CabinConnect.Api/Auth/HttpContextCurrentUser.cs](../../src/backend/CabinConnect.Api/Auth/HttpContextCurrentUser.cs)
- [src/backend/CabinConnect.Api/Cors/CorsServiceCollectionExtensions.cs](../../src/backend/CabinConnect.Api/Cors/CorsServiceCollectionExtensions.cs)
- [src/backend/CabinConnect.Api/Program.cs](../../src/backend/CabinConnect.Api/Program.cs) — wires Auth + CORS + `/health` (`.AllowAnonymous()`) + `/_auth-ping` (diagnostic)
- [src/backend/CabinConnect.Api/appsettings.json](../../src/backend/CabinConnect.Api/appsettings.json) — `SupabaseAuth.{Authority,Audience,JwksUrl}` + `Cors.{AllowedOrigins,AllowCredentials}`
- [src/backend/CabinConnect.Api.Tests/JwtValidationMatrixTests.cs](../../src/backend/CabinConnect.Api.Tests/JwtValidationMatrixTests.cs)
- [src/backend/CabinConnect.Api.Tests/CorsStartupValidationTests.cs](../../src/backend/CabinConnect.Api.Tests/CorsStartupValidationTests.cs)

Frontend:
- [src/frontend/src/lib/supabase-client.ts](../../src/frontend/src/lib/supabase-client.ts)
- [src/frontend/src/auth/auth-context.ts](../../src/frontend/src/auth/auth-context.ts)
- [src/frontend/src/auth/auth-provider.tsx](../../src/frontend/src/auth/auth-provider.tsx)
- [src/frontend/src/auth/require-auth.tsx](../../src/frontend/src/auth/require-auth.tsx)
- [src/frontend/src/auth/auth-provider.test.tsx](../../src/frontend/src/auth/auth-provider.test.tsx)
- [src/frontend/src/api/client.ts](../../src/frontend/src/api/client.ts) — bearer injection + single-retry-on-401
- [src/frontend/src/api/client.test.ts](../../src/frontend/src/api/client.test.ts)
- [src/frontend/src/pages/sign-in-page.tsx](../../src/frontend/src/pages/sign-in-page.tsx), [src/frontend/src/pages/sign-up-page.tsx](../../src/frontend/src/pages/sign-up-page.tsx) — stubs (UI owned by `owner-signup` unit)
- [src/frontend/src/app.tsx](../../src/frontend/src/app.tsx) — wires `<AuthProvider>` + `/sign-in` + `/sign-up` routes
- [src/frontend/src/vite-env.d.ts](../../src/frontend/src/vite-env.d.ts), `.env.example`, `.env.development` — typed `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`

## Acceptance verification

| AC | Result |
|---|---|
| Backend validates Supabase JWTs (issuer/audience/lifetime/signature) | ✅ `TokenValidationParameters` all-true |
| `ClockSkew = 30s` | ✅ Explicit `TimeSpan.FromSeconds(30)` |
| Global auth: every endpoint authenticates unless marked anon | ✅ `FallbackPolicy = RequireAuthenticatedUser()`; `/health` `.AllowAnonymous()` |
| `ICurrentUser` in Domain | ✅ `CabinConnect.Domain.Auth.ICurrentUser` |
| `HttpContextCurrentUser` parses `sub` as Guid | ✅ Throws `InvalidOperationException` when no valid Guid sub |
| CORS rejects wildcard + credentials at startup | ✅ `CorsServiceCollectionExtensions` throws `InvalidOperationException`; covered by 3 unit tests |
| JWT matrix: no-token / valid / expired / wrong-aud / wrong-iss / anon-health | ✅ 6 tests pass in `JwtValidationMatrixTests` |
| Frontend `supabaseClient` uses anon key only | ✅ Module top-level throws if URL/anon-key missing; comment forbids `service_role` |
| `AuthProvider` exposes `{ session, user, loading, signOut }`; subscribes to `onAuthStateChange` and unsubscribes on unmount | ✅ Verified by `auth-provider.test.tsx` (initial state + state-change update) |
| `RequireAuth` redirects unauthenticated → `/sign-in` | ✅ `<Navigate replace state={{ from }}>` |
| API client attaches `Authorization: Bearer` and retries once on 401 | ✅ `client.test.ts` — 3 cases: bearer attached, retry succeeds after refresh, second 401 throws `ApiError` |
| `.env.example` documents anon key + warns about `service_role` | ✅ Inline comment |
| EC-007 (cross-guest access) | n/a here — no booking endpoints yet. Pattern is in place: server validates ownership against `ICurrentUser.Id` once domain code exists |
| EC-008 (expired JWT during long session) | ✅ Front: single refresh+retry. Back: 401 returned on expiry |

Final backend test run: `dotnet test` → **total 14, failed 0, succeeded 13, skipped 1**.
Final frontend test run: `npm test` → **13 passed (4 files)**; `npm run lint` → 0 warnings; `npm run build` → clean.

## Deviations / decisions

- **WireMock dropped (AC deviation).** Original AC called for WireMock to host a fake JWKS endpoint. WireMock-based testing on Windows without containers is heavyweight; instead the test factory holds an in-process `RSA.Create(2048)` and `PostConfigure<JwtBearerOptions>` overrides `Authority`/`MetadataAddress`/`ConfigurationManager` with a literal `IssuerSigningKey = new RsaSecurityKey(rsa)`. Net effect: identical validation coverage — issuer, audience, lifetime, and signature paths all exercised — without the network mock. Documented here so reviewers do not look for a JWKS fixture.
- **`npx supabase start` AC dropped.** Same Docker constraint as the migration-tooling unit. The `.env.example` carries the real Supabase URL placeholder; the user fills `.env.local` with the anon key from the Supabase dashboard. Sign-up/sign-in flows will be exercised end-to-end when `owner-signup` lands.
- **Naming collision rename (carried over from feature-flags).** `FeatureFlags` class became `ConfigurationFeatureFlags` to coexist with its namespace. Mentioned because `Program.cs` lists it next to `AddCabinConnectAuth` in the DI block.
- **`AddCabinConnectPersistence` silent-skip behaviour.** Was throwing when the connection string was missing; that broke the JWT test factory (it doesn't need a DB). Changed to skip-and-log; runtime still fails clearly if anything resolves `CabinConnectDbContext`. Same change is mentioned in the migration-tooling log because both units touched it.
- **`null!` suppression in test JwtBearer post-configure.** `Authority` and `MetadataAddress` are non-nullable in the source SDK; we set them to `null!` and clear `ConfigurationManager` to force the explicit `IssuerSigningKey` path. CS8625 suppressed locally with `!`.
- **`MintToken` `notBefore` bug.** First version computed `notBefore = now - 1 minute` and `expires = now - 5 minutes` for the expired-token test → `JwtSecurityToken` ctor throws IDX12401 ("Expires <= NotBefore"). Fix: `notBefore = expires - 10 minutes`.
- **`useAuth` extracted to `auth-context.ts`.** ESLint `react-refresh/only-export-components` flagged the hook + provider co-export. Splitting the hook+context into a separate module keeps fast-refresh boundaries clean and lint zero-warning.
- **Vitest `vi.mock` hoisting.** First version referenced top-level mock vars from the factory — vitest hoists `vi.mock` calls above the file, so the captures were undefined. Fix: use `vi.hoisted(() => ({...}))` for shared mock fns.
- **Frontend `service_role` policy.** `.env.example` plus an inline comment in `supabase-client.ts` make the rule explicit: only the `anon` key is allowed on the browser. `service_role` belongs on the .NET side (when it eventually needs it).
