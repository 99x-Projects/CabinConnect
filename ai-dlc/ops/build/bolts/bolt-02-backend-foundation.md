# Bolt: Bolt 2 — Backend Foundation (makes Bolt 1 real)

**Bolt ID:** bolt-02
**Status:** Planned
**Type:** Outcome-scoped foundation Bolt
**Date opened:** —
**Date closed:** —
**Lead:** Asitha (FDE)

> **Bolt definition reminder.** Short, intense build cycle (hours/days, not weeks) packaging 3–8 related Units. Outcome-scoped. Ends with a human-led review gate. *(CLAUDE.md §3 + §5.2; 99x Guardrails.)*

> **Plan-quality, not execution-ready.** Per Principle 3 sub-principle in [`project-review/notes.md`](../../../../project-review/notes.md), Bolt 2 is planned *just enough* to make Bolt 1's mocks honest. The Unit ACs below are starting points; **the Bolt 1 retro is this Bolt's elaboration session** — that's where ACs are refined to full Construction-ready detail.

---

## Goal

Make Bolt 1's mocks real. Persistence, auth, data isolation. Demo afterward: a user can register, sign in, and see real Community-scoped data through the same UI screens that Bolt 1 built on mocks. The swap from mock → real handler should be mechanical because the contracts in `platform/shared/` are already agreed.

## Included Units

| Order | Unit | Source | Status | Notes |
|---|---|---|---|---|
| 1 | [U-T02 CI/CD pipeline](../units/u-t02-cicd-pipeline.md) | TFD §4 | Planned | First — gates everything else |
| 2 | [U-T03 Dev environment (Docker + Supabase local)](../units/u-t03-dev-environment.md) | TFD §5 | Planned | Local stack reproducibility |
| 3 | [U-T05 Database + migration tooling](../units/u-t05-database-migration-tooling.md) | TFD §7 | Planned | Foundation for U-001..U-005 |
| 4 | [U-001 Tenant data model](../units/u-001-tenant-data-model.md) | CI-01 | Planned | Communities + community_id discipline |
| 5 | [U-002 RLS policy template](../units/u-002-rls-policy-template.md) | CI-01 | Planned | apply_community_rls helper |
| 6 | [U-004 Supabase Auth wiring](../units/u-004-supabase-auth-wiring.md) | CI-02 | Planned | Sign-up / sign-in / reset |
| 7 | [U-005 User profile + Community membership model](../units/u-005-user-profile-membership-model.md) | CI-02 | Planned | users + user_communities + invitations |
| 8 | [U-006 JWT validation middleware](../units/u-006-jwt-validation-middleware.md) | CI-02 | Planned | Server-side auth enforcement |

8 Units. Within Bolt sizing cap.

## Suggested Execution Order *(refined in Bolt 1 retro)*

```
U-T02 (CI/CD) ──► U-T03 (Dev env) ──► U-T05 (DB tooling)
                                            │
                                            ▼
                                  U-001 (Tenant data model)
                                            │
                                            ▼
                                  U-002 (RLS template)
                                            │
                                            ├──► U-004 (Auth wiring)
                                            │            │
                                            │            ▼
                                            │    U-005 (User + membership)
                                            │            │
                                            │            ▼
                                            └──► U-006 (JWT middleware)
```

## Cross-Unit Decisions

*To be refined during Bolt 1 retro. Starting points:*

| # | Decision | Affects Units |
|---|---|---|
| BD-BF-1 | The contracts committed in `platform/shared/src/api/` during Bolt 1 (Cabin, Community, User shapes) are honoured by the API handlers — no breaking the agreed surface | All Units |
| BD-BF-2 | Refine the rest of the Cross-Unit Decisions during Bolt 1 retro — the BD-1-1..BD-1-7 set carried over from the Foundation Cluster elaboration session is the candidate list to start from |

## Definition of Done — Bolt Level

*Will be refined in Bolt 1 retro.* Starting point — same shape as Bolt 1 plus:

- [ ] Each `platform/shared/src/api/` contract has a real handler in `platform/backend/` that matches it exactly
- [ ] The Bolt 1 mocks are removable — switching the frontend from mock to real backend is a single-config-flag change
- [ ] Cross-Community isolation test harness (U-003, deferred to Bolt 3) is on the radar with a placeholder PR template
- [ ] Bolt 2 retro written in `ai-dlc/ops/operate/retros/bolt-02.md`

## Deferred from Bolt 2 to Bolt 3+

These were initially in scope, deferred to keep Bolt 2 within the 3–8 cap:

| Unit | Why deferred |
|---|---|
| U-003 Community-scope middleware + isolation harness | Depends on U-001/002/006 being shipped first; cleaner as its own focused Bolt 3 |
| U-008 Critical-read cache strategy | Needs real backend AND the X-Cabin-Cache-Profile header contract — not a foundation concern |
| U-010 Locale resolution chain | Needs U-005/U-006 — small finishing Unit, sits in Bolt 3 |
| U-D03 Accessibility CI gate | Needs U-T02 (CI/CD) — wires in once CI exists, fits Bolt 3 |
| U-D04 Storybook | Designer-staffing-gated; optional |

## Notes

- This Bolt's *real* elaboration session is the **Bolt 1 retro** — not a separate Mob Elaboration. That's the AI-DLC improvements loop in action: Operations phase (retro) feeds back into Inception (Bolt 2 plan refinement) before Construction (Bolt 2 execution).
- The 8 Unit files referenced here have full Given/When/Then ACs already — those are *fine but more than needed for current planning purposes*. Trust the Bolt 1 retro to validate or trim them; don't add more detail speculatively.
