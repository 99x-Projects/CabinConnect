## Unit: Order Fulfillment

**Status:** Ready
**Intent:** [Grocery Ordering for Hosts](../../inception/intents/2026-05-20-grocery-ordering.md)

### Context

A Volunteer marks an assigned order as picked up from the store and then as delivered
to the cabin. For Pickup orders, the Host marks the order as collected.

### Acceptance Criteria

- Given an `Assigned` VolunteerDelivery order, when the assigned Volunteer marks it `PickedUp`, then the order status changes to `PickedUp` and a timestamp is recorded
- Given a `PickedUp` order, when the assigned Volunteer marks it `Delivered`, then the order status changes to `Delivered` and a delivery timestamp is recorded
- Given a `Placed` Pickup order, when the Host marks it `PickedUp`, then the order status changes to `PickedUp`
- Given a Volunteer attempts to update an order not assigned to them, when the request is processed, then a 403 is returned
- Given an order in a terminal status (`Delivered`, `Cancelled`), when any status update is attempted, then a 409 is returned
- Given an unauthenticated request, when the endpoint is called, then a 401 is returned

### Scope

**In scope:**
- `PATCH /grocery-orders/{orderId}/status` endpoint
- Valid transitions: `Assigned` → `PickedUp` → `Delivered` (volunteer delivery)
- Valid transitions: `Placed` → `PickedUp` (self-pickup by Host)
- Server-side enforcement of allowed transitions
- Timestamps recorded for each transition

**Out of scope:**
- Partial fulfillment (some items delivered, others not)
- Item-level out-of-stock reporting (EC-012 deferred to phase 2)
- Proof of delivery (photo upload)
- GPS confirmation of delivery location

### Dependencies

- Unit: Order Assignment to Volunteer
- Unit: Grocery Order Placement

### Definition of Done

- [ ] AC covered by tests
- [ ] Prompt quality gate passed
- [ ] Code review complete
- [ ] No new lint or type errors
- [ ] RLS policy: Volunteer can update only their assigned orders; Host can update own Pickup orders
- [ ] EC-012 (item out of stock) noted as known gap; deferred to phase 2
- [ ] Feature toggled off in production until acceptance sign-off
