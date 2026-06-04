# Unit: User Login

## Context
Registered users need to authenticate to access protected features. Login uses Supabase Auth — the frontend calls `signInWithPassword` and relies on `onAuthStateChange` for reactive session management (per code-standards.md — no imperative navigate after sign-in).

## Acceptance Criteria
- Given valid credentials (email + password), when the user submits the login form, then they are authenticated and reactively redirected to the dashboard
- Given invalid credentials, when the user submits, then a generic error message is shown ("Invalid email or password") without specifying which field is wrong
- Given a user who is already authenticated, when they navigate to /login, then they are automatically redirected to the dashboard
- Given a successful login, when the session is established, then the JWT is available for subsequent API calls

## Scope
**In scope:**
- Login page with email + password fields
- Supabase Auth `signInWithPassword` call
- Reactive redirect via `onAuthStateChange` (not imperative `navigate()`)
- Generic error display on failure
- Redirect already-authenticated users away from /login

**Out of scope:**
- Password reset / "forgot password" flow
- Remember me / session persistence options
- Multi-factor authentication
- Rate limiting (handled by Supabase)

## Dependencies
- User Registration unit (users must exist to log in)
- React project with routing configured

## Definition of Done
- [ ] AC covered by tests
- [ ] Prompt quality gate passed
- [ ] Code review complete
- [ ] No new lint or type errors
- [ ] Feature works in browser — login → dashboard redirect confirmed
