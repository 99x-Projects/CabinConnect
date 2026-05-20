## Unit: Volunteer Registration

**Status:** Ready
**Intent:** [Grocery Ordering for Hosts](../../inception/intents/2026-05-20-grocery-ordering.md)

### Context

A community member registers as a Volunteer so they can be assigned grocery delivery
orders. Volunteer is a new auth role not currently in the domain.

### Acceptance Criteria

- Given an authenticated user who is not already a Volunteer, when they submit a registration with name, phone, and service area, then a Volunteer profile is created and linked to their user ID
- Given an authenticated user who is already a registered Volunteer, when they attempt to register again, then a 409 conflict is returned
- Given a registration request missing required fields (name, phone, or service area), when submitted, then a 400 validation error is returned and no profile is created
- Given an unauthenticated request, when the endpoint is called, then a 401 is returned
- Given a registered Volunteer, when they are listed by an admin, then their profile appears with status `Active`

### Scope

**In scope:**
- `POST /volunteers/register` endpoint
- Volunteer fields: userId (FK to Supabase Auth), name, phone, serviceArea, status (`Active` | `Inactive`)
- Volunteer role assigned to user in Supabase Auth custom claims or a `volunteer_profiles` table
- Admin `GET /volunteers` endpoint to list registered volunteers

**Out of scope:**
- Volunteer vetting, ID verification, or background checks
- Volunteer ratings or reputation
- Volunteer deactivation/offboarding (separate admin action)
- Volunteer availability scheduling

### Dependencies

- Supabase Auth for user identity
- `volunteer_profiles` table in Supabase (new table)

### Definition of Done

- [ ] AC covered by tests
- [ ] Prompt quality gate passed
- [ ] Code review complete
- [ ] No new lint or type errors
- [ ] RLS policy on `volunteer_profiles`: user can INSERT their own profile; admin can SELECT all; user can SELECT own
- [ ] New domain term "Volunteer" added to domain-glossary.md
- [ ] Feature toggled off in production until acceptance sign-off
