# Unit: Protected Route Shell

## Context
Authenticated pages need a consistent layout and route protection. Unauthenticated users must be redirected to login. This unit establishes the app shell (navigation, layout) and the auth guard pattern used by all future protected pages.

## Acceptance Criteria
- Given an unauthenticated user, when they navigate to any protected route (e.g. /dashboard), then they are redirected to /login with the original path preserved for post-login redirect
- Given an authenticated user, when they navigate to a protected route, then the page renders inside a layout shell with navigation (logo, logout button)
- Given a user whose session expires (JWT invalid), when they next attempt a protected action, then they are redirected to /login
- Given an authenticated user clicking "Logout", when clicked, then the session is destroyed and they are redirected to /login

## Scope
**In scope:**
- `ProtectedRoute` wrapper component that checks auth state
- App layout shell (header with nav, main content area)
- Logout functionality
- Auth context/provider wrapping the app
- Loading state while auth state is being determined

**Out of scope:**
- Role-based access (all authenticated users have the same access for MVP)
- Sidebar navigation
- Breadcrumbs

## Dependencies
- User Login unit (auth state must be established)
- Supabase client configured in the frontend

## Definition of Done
- [ ] AC covered by tests
- [ ] Prompt quality gate passed
- [ ] Code review complete
- [ ] No new lint or type errors
- [ ] Manually verified: unauthenticated → redirect; authenticated → renders
