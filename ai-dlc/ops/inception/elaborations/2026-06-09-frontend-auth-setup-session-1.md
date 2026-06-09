# Elaboration Session: Frontend Application with Supabase Authentication — Session 1

**Intent:** [intents/2026-06-09-frontend-auth-setup.md](../intents/2026-06-09-frontend-auth-setup.md)
**Date:** 2026-06-09
**Participants:** Engineer
**Session goal:** Decompose the frontend auth setup intent into all atomic units required to deliver a working React + Supabase auth flow from scaffold to dashboard.

---

## Units Agreed This Session

| # | Unit name | Purpose | ACs agreed? | Edge cases surfaced? |
|---|---|---|---|---|
| 1 | Project Scaffold | Vite + React 18 + TS strict + Supabase client singleton + folder structure | Yes | Yes |
| 2 | Auth Context Provider | Tracks session via `onAuthStateChange`, exposes `user`/`session`/`loading` to the component tree | Yes | Yes |
| 3 | Guest Registration | Email/password registration, verification email sent, resend + logout on confirmation screen | Yes | Yes |
| 4 | Guest Login | Email/password login, redirect to `/dashboard`, human-readable errors, rate limiting | Yes | Yes |
| 5 | Protected Route Guard | Redirects unauthenticated users to `/login`, defers until `loading: false` | Yes | Yes |
| 6 | Guest Logout | Calls `signOut()`, clears session, redirects to `/login` | Yes | Yes |
| 7 | Dashboard Page | Welcome message using display name or email from Auth Context | Yes | Yes |
| 8 | API HTTP Client | Attaches JWT Bearer token to all .NET API requests | Yes | Yes |

---

## Unit Detail

### Unit 1: Project Scaffold

**Purpose:** Initialise the CabinConnect React 18 + TypeScript (strict mode) frontend project using Vite, establish the folder structure, and create the Supabase client singleton.

**Acceptance Criteria:**
1. Given the repository is cloned, when a developer runs `npm install && npm run dev`, then the Vite dev server starts without errors and the app renders in a browser.
2. Given the project exists, when TypeScript strict mode is checked, then `tsconfig.json` has `"strict": true` and `tsc --noEmit` reports zero errors on the initial scaffold.
3. Given `.env.local` contains `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`, when the Supabase client singleton is imported anywhere in the app, then it initialises using those values without exposing them in the bundle as hardcoded strings.
4. Given `.env.local` is missing or either variable is absent, when the app starts, then it throws a clear startup error identifying the missing variable by name.
5. Given the project is scaffolded, when a developer inspects the folder structure, then `src/` contains at minimum: `components/`, `pages/`, `lib/supabase.ts`, and `App.tsx` with a basic router stub.
6. Given the project is scaffolded, when a developer inspects the repo, then `.env.local` is listed in `.gitignore` and an `.env.example` file exists documenting `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` as required variables with placeholder values.

**Edge cases surfaced:**
- Supabase client HMR re-instantiation: singleton must use a module-level variable pattern so Vite HMR does not create duplicate instances
- `VITE_SUPABASE_ANON_KEY` name in `ai-dlc/guidelines/dev-setup.md` must be updated to `VITE_SUPABASE_PUBLISHABLE_KEY` in this unit

**Open questions:**
- None

---

### Unit 2: Auth Context Provider

**Purpose:** Create a React context that tracks the Supabase auth session using `onAuthStateChange` and exposes `user`, `session`, and `loading` to the entire component tree.

**Acceptance Criteria:**
1. Given the app loads, when Supabase resolves the initial session check, then the context provides the current `user` and `session` (or `null` for both if unauthenticated) to any consuming component.
2. Given a Guest logs in, when `onAuthStateChange` fires with a `SIGNED_IN` event, then the context updates `user` and `session` and all consuming components re-render with the new values.
3. Given a Guest logs out, when `onAuthStateChange` fires with a `SIGNED_OUT` event, then the context sets `user` and `session` to `null` and all consuming components re-render.
4. Given the app is waiting for the initial session check to complete, when a component reads from context, then a `loading` boolean is `true` — preventing a premature redirect to login before auth state is known.
5. Given the Auth Context Provider is mounted, when the component unmounts, then the `onAuthStateChange` subscription is cleaned up to prevent memory leaks.
6. Given a component outside the Auth Context Provider attempts to use the context hook, when it renders, then it throws a clear error identifying that the hook must be used inside the provider.
7. Given the Guest's JWT is silently refreshed by Supabase, when `onAuthStateChange` fires a `TOKEN_REFRESHED` event, then the context updates `session` so all consuming components hold a valid token without requiring re-login.

**Edge cases surfaced:**
- EC-008: Context must update `session` on `TOKEN_REFRESHED` — covered by AC-7
- Loading flash: Protected Route Guard (Unit 5) must not redirect until `loading: false` — carried forward to Unit 5
- Multi-tab logout: `onAuthStateChange` fires across tabs; handled automatically — no additional AC needed

