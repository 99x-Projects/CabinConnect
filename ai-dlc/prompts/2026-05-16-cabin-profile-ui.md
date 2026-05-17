# Prompt Log — Cabin Profile UI (Bolt 02)

**Date:** 2026-05-16
**Bolt:** [Bolt 02 — Cabin Profile UI](../ops/build/bolts/bolt-02-cabin-profile-ui.md)
**Model:** claude-sonnet-4-6

---

## Session: Scaffold Frontend + Bolt 02 Execution

### Scaffold

**Prompt intent:** Set up the React frontend with shadcn/ui, Tailwind v4, TanStack Query, react-hook-form + zod before building any UI units.

**Output summary:**
- `index.css`: Tailwind v4 `@import` + `@theme` block mapping HSL CSS variables to Tailwind color utilities (required for v4; `@layer base` alone is insufficient)
- `src/lib/utils.ts`: `cn()` helper
- `components/ui/`: Button, Card, Input, Label, Dialog, Select, Textarea, Badge, Skeleton, Toast, Toaster
- `hooks/use-toast.ts`: useToast + imperative toast()
- `main.tsx`: QueryClientProvider wrapping App + Toaster; QueryClient configured to not retry on 401
- `services/api.ts`: `ApiError` class (status + message), 401 handler that calls `supabase.auth.signOut()` + `window.location.replace('/login')`

**Key decisions:**
- Tailwind v4 requires `@theme` block with `--color-*` variables pointing to `hsl(var(--...))` — v3 approach of using `@apply border-border` without `@theme` registration fails at build time
- `erasableSyntaxOnly` (TS6) bans parameter property shorthand in constructors — `ApiError` uses explicit field assignment
- `z.coerce.number()` produces `unknown` input type in Zod v4 — switched to `z.number()` with `{ valueAsNumber: true }` in register() to avoid react-hook-form resolver type mismatch
- `required_error` was removed in Zod v4 — use `{ error: '...' }` param on enum

---

## Unit ① — Create User Invitation (API)

**Quality gate:**
- Context: Super admin proxies Supabase inviteUserByEmail via .NET API
- Constraints: service role key server-side only; super admin verified by JWT claim
- AC: 7 Given/When/Then conditions (create, duplicate, pending, 403, 401, resend, cancel)
- Output: Domain + infrastructure + service + controller + tests

**Output summary:**
- `UserRole` entity: `Id`, `UserId` (Supabase auth UID from invite response), `Email`, `Role`, `Status` (pending/active), `InvitedAt`, `AcceptedAt`
- `IUserRoleRepository`: GetPendingByEmailAsync, ExistsActiveByEmailAsync, AddAsync, RemoveAsync, SaveAsync
- `UserRoleConfiguration`: `user_roles` table, unique index on email
- `ISupabaseAdminClient` / `SupabaseAdminClient`: `InviteUserAsync` (POST `/auth/v1/invite`) → returns Supabase UserId; `DeleteUserAsync` (DELETE `/auth/v1/admin/users/{id}`); 422/409 response → UserAlreadyExistsException
- `InvitationService`: checks existing records before calling Supabase; throws typed exceptions
- `InvitationsController`: super admin check via `app_role: super_admin` claim (mapped from `app_metadata.role` in `OnTokenValidated` event); falls back to parsing `app_metadata` JSON if claim absent
- `Program.cs`: added JWT bearer auth with `OnTokenValidated` hook; registered `ISupabaseAdminClient` as typed HttpClient; added `Supabase:ServiceRoleKey` config key
- Tests: 9 tests in `InvitationsControllerTests` covering all 7 ACs + resend/cancel 404 edge cases

**Decisions:**
- `app_role` claim is extracted from `app_metadata.role` during JWT validation and added to the ClaimsIdentity — avoids JSON parsing in every controller action
- `UserAlreadyExistsException` is thrown both when `user_roles.status = active` and when Supabase invite API returns 4xx — both map to HTTP 409
- UserId is always set from the Supabase invite response (even for pending users) so cancel can call `DeleteUserAsync`
- `Microsoft.AspNetCore.Authentication.JwtBearer` must be added explicitly as NuGet in .NET 10

---

## Unit ② — Host Authentication

