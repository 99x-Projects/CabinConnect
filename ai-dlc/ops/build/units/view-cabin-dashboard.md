# Unit: View Cabin Dashboard

## Context
After creating cabins, owners need to see them. The dashboard is the landing page for authenticated users — it lists their cabins and provides a path to create new ones. This requires a GET endpoint and a React dashboard page.

## Acceptance Criteria
- Given a user with one or more cabins, when they visit /dashboard, then all their cabins are listed showing name, location, and capacity
- Given a user with zero cabins, when they visit /dashboard, then an empty state is shown with a "Create your first cabin" call-to-action
- Given multiple users in the system, when user A views the dashboard, then only user A's cabins are returned (RLS + server validation)
- Given an unauthenticated request to GET /api/cabins, then the server returns 401 Unauthorized
- Given a valid request to GET /api/cabins, when processed, then only cabins where owner_id matches the JWT subject are returned

## Scope
**In scope:**
- `GET /api/cabins` endpoint in .NET API (returns only current user's cabins)
- Cabin repository (query by owner_id)
- React dashboard page with cabin list
- Empty state UI
- Navigation link to "Add Cabin" form

**Out of scope:**
- Pagination (not needed for MVP — low cabin count per user)
- Search or filtering
- Cabin detail page
- Edit/delete actions

## Dependencies
- Create Cabin Profile unit (cabins must exist to be listed)
- Protected Route Shell (dashboard is a protected route)

## Definition of Done
- [ ] AC covered by tests
- [ ] Prompt quality gate passed
- [ ] Code review complete
- [ ] No new lint or type errors
- [ ] Empty state and populated state both verified in browser