**Open questions:**
- None

---

### Unit 3: Guest Registration

**Purpose:** Provide a registration page where a Guest can enter their email and password to create an account; on success, Supabase sends a verification email and the page shows a confirmation screen with resend and logout options.

**Acceptance Criteria:**
1. Given an unauthenticated user is on the registration page, when they submit a valid email and password, then Supabase `signUp` is called and the form is replaced with a confirmation message instructing the Guest to check their email — including "If you don't see it, check your spam folder."
2. Given the registration form is submitted, when either the email or password field is empty, then a human-readable validation message appears inline and `signUp` is not called.
3. Given the registration form is submitted, when the email format is invalid, then a human-readable inline error appears and `signUp` is not called.
4. Given a valid email and password are submitted, when Supabase returns an "email already in use" error, then the message "An account with this email already exists. Try logging in instead." is shown — no raw error code is visible.
5. Given a valid email and password are submitted, when Supabase rejects the password (too short or too weak), then a human-readable message describing the requirement is shown.
6. Given a valid submission is in progress, when the request is pending, then the submit button is disabled and shows a loading state — the disabled state is applied synchronously on first click.
7. Given the registration form is submitted, when a network or unexpected error occurs, then the message "Something went wrong. Please try again." is shown — no stack trace or internal detail is visible.
8. Given the confirmation screen is showing, when the Guest clicks "Resend confirmation email", then `supabase.auth.resend()` is called with the registered email and the message "Confirmation email resent — check your inbox and spam folder." is shown; if the resend fails, a human-readable error is shown.
9. Given the confirmation screen is showing, when the Guest clicks "Log out", then `supabase.auth.signOut()` is called, the session is cleared, and the Guest is redirected to the login page.

**Edge cases surfaced:**
- Already-authenticated Guest visiting `/register` must be redirected to `/dashboard`
- Duplicate submission prevented by synchronous disabled state on first click (AC-6)

**Open questions:**
- None

---

### Unit 4: Guest Login

**Purpose:** Provide a login page where a Guest can enter their email and password to sign in; on success they are redirected to `/dashboard`, and all auth errors including unverified email are shown as human-readable messages.

**Acceptance Criteria:**
1. Given an unauthenticated Guest is on the login page, when they submit a valid email and correct password for a verified account, then `signInWithPassword` is called and the Guest is redirected to `/dashboard`.
2. Given the login form is submitted, when either the email or password field is empty, then a human-readable inline validation message appears and `signInWithPassword` is not called.
3. Given a valid email and password are submitted, when the account exists but the email has not been verified, then the message "Please verify your email before logging in. Check your inbox and spam folder." is shown — login is blocked.
4. Given a valid email is submitted, when the password is incorrect, then the message "Incorrect email or password." is shown — no indication of which field is wrong (prevents account enumeration).
5. Given an email is submitted that has no account, when `signInWithPassword` returns a user-not-found error, then the same message "Incorrect email or password." is shown.
6. Given a valid submission is in progress, when the request is pending, then the submit button is disabled and shows a loading state.
7. Given the login form is submitted, when a network or unexpected error occurs, then "Something went wrong. Please try again." is shown with no internal detail.
8. Given an already authenticated Guest navigates to the login page, when the page renders, then they are redirected to `/dashboard` immediately.
9. Given the Guest has made too many failed login attempts, when Supabase returns a rate-limit error, then the message "Too many attempts. Please wait a moment before trying again." is shown.

**Edge cases surfaced:**
- EC-008: Token refresh owned by Auth Context Provider (Unit 2) — no additional handling in this unit
- Redirect target after login is always `/dashboard` — no return-to-original-route logic in scope

**Open questions:**
- None

---

### Unit 5: Protected Route Guard

**Purpose:** Wrap any route that requires authentication so that unauthenticated users are redirected to `/login`, and the redirect decision is deferred until the Auth Context has resolved its initial session check.

**Acceptance Criteria:**
1. Given an authenticated Guest navigates to a protected route, when the Auth Context has resolved, then the route renders normally with no redirect.
2. Given an unauthenticated user navigates to a protected route, when the Auth Context has resolved with no session, then the user is redirected to `/login`.
3. Given the Auth Context `loading` is `true`, when a protected route is rendered, then a loading indicator is shown and no redirect occurs — preventing a flash of the login screen for authenticated users.
4. Given the Guest's session expires while they are on a protected route, when the Auth Context updates to `null`, then the user is redirected to `/login` automatically.
5. Given the `/dashboard` route exists, when it is wrapped with the Protected Route Guard, then an unauthenticated direct URL visit to `/dashboard` redirects to `/login`.
6. Given the Protected Route Guard is applied to a route, when a new protected route is added to the app in future, then the guard can be applied by wrapping the route with the same component — no changes to the guard itself are needed.