**Output summary:**
- `context/auth.tsx`: AuthProvider + useAuth hook; manages session via `supabase.auth.getSession()` + `onAuthStateChange`; exposes `user`, `session`, `loading`, `signOut`
- `components/ProtectedRoute.tsx`: shows spinner during loading, redirects to `/login` with `from` state if unauthenticated
- `pages/LoginPage.tsx`: email+password form; redirects to `from` (or `/`) on success; redirects away if already authenticated; inline error on bad credentials
- `services/api.ts`: 401 response triggers `supabase.auth.signOut()` + `window.location.replace('/login')` (EC-008)
- `App.tsx`: BrowserRouter + AuthProvider + routes: `/login`, `/`, `/cabins/:id`, `/invite`, `*→/`

---

## Unit ③ — Cabin List Dashboard

**Output summary:**
- `services/cabins.ts`: full cabin API client (list, get, create, update, getKeyInfo, upsertKeyInfo, amenityTags)
- `components/CabinCard.tsx`: name, location, capacity, isActive badge, amenity tag chips; opacity-50 for inactive; click navigates to `/cabins/:id`
- `pages/DashboardPage.tsx`: `useQuery(['cabins'])` → skeleton loading, error state, empty state with CTA, grid of CabinCards; `refetch()` on create success

---

## Unit ④ — Create Cabin Modal

**Output summary:**
- `components/CreateCabinModal.tsx`: Dialog with react-hook-form + zod; amenity tags fetched on open (`enabled: open`); chips toggle selection; form resets to empty on reopen; 409 → inline name error; tags fetch failure → blocking error state; submit button disabled during request

---

## Unit ⑤ — Cabin Detail & Edit Page

**Output summary:**
- `pages/CabinDetailPage.tsx`: loads cabin via `GET /api/cabins/{id}`; form pre-populated via `reset()`; `isDirty` → `beforeunload` warning; `version` submitted with PUT; 409 stale version → yellow conflict banner with reload button; 409 name duplicate → inline name error; 403/404 → appropriate message; `KeyInfoPanel` embedded below form

---

## Unit ⑥ — Key Information Panel

**Output summary:**
- `components/KeyInfoPanel.tsx`: per-field reveal/hide (access codes, emergency contacts) via separate `GET ?reveal=true` calls; house rules displayed as plaintext; reveal buttons disabled during save; failed reveal shows inline error indicator; save sends only non-empty fields; masked state resets after successful save

---

## Unit ⑦ — User Invitation Management

**Output summary:**
- `services/invitations.ts`: create, resend, cancel API calls
- `pages/InvitePage.tsx`: email + role (Select); 409 pending → yellow banner with Resend / Cancel Invitation buttons; 409 registered → inline email error; 403 → root error; success → toast + form reset; navigable from dashboard header

---

## Changes

### Backend
- `UserRole` entity, `IUserRoleRepository`, `UserRoleRepository`, `UserRoleConfiguration`
- `AppDbContext`: +`UserRoles` DbSet
- `ISupabaseAdminClient`, `SupabaseAdminClient`
- `IInvitationService`, `InvitationService`, `InvitationsController`
- `CreateInvitationRequest` DTO
- `Program.cs`: JWT bearer auth + OnTokenValidated + typed HttpClient for Supabase admin
- `appsettings.json` / `.Development.json`: +`Supabase.ServiceRoleKey`
- Exceptions: `UserAlreadyExistsException`, `PendingInvitationExistsException`, `InvitationNotFoundException`
- Tests: 9 new tests → 59 total (all passing)

### Frontend
- Scaffold: index.css (Tailwind v4 @theme), lib/utils.ts, all shadcn/ui components, hooks/use-toast.ts, Toaster, QueryClientProvider
- context/auth.tsx, components/ProtectedRoute.tsx
- pages/LoginPage.tsx, DashboardPage.tsx, CabinDetailPage.tsx, InvitePage.tsx
- components/CabinCard.tsx, CreateCabinModal.tsx, KeyInfoPanel.tsx
- services/cabins.ts, services/invitations.ts
- types/cabin.ts (updated with full types)
- App.tsx (full routing with AuthProvider)

---

## Outstanding (not in scope for this bolt)
- `user_roles` database migration must be run before Unit ① endpoints work end-to-end
- `Supabase:ServiceRoleKey` + `Supabase:JwtSecret` must be populated from `npx supabase status` output before the API starts
- `/invite/accept` password setup page (Supabase handles the email link — frontend needs the accept page per AC-6/7 of ui-user-invitation.md; deferred)
- Super admin JWT claim must be set manually in Supabase dashboard for the invite flow to be testable end-to-end
