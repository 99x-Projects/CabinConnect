# Intent: Community Boundary & Data Isolation

**Status:** Elaborated
**Date:** 2026-05-19
**Owner:** Asitha (FDE)
**Source in PRD:** CI-01 · Related: NFR-ISO, NFR-AUTH, EC-001, EV-05
**Cluster:** Foundation Cluster (with CI-02, CI-13, CI-14) — see [shared elaboration session](../elaborations/foundation/2026-05-19-session-1.md)

---

## What

Establish the data-isolation foundation that ensures every record in CabinConnect belongs to exactly one Community, and that no user can read or write data outside the Community(ies) they are a member of.

## Why

Norwegian cabin resorts are local social fabrics. NF-03 in the customer brief requires that "each Community is isolated — users only see data for their own Community." NFR-ISO escalates this to "cross-Community data leakage is a P0 bug, verified by automated test on every PR and a manual security audit pre-launch."

Without this as a *platform-level* concern landed before any feature work, every Intent that follows would have to re-implement scoping logic independently — and the system would inherit per-feature security gaps. Doing it once, in the foundation, makes every downstream Unit cheaper and more correct.

## Success Looks Like

- A Cabin Owner only ever sees Cabins, Events, Tool Listings, Orders, etc. belonging to their Community
- A user who is a member of multiple Communities can switch active context, but a single API response never mixes Community data
- Any attempt by user A in Community X to read user B's data in Community Y returns a 404 (not a 403) with no information leak
- Every database table holding Community-scoped data has an RLS policy that the team did not have to write by hand (a template or migration helper enforces it)
- An automated test suite running on every PR proves the boundary holds

## Assumptions

- Multi-Community membership is supported from day one — a single user can belong to multiple Communities (e.g. someone with cabins in Hemsedal *and* Trysil). [Simulated customer approval: 2026-05-19] (cautious framing vs PRD Q-4)
- All data writes derive `community_id` from the requester's JWT-bound active Community, **never** from a client-provided field
- A small number of tables are *not* Community-scoped (e.g. the global Supplier catalogue, system-wide reference data) — these are explicitly enumerated and excluded from RLS scoping

## Open Questions

- **PRD Q-4** — Multi-Community users: confirmed in scope for MVP, or post-MVP only?
- Which exact tables are *not* Community-scoped? Suppliers (RIMA shared across resorts), Tool categories (XC-aligned reference data), and the user identity itself. Anything else?
- How does a user "switch active Community" in the UI — explicit toggle, or per-request? Affects API contract.

## Out of Scope

- Cross-Community federation, search, or admin views (PRD §14)
- Per-feature permission models within a Community (each module decides its own roles)
- Inter-Community data sharing or transfer of any kind in MVP
- Cross-Community user reputation or unified profile aggregation

---

## Elaboration Sessions

| Session | Date | Units Extracted |
|---|---|---|
| [Session 1 — Foundation Cluster](../elaborations/foundation/2026-05-19-session-1.md) | 2026-05-19 | 3 (U-001, U-002, U-003) |

## Extracted Units

| Unit | File | Status |
|---|---|---|
| U-001 Tenant data model | [u-001-tenant-data-model.md](../../build/units/u-001-tenant-data-model.md) | Open |
| U-002 RLS policy template + migration helper | [u-002-rls-policy-template.md](../../build/units/u-002-rls-policy-template.md) | Open |
| U-003 API Community-scope middleware + cross-Community isolation test harness | [u-003-api-community-scope-middleware.md](../../build/units/u-003-api-community-scope-middleware.md) | Open |