**Edge cases surfaced:**
- Loading flash carried from Unit 2: loading indicator must render synchronously on first paint — not after a tick
- Multi-tab logout: handled automatically by Auth Context firing `SIGNED_OUT` — AC-4 covers the resulting redirect
- Nested protected routes: safe because guard reads session state from context, not a route-level flag

**Open questions:**
- None

---

### Unit 6: Guest Logout

**Purpose:** Provide a logout action on the dashboard that calls `supabase.auth.signOut()`, clears the session, and redirects the Guest to `/login`.

**Acceptance Criteria:**
1. Given an authenticated Guest is on the dashboard, when they click the "Log out" button, then `supabase.auth.signOut()` is called, the session is cleared from the Auth Context, and the Guest is redirected to `/login`.
2. Given the logout request is in progress, when the request is pending, then the "Log out" button is disabled and shows a loading state to prevent duplicate calls.
3. Given the Guest has logged out, when they press the browser back button, then they are redirected to `/login` and the dashboard is not accessible.
4. Given `supabase.auth.signOut()` fails due to a network error, when the error is returned, then the message "Logout failed. Please try again." is shown and the Guest remains on the dashboard with their session intact.

**Edge cases surfaced:**
- Supabase clears local session even if server-side token invalidation fails — AC-4 covers the UI error; implementation must account for the local session potentially being cleared regardless
- Multi-tab logout: handled automatically by `onAuthStateChange` in Auth Context — no additional handling in this unit

**Open questions:**
- None

---

### Unit 7: Dashboard Page

**Purpose:** Provide the `/dashboard` route showing a personalised welcome message using the authenticated Guest's display name or email from the Auth Context session.

**Acceptance Criteria:**
1. Given an authenticated Guest is on `/dashboard`, when the page renders, then a welcome message is displayed showing "Welcome, [display name]" if `user.user_metadata.full_name` is set, or "Welcome, [email]" if it is absent or empty.
2. Given the Auth Context `user` has no display name and no email (an unexpected state), when the page renders, then the message falls back to "Welcome!" with no blank or `undefined` value shown.
3. Given an authenticated Guest is on `/dashboard`, when the page renders, then the "Log out" button (Unit 6) is visible and accessible.
4. Given an unauthenticated user navigates directly to `/dashboard`, when the page attempts to render, then the Protected Route Guard (Unit 5) redirects them to `/login` before the dashboard content is shown.

**Edge cases surfaced:**
- Auth Context still loading: page must handle `user` being `null` momentarily — show a loading state before rendering the welcome message
- Display name source: `user.user_metadata.full_name` — not a top-level `name` field; falls back to `user.email`

**Open questions:**
- None

---

### Unit 8: API HTTP Client

**Purpose:** Create a reusable HTTP client that attaches the authenticated Guest's JWT from the Supabase session as a `Bearer` token on every request to the .NET API.

**Acceptance Criteria:**
1. Given an authenticated Guest triggers any API call, when the HTTP client sends the request, then an `Authorization: Bearer <jwt>` header is attached using the current session token retrieved at call time — not a cached copy.
2. Given the JWT has been silently refreshed by Supabase, when the next API call is made, then the HTTP client attaches the refreshed token — not the previous one.
3. Given the app is configured with `VITE_API_BASE_URL` in `.env.local`, when the HTTP client is used, then all requests are sent to that base URL — no hardcoded API URLs exist anywhere in the codebase.
4. Given an unauthenticated state, when a component attempts an API call through the HTTP client, then the request is sent without an `Authorization` header — the client does not throw or block.
5. Given the .NET API returns a `401 Unauthorized` response, when the HTTP client receives it, then the error is propagated to the calling component as a typed error — not silently swallowed.
6. Given `.env.local` is missing `VITE_API_BASE_URL`, when the HTTP client is initialised, then a clear startup error identifying the missing variable is thrown.

**Edge cases surfaced:**
- EC-008: Token must be retrieved via `supabase.auth.getSession()` at call time — not stored in the client instance
- Token refresh in flight: Supabase queues calls internally — accepted limitation, no additional handling needed
- Network failure: propagated to calling component as a typed network error — same propagation behaviour as AC-5

**Open questions:**
- None

---

## Session Notes

- The Supabase env variable name has changed from `VITE_SUPABASE_ANON_KEY` to `VITE_SUPABASE_PUBLISHABLE_KEY`. Unit 1 must update `ai-dlc/guidelines/dev-setup.md` and `.env.example` to reflect this.
- `VITE_API_BASE_URL` is required by Unit 8. Unit 8 must add this variable to the existing `.env.example` created by Unit 1.
- All auth error messages must be human-readable — no raw Supabase error codes or stack traces visible to the user. This applies to Units 3, 4, and 6.
- The execution order for implementation is: Unit 1 → Unit 2 → Units 3, 4, 5, 8 (parallel) → Unit 6 → Unit 7.

---

## Next Session

**Goal:** Not required — all units for this intent have been elaborated and agreed in this session.
**Prerequisite:** Engineer signs off on unit files and backlog before coding begins.
