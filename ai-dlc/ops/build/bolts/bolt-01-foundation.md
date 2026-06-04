# Bolt-01: Foundation — Auth & Cabin CRUD

**Status:** In Progress
**Date Planned:** 2026-06-04
**Target Completion:** 2026-06-04
**Intent:** Cabin Owner Registration & Cabin Profile Creation

---

## Goal

Deliver the first working end-to-end loop: a user can register, log in, create a cabin, and view their cabins on a dashboard. This validates the full stack (React → .NET API → Supabase) and establishes the project scaffold.

## Units (Execution Order)

| # | Unit | Rationale for Order |
|---|---|---|
| 1 | User Registration | Foundation — must create users before anything else |
| 2 | User Login | Depends on registration; needed for all protected features |
| 3 | Protected Route Shell | Depends on login; wraps all authenticated UI |
| 4 | Create Cabin Profile | Depends on auth + route shell; core feature |
| 5 | View Cabin Dashboard | Depends on cabin creation; completes the loop |

## Infrastructure Setup (Pre-unit)

Before executing units, the following must be in place:
1. .NET 8 Web API project created with Supabase JWT validation
2. React + TypeScript project created with Vite, React Router, and Supabase client
3. Supabase project provisioned with `cabins` table and RLS policies
4. Solution file linking backend and frontend in a monorepo structure

## Definition of Done (Bolt-level)

- [ ] All 5 units pass their individual DoD
- [ ] Application runs locally — user can register, login, create cabin, view dashboard
- [ ] No TypeScript or C# compile errors
- [ ] Prompt log created
- [ ] Retro written

## Risks

| Risk | Mitigation |
|---|---|
| Supabase project not provisioned | Provide SQL migration script; user runs manually |
| JWT validation misconfigured | Follow ADR-005 strictly — JWKS endpoint, not symmetric key |
| Frontend auth state race conditions | Use onAuthStateChange pattern per code-standards.md |
