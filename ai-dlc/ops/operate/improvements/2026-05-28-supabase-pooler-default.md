# Improvement: Supabase pooler is the default DB connection path (EC-011)

**Date:** 2026-05-28
**Triggered By:** [Retro — Bolt repo-scaffold](../retros/repo-scaffold.md)
**Target File:** [ai-dlc/guidelines/edge-cases.md](../../../guidelines/edge-cases.md)
**Status:** Applied

---

## What to Change

Add **EC-011** under "Auth & Access" → no, under a new "Infrastructure & Connectivity" section at the end of the edge-cases file. EC-011 records the fact that Supabase's direct DB hostname (`db.<ref>.supabase.co`) is IPv6-only and almost certainly unreachable from typical dev/CI environments. The Supavisor session pooler is the correct default.

### Current

```
**EC-010 — Zero-night booking**
Check-in and check-out on the same date results in a zero-night stay.
_Mitigation:_ Minimum booking duration is 1 night. Enforce in validation with a clear error message.
```

(file ends here)

### Proposed

```
**EC-010 — Zero-night booking**
Check-in and check-out on the same date results in a zero-night stay.
_Mitigation:_ Minimum booking duration is 1 night. Enforce in validation with a clear error message.

---

## Infrastructure & Connectivity

**EC-011 — Supabase direct DB host is IPv6-only**
`db.<project-ref>.supabase.co` resolves only to AAAA records on the Supabase free / standard tiers. Most Windows dev boxes, many corporate networks, and several CI runners (incl. default GitHub Actions Linux runners until you opt in) cannot reach IPv6, so any direct connection attempt fails opaquely (`DbContext.CanConnectAsync()` returns `false` with no inner exception).
_Mitigation:_ Always use the **Supavisor session pooler** as the default for both runtime app traffic and EF migrations. The hostname is shown in the Supabase dashboard under **Project Settings → Database → Connect → Session pooler**. It looks like `aws-<N>-<region>.pooler.supabase.com:5432` and the username is `postgres.<project-ref>` (note the dot). The `<N>` prefix (`aws-0-`, `aws-1-`, …) is project-specific — copy the hostname verbatim from the dashboard rather than guessing. Transaction pooler (port 6543) is fine for short-lived app queries but does not support prepared statements; use the session pooler for EF migrations.
```

## Why

During `repo-scaffold` Wave 2 we spent ~15 minutes debugging a connection failure that boiled down to "direct host is IPv6-only and we have no v6". Recording this as an edge case ensures the next time someone wires Supabase from a fresh environment, the failure mode is one search away. The runtime-environment audit improvement ([2026-05-28-elaborate-runtime-env.md](2026-05-28-elaborate-runtime-env.md)) cross-references this EC.

## Expected Outcome

- All future units that touch Supabase connection strings reference EC-011 and use the pooler hostname by default.
- Engineers stop pasting the "direct" connection string from Supabase's old dashboard panel and use the **Connect** flow instead.
- Reviewers can grep for `db.*.supabase.co` in `appsettings.*` and flag it.

## Applied

- [x] Target file updated ([ai-dlc/guidelines/edge-cases.md](../../../guidelines/edge-cases.md))
- [x] Retro updated to mark this improvement as applied ([retros/repo-scaffold.md](../retros/repo-scaffold.md))
- [ ] Team notified — n/a (single-operator project at this time)
