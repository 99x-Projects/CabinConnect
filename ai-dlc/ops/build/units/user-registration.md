# Unit: User Registration

## Context
A new user needs to create an account to access CabinConnect. Registration uses Supabase Auth with email/password — no custom auth implementation.

## Acceptance Criteria
- Given a valid email and password (≥8 characters), when the user submits the registration form, then an account is created in Supabase Auth and the user is redirected to the login page with a success message
- Given an email already in use, when the user submits registration, then a generic error is displayed without confirming whether the email exists (security: no user enumeration)
- Given an invalid email format, when the user attempts to submit, then client-side validation prevents submission and shows a field-level error
- Given a password shorter than 8 characters, when the user attempts to submit, then client-side validation prevents submission

## Scope
**In scope:**
- Registration page with email + password + confirm password fields
- Client-side validation (email format, password length, password match)
- Supabase Auth `signUp` call from the frontend
- Success redirect to login
- Error handling for duplicate email

**Out of scope:**
- Email verification flow
- Password strength meter
- Social/OAuth login providers
- Custom backend registration endpoint (Supabase handles this directly)

## Dependencies
- Supabase project configured with email/password auth enabled
- React project scaffolded with routing

## Definition of Done
- [ ] AC covered by tests
- [ ] Prompt quality gate passed
- [ ] Code review complete
- [ ] No new lint or type errors
- [ ] Feature works in browser
