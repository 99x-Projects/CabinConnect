# Unit: U-003 — API Community-scope middleware + cross-Community isolation test harness

**Owning Intent:** [CI-01 Community Boundary & Data Isolation](../../inception/intents/2026-05-19-community-boundary.md)
**Status:** Open
**Bolt:** Deferred to Bolt 3+ *(re-scoped 2026-05-20 — needs U-001/002/006 from Bolt 2 first; cleaner as its own focused integration Bolt)*
**Dependencies:** U-001, U-002, U-006

---

## Context

The .NET API middleware extracts the active `community_id` from the authenticated JWT and sets it on the per-request DB session as `app.community_id` — the variable the RLS policies (U-002) read. The Unit also delivers a cross-Community **isolation test harness** that runs in CI on every PR: it instantiates an "alien" user from Community Y and hits every Community-scoped endpoint, asserting 404 with no information leak.

Per Key Decision D-2, the active Community is a JWT claim, not a per-request DB lookup. Per D-5, the isolation test harness lives at the API integration layer, not pure unit tests.

## Acceptance Criteria

- Given an authenticated request arrives with a JWT containing the `active_community_id` claim, when the middleware runs, then `app.community_id` is set on the DB session for the duration of the request.
- Given a request has no `active_community_id` claim (the user has joined no Community), when the request hits any Community-scoped endpoint, then the API returns 403 with a body identifying "join a Community first" as the cause.
- Given a request body includes a `community_id` field that doesn't match the JWT's `active_community_id`, when the API processes it, then the request is rejected with 400 (the client cannot override scoping — Key Decision D-2).
- Given a user with Communities X and Y has switched active to X, when they request a resource that exists only in Y, then the API returns 404 (not 403) with no detail that would let them infer the resource's existence (EC-001).
- Given the isolation test harness runs in CI, when invoked against every Community-scoped endpoint with an alien user from Community Y, then every endpoint returns 404 and the harness reports green.
- Given a request was issued under JWT-X (active=X) and is in flight when the user switches to active=Y, when the in-flight request completes, then any write lands in Community X — not in Y (EC-008).

## Scope

**In scope:**
- Middleware that resolves `active_community_id` from JWT and sets `app.community_id` on the DB session
- 400 / 403 / 404 response patterns per the ACs
- The cross-Community isolation test harness as a CI step
- EC-008 handling (in-flight request post-context-switch)

**Out of scope:**
- JWT signature/expiry validation itself (U-006)
- Data model (U-001) and RLS policies (U-002)
- Community context-switching UI in the frontend (deferred to a later Intent)

## Definition of Done

- [ ] AC covered by integration tests
- [ ] Isolation test harness running green in CI
- [ ] Prompt quality gate passed
- [ ] Code review complete
- [ ] No new lint or type errors
- [ ] Feature toggled off in production until acceptance sign-off — N/A (infra)
