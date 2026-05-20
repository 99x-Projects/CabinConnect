# Unit: U-008 — Critical-read cache strategy

**Owning Intent:** [CI-13 Offline-First Caching for Critical Reads](../../inception/intents/2026-05-19-offline-caching.md)
**Status:** Open
**Bolt:** Deferred to Bolt 3+ *(re-scoped 2026-05-20 — needs real backend AND the X-Cabin-Cache-Profile contract; not a foundation concern)*
**Dependencies:** U-007, U-006

---

## Context

When the API responds with `X-Cabin-Cache-Profile: critical-24h` (Key Decision D-8), the service worker stores the response keyed by `(user_id, route, query)` with a 24h TTL (Key Decision D-7 — user-keyed, not device-keyed). On subsequent fetches: cache-first if within window, stale-while-revalidate on success. The cache is purged synchronously on sign-out (closes EC-009). LRU eviction kicks in at a per-user storage budget (default 5 MB; final budget per OQ-2).

## Acceptance Criteria

- Given an API response carries `X-Cabin-Cache-Profile: critical-24h`, when the service worker intercepts it, then the response is stored in the critical-read cache with key `(current_user_id, route+query)` and TTL 24h.
- Given a request is made for a cached critical route while online, when the service worker handles it, then the cached response is returned immediately AND a background fetch refreshes the cache (stale-while-revalidate).
- Given a request is made for a cached critical route while offline, when the service worker handles it, then the cached response is returned and the UI displays an "offline — last updated {timestamp}" indicator.
- Given the user signs out, when the sign-out handler runs, then all critical-read cache entries for that `user_id` are purged synchronously *before* the session ends.
- Given user A signs out and user B signs in on the same device, when user B accesses critical routes, then they see only freshly-fetched (or B-cached) data — never A's cached state (EC-009).
- Given a critical-read entry is older than 24h AND the user is offline, when the route is requested, then the cache returns the stale data BUT the UI shows a "data is more than 24 hours old" warning.
- Given an API response carries `X-Cabin-Cache-Profile: no-cache`, when the service worker intercepts it, then no entry is written to the critical-read cache.
- Given the cache total size for the current user exceeds the per-user budget when writing a new entry, when the write executes, then the oldest entries are evicted LRU until the new entry fits.

## Scope

**In scope:**
- The `X-Cabin-Cache-Profile` response header contract (`critical-24h` / `standard` / `no-cache`)
- Cache write logic, key structure, TTL
- Cache-first + stale-while-revalidate flow
- Sign-out purge logic
- Per-user keying (EC-009)
- Stale-data warning UI surface
- LRU eviction at the per-user budget cap

**Out of scope:**
- Mutation queue / offline writes
- Which specific endpoints carry which profile (decided per feature, not in this Unit)
- Background sync pull from server

## Definition of Done

- [ ] AC covered by tests (Playwright offline tests covering user-A → user-B isolation)
- [ ] Prompt quality gate passed
- [ ] Code review complete
- [ ] No new lint or type errors
- [ ] Feature toggled off in production until acceptance sign-off
