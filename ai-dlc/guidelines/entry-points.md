# Entry Points

Approved modules and features where AI-DLC Bolts may begin. This controls the expansion boundary. Update as the team gains confidence with the process.

---

| Module / Feature | Status | Notes |
|---|---|---|
| Frontend — component layer | **Approved** | React components in `src/frontend/src/components/` and `src/frontend/src/pages/`. Start here for UI Bolts. |
| Frontend — service layer | **Approved** | API service modules in `src/frontend/src/services/`. Approved for API integration work. |
| Frontend — hooks | **Approved** | Custom hooks in `src/frontend/src/hooks/`. Approved for extracting component logic. |
| Backend — API layer (new endpoints) | **Approved** | New controllers and service methods for unimplemented features (e.g., blackout dates, seasonal rates, bookings). |
| Backend — test suite | **Approved** | Adding tests for existing and new units. No production risk. |
| Backend — domain layer (new entities) | **Approved** | Adding new domain entities and exceptions for features not yet implemented. |
| Backend — infrastructure layer (new repositories) | **Approved** | New repository implementations for new entities. |
| Backend — existing services (modifications) | **Approved with feature flag** | Modifications to `CabinService`, `CabinKeyInfoService`, or `InvitationService` require a feature flag (ADR-009). |
| Database — schema | **Blocked** | All schema changes go via `supabase/migrations/` which is a forbidden zone. Describe required migration; engineer writes it manually. |
| Auth configuration (`Program.cs` JWT section) | **Pending** | High blast radius — changes affect all endpoints. Requires explicit sign-off before starting a Bolt. |

---

## Expansion Protocol

When the team is ready to add a new module to the Approved list:

1. Ensure the module has adequate test coverage (or a Remediation Bolt to add tests is planned first)
2. Confirm a feature flag can wrap new behaviour in this module
3. Add the module to this file with `Approved` status
4. Note any constraints (e.g., "requires feature flag", "read-only first")

Update this file in the same PR as the CLAUDE.md change.
