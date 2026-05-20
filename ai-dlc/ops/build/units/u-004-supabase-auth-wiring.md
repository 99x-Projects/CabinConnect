# Unit: U-004 — Supabase Auth wiring (sign-up, sign-in, email verify, password reset)

**Owning Intent:** [CI-02 Cabin Owner Registration & Authentication](../../inception/intents/2026-05-19-cabin-owner-auth.md)
**Status:** Open
**Bolt:** Bolt 2 — Backend Foundation *(re-scoped 2026-05-20)*
**Dependencies:** none — Supabase Auth is external

---

## Context

Wire Supabase Auth into the React frontend with sign-up, sign-in, email-verification, and password-reset flows. We do not implement these primitives — we configure and integrate them. No-user-enumeration responses on all flows.

## Acceptance Criteria

- Given a user submits a valid email + password on the sign-up screen, when the form is submitted, then Supabase Auth creates the account and sends an email-verification message.
- Given a user clicks the verification link in their email, when they land on the verification handler, then their account is marked verified and they are signed in.
- Given a verified user submits valid credentials on sign-in, when the form is submitted, then they receive a JWT and are redirected to the home screen.
- Given a user requests a password reset, when they submit their email, then Supabase Auth sends a reset email *regardless* of whether that email exists in our system (no user enumeration).
- Given a user clicks a valid reset link, when they submit a new password, then the password is updated and the user is signed in.
- Given a sign-up attempt with an already-registered email, when submitted, then the response is generic ("if your email is valid, you'll receive an email") — no user enumeration.
- Given a malformed email is entered on any flow, when submitted, then the frontend shows an inline validation error *before* hitting the server.

## Scope

**In scope:**
- Sign-up flow (email + password + email verification)
- Sign-in flow
- Password-reset flow (request + complete)
- Email-verification handler page
- No-user-enumeration response patterns on all flows
- Frontend form-level validation

**Out of scope:**
- Social sign-in
- BankID
- MFA (Supabase supports it; deferred per CI-02 Out of Scope)
- Account deletion (deferred)
- Profile management — display name, locale, contact info (U-005)

## Definition of Done

- [ ] AC covered by tests (E2E for auth flows + unit tests for form validation)
- [ ] Prompt quality gate passed
- [ ] Code review complete
- [ ] No new lint or type errors
- [ ] Feature toggled off in production until acceptance sign-off
