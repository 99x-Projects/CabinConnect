# Unit: Create Cabin Profile

## Context
The core value of CabinConnect — a cabin owner creates a cabin profile with basic details. This requires a .NET API endpoint (POST /api/cabins) and a React form. The cabin is owned by the authenticated user; ownership is enforced server-side and via RLS.

## Acceptance Criteria
- Given a logged-in user, when they submit a valid cabin form (name, location, capacity ≥ 1, amenities), then the cabin is persisted with owner_id = authenticated user's ID and the user is redirected to the dashboard
- Given missing required fields (name or location or capacity), when submitted, then per-field validation errors are displayed and no API call is made
- Given capacity < 1, when submitted, then validation rejects with a clear error message
- Given a valid request to POST /api/cabins, when processed, then the server sets owner_id from the JWT claims (ignores any client-supplied owner_id)
- Given an unauthenticated request to POST /api/cabins, then the server returns 401 Unauthorized

## Scope
**In scope:**
- `POST /api/cabins` endpoint in .NET API
- Cabin domain model: Id, Name, Location, Capacity, Amenities (string[]), OwnerId, CreatedAt
- Cabin DTO for API boundary
- Cabin repository (insert)
- React form page with validation
- Supabase table: `cabins` with RLS policy (owner can insert/select own rows)

**Out of scope:**
- Edit cabin
- Delete cabin
- Cabin images
- Cabin categories or types

## Dependencies
- Protected Route Shell (form is on a protected page)
- .NET API project scaffolded with JWT auth configured
- Supabase `cabins` table created

## Pre-generation Checks
- Grep for existing cabin-related files to avoid duplication

## Definition of Done
- [ ] AC covered by tests (API integration test + frontend component test)
- [ ] Prompt quality gate passed
- [ ] Code review complete
- [ ] No new lint or type errors
- [ ] RLS policy created and documented
- [ ] Feature works end-to-end in browser
