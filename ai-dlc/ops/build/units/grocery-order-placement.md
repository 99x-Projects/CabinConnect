## Unit: Grocery Order Placement

**Status:** Ready
**Intent:** [Grocery Ordering for Hosts](../../inception/intents/2026-05-20-grocery-ordering.md)

### Context

A Host selects items from the catalog, specifies quantities, and submits a grocery
order with a chosen delivery method (Pickup or VolunteerDelivery).

### Acceptance Criteria

- Given a Host submits an order with at least one item and valid quantities, when the request is processed, then a GroceryOrder is created with status `Placed` and the Host's ID recorded as owner
- Given the Host selects `VolunteerDelivery` and the associated Cabin has no address, when the order is submitted, then a 400 error is returned with a clear message
- Given the Host selects `Pickup`, when the order is submitted, then no cabin address is required and the order is accepted
- Given a Host submits an order with zero or negative quantity for any item, when the request is processed, then a 400 validation error is returned and no order is created
- Given an unauthenticated request, when the endpoint is called, then a 401 is returned
- Given a Host submits an order referencing an unavailable or non-existent item, when the request is processed, then a 400 error is returned

### Scope

**In scope:**
- `POST /grocery-orders` endpoint
- Request body: `{ cabinId, deliveryMethod, items: [{ itemId, quantity }] }`
- Delivery methods: `Pickup` | `VolunteerDelivery`
- Order stored with status `Placed`, timestamp, Host ID, delivery method, cabin ID
- Server-side validation of cabin address for VolunteerDelivery (EC-014)
- Server-side validation of item availability

**Out of scope:**
- Payment processing
- Order total calculation (no in-platform payment in phase 1)
- Scheduling a delivery date/time
- Guest-initiated orders

### Dependencies

- Unit: Grocery Catalog Browse (item IDs must exist)
- Cabin entity with address field must exist
- `grocery_orders` and `grocery_order_items` tables in Supabase

### Definition of Done

- [ ] AC covered by tests
- [ ] Prompt quality gate passed
- [ ] Code review complete
- [ ] No new lint or type errors
- [ ] RLS policy: Host can INSERT own orders; Host can SELECT own orders only (EC-007 equivalent)
- [ ] EC-014 (missing cabin address) handled
- [ ] Feature toggled off in production until acceptance sign-off
