# Unit: U-006 — JWT validation middleware + auth-required-by-default routing

**Owning Intent:** [CI-02 Cabin Owner Registration & Authentication](../../inception/intents/2026-05-19-cabin-owner-auth.md)
**Status:** Open
**Bolt:** Bolt 2 — Backend Foundation *(re-scoped 2026-05-20)*
**Dependencies:** U-004, U-005

---

## Context

.NET 8 API middleware validates the Supabase-issued JWT on every request. JWT claims used downstream: `sub` (user id), `active_community_id`, `locale`. Auth is required by default — adding a new endpoint without `[Authorize]` or `[AllowAnonymous]` is a CI failure. Public routes (visitor instructions, health checks) are explicitly opted out.

## Acceptance Criteria

- Given a request arrives with a valid Supabase JWT, when the middleware runs, then the principal is populated with `sub`, `active_community_id`, `locale` and the request proceeds.
- Given a request arrives without a JWT to a non-public endpoint, when the middleware runs, then the API returns 401 with a generic "authentication required" body.
- Given a request arrives with an *expired* JWT, when the middleware runs, then the API returns 401 with a specific error code (`jwt-expired`) the frontend recognises to trigger `onAuthStateChange` refresh (EC-003).
- Given a request arrives with a malformed or signature-invalid JWT, when the middleware runs, then the API returns 401 — same shape as the no-JWT case (no detail that would leak validation behaviour).
- Given a developer creates a new endpoint without explicit `[AllowAnonymous]` or `[Authorize]`, when the build runs, then a CI check fails with "endpoint missing auth declaration."
- Given a request comes from a Supabase user whose email is unverified, when the middleware runs, then the API returns 403 with error code `email-not-verified`.
- Given the visitor-instruction read endpoint `GET /v/{signed_token}` is hit without a JWT, when the middleware runs, then it passes through (explicit public route per MC-06).

## Scope

**In scope:**
- JWT signature, expiry, and required-claim validation
- Auth-required-by-default route convention + CI enforcement check
- 401 response patterns for expired / invalid / missing JWT
- Email-verified gate (403)
- Explicit public-route opt-out mechanism

**Out of scope:**
- Community-scoping middleware (U-003)
- Supabase Auth wiring itself (U-004)
- User data model (U-005)
- Authorization beyond authentication (per-feature roles)

## Definition of Done

- [ ] AC covered by integration tests (covers all 401 / 403 / pass-through cases)
- [ ] CI check verified by intentionally-broken PR
- [ ] Prompt quality gate passed
- [ ] Code review complete
- [ ] No new lint or type errors
- [ ] Feature toggled off in production until acceptance sign-off — N/A (infra)
