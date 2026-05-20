## Unit: Grocery Catalog Browse

**Status:** In Progress
**Intent:** [Grocery Ordering for Hosts](../../inception/intents/2026-05-20-grocery-ordering.md)

### Context

Hosts need to browse available grocery items before placing an order. The catalog
is read-only for Hosts; an admin populates and maintains it.

### Acceptance Criteria

- Given a Host is authenticated, when they request the grocery catalog, then a list of available items is returned with name, description, unit price, and category
- Given a Host filters by category, when the request is submitted, then only items in that category are returned
- Given an item is marked unavailable by admin, when the Host views the catalog, then that item does not appear in the results
- Given an unauthenticated user, when they request the catalog, then a 401 is returned

### Scope

**In scope:**
- `GET /groceries` endpoint returning paginated catalog items
- Filter by category query param
- Item fields: id, name, description, unitPrice, category, unit (e.g. kg, each)
- Only `available = true` items returned to Hosts

**Out of scope:**
- Admin catalog management (add/edit/remove items)
- Stock level tracking
- Item images
- Search by keyword

### Dependencies

- Admin has pre-populated `grocery_items` table in Supabase
- Host authentication via Supabase Auth JWT

### Definition of Done

- [ ] AC covered by tests
- [ ] Prompt quality gate passed (see rules/prompt-quality-gate.md)
- [ ] Code review complete
- [ ] No new lint or type errors
- [ ] RLS policy on `grocery_items` table: Hosts can SELECT where available = true
- [ ] Feature toggled off in production until acceptance sign-off
