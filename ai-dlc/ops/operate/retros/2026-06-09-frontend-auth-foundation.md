# Retrospective: Frontend Auth Foundation

**Bolt:** [ops/build/bolts/2026-06-09-frontend-auth-foundation.md](../../build/bolts/2026-06-09-frontend-auth-foundation.md)
**Date:** 2026-06-09
**Participants:** Chinthaka

---

## What Went Well

- Unit decomposition from the mob elaboration was accurate — 8 units covered the full auth flow end-to-end with no gaps discovered during execution
- Auth Context Provider pattern (`getSession` on mount + `onAuthStateChange` subscription) was the right choice; no rework required
- Protected Route Guard using the `<Outlet />` layout route pattern was clean and reusable for all future protected routes with zero changes to the guard itself
- Error message constants (no inline strings) kept Login and Registration consistent without extra coordination
- Token-at-call-time approach in API HTTP Client (`supabase.auth.getSession()` on every request) was accepted immediately; no stale-token issues arose
- `useAuth` throwing a descriptive error when used outside the provider caught tree misconfiguration immediately during development
- No Supabase SDK methods needed — `signUp`, `signInWithPassword`, `signOut`, `getSession`, `onAuthStateChange`, `resend` were all available in v2.45.0 as expected (Risk 5 resolved)
- All 8 units executed in the planned single-engineer order (1 → 2 → 5 → 3 → 4 → 8 → 6 → 7) without dependency conflicts

---

## What Didn't Go Well

- **Backlog duplicate rows (Unit 5 mark-done):** When marking Protected Route Guard as Done, the edit to remove it from Open created a `replace_all` conflict because the row text appeared twice — an earlier edit had inserted the remaining Open rows without replacing the original block. Required a full-file `Write` to fix. The surgical `Edit` approach is fragile when the same section has been touched multiple times in a session.
- **LogoutButton not visible after Unit 6:** After Unit 6 was marked done, the user tested `/dashboard` and found no logout button. Unit 6 produces the `LogoutButton` component; Unit 7 renders it. The unit file made this clear in the scope, but it created a confusing moment mid-session where working code appeared broken. There was no warning in the Unit 6 output that the button would not appear until Unit 7 was executed.
- **AC-9 correction during elaboration (pre-bolt):** The registration confirmation screen's "Use a different email" button was initially designed as a form reset. The engineer correctly identified that Supabase creates a session immediately on `signUp`, making a simple reset wrong. The AC was corrected to a "Log out" button calling `signOut()`. This was caught at elaboration time (good), but the initial design missed the Supabase session lifecycle on unverified signups.

---

## AI-Specific Observations

**Prompts that worked well:**
- "Execute unit [name] from bolt [name]" — the four-component gate check ran correctly from the unit file every time; no missing context required
- "Mark unit [name] as done" — three-file update (unit + bolt + backlog) was predictable and consistent

**Prompts that needed revision:**
- None during code generation — all outputs were accepted without rework

**Quality gate failures:**
- None — all units had complete Context, Constraints, ACs, and Output Format in their unit files before execution began

**Output accepted without sufficient review:**
- The `LogoutButton` component was marked Done before the engineer could verify it end-to-end on the dashboard (Unit 7 was not yet complete). The review note said to test after Unit 7, but the unit was still marked Done. The button worked correctly once Unit 7 landed, but the mark-done was slightly premature from a verification standpoint.

---

## Actions

| # | Action | Owner | Target date | Status |
|---|---|---|---|---|
| 1 | Verify email verification is enabled in the Supabase project dashboard (Bolt Risk 1) | Chinthaka | 2026-06-10 | Open |
| 2 | Add `VITE_API_BASE_URL` to `.env.local` for local development | Chinthaka | 2026-06-10 | Open |
| 3 | Write unit tests for each AC across all 8 units before the next bolt begins | Chinthaka | 2026-06-16 | Open |
| 4 | Merge `unit/*` branches to `main` | Chinthaka | 2026-06-10 | Open |

---

## Improvements Triggered

| # | Improvement file | Target rule/guideline | Status |
|---|---|---|---|
| 1 | *(to be linked after review)* | `ai-dlc/guidelines/` — backlog editing protocol | Open |
| 2 | *(to be linked after review)* | Unit execution output — cross-unit visibility warning | Open |

---

## New Intents Triggered

| Intent | Reason |
|---|---|
| *(none at this time)* | All features delivered are within the original intent scope |

