# Unit: U-010 — Locale resolution chain + user profile locale field

**Owning Intent:** [CI-14 Norwegian + English Localization](../../inception/intents/2026-05-19-localization.md)
**Status:** Open
**Bolt:** Deferred to Bolt 3+ *(re-scoped 2026-05-20 — needs U-005/U-006 from Bolt 2; small finishing Unit)*
**Dependencies:** U-005, U-006, U-009

---

## Context

Resolve the active locale per the chain: explicit user profile `locale` → `Accept-Language` header → default `nb-NO`. The locale is included as a JWT claim (Key Decision D-6) so backends render messages without a DB lookup. Locale changes take effect immediately. Push notifications resolve locale at *delivery* time, not queue time (EC-010), so a user who changed their locale between queue and delivery sees the new locale.

## Acceptance Criteria

- Given an authenticated user with `locale = nb-NO` makes a request, when the backend renders any system message, then the message is in Bokmål.
- Given an authenticated user changes their locale from `nb-NO` to `en` via the profile endpoint, when they make a subsequent request, then their JWT carries `locale = en` and system messages render in English.
- Given an unauthenticated request to a public route (visitor instructions) has `Accept-Language: nb-NO,nb;q=0.9`, when the page renders, then it is in Bokmål.
- Given an unauthenticated request to a public route has no `Accept-Language` header, when the page renders, then it falls back to Bokmål.
- Given a push notification is queued at time T1 with the recipient's locale `nb-NO`, and the recipient changes their locale to `en` at time T2, and the push dispatches at time T3 > T2, when the notification renders, then it is in English (locale resolved at delivery — EC-010).
- Given a transactional email is sent, when it is generated, then it is rendered in the recipient user's profile locale at send time.
- Given a user's `locale` is set to a value the system does not support (e.g. `fr`), when middleware reads it, then the system falls back to `nb-NO` and writes a server-side log entry.

## Scope

**In scope:**
- Locale resolution chain (profile → `Accept-Language` → default)
- Locale as a JWT claim issued at sign-in and on profile update
- `locale` column on `users` (defined in U-005 schema; this Unit operationalises the read/write)
- Profile update flow accepts `locale` field
- Push notification locale resolution at delivery time (EC-010)
- Fallback for invalid / unsupported locale values
- Server-side log entry on fallback

**Out of scope:**
- Translation content
- Date / number / currency formatting (browser `Intl` for MVP; deferred refinement)
- Nynorsk and other locales beyond `nb-NO` / `en`

## Definition of Done

- [ ] AC covered by tests (integration tests covering all resolution-chain paths including EC-010)
- [ ] Prompt quality gate passed
- [ ] Code review complete
- [ ] No new lint or type errors
- [ ] Feature toggled off in production until acceptance sign-off
