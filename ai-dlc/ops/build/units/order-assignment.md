## Unit: Order Assignment to Volunteer

**Status:** Ready
**Intent:** [Grocery Ordering for Hosts](../../inception/intents/2026-05-20-grocery-ordering.md)

### Context

An admin assigns a `Placed` GroceryOrder with delivery method `VolunteerDelivery` to
a registered Volunteer. The order status advances to `Assigned` and the Volunteer
is notified.

### Acceptance Criteria

- Given a `Placed` order with `VolunteerDelivery` method, when an admin assigns it to an `Active` volunteer, then the order status changes to `Assigned` and the volunteerId is recorded
- Given an order that is not in `Placed` status, when an admin attempts assignment, then a 409 is returned and the order is not modified
- Given an admin assigns an order to a volunteer who is `Inactive`, when the request is processed, then a 400 is returned
- Given a `Placed` order with `Pickup` delivery method, when an admin attempts volunteer assignment, then a 400 is returned (pickup orders are not assigned)
- Given a successful assignment, when the order is assigned, then the assigned Volunteer receives a notification (email or in-app)
- Given an unauthenticated or non-admin request, when the endpoint is called, then a 403 is returned

### Scope

**In scope:**
- `POST /grocery-orders/{orderId}/assign` endpoint (admin only)
- Request body: `{ volunteerId }`
- Order status transition: `Placed` → `Assigned`
- Notification to volunteer on assignment (email stub acceptable for phase 1)
- Concurrency: if two admins assign simultaneously, only one succeeds (optimistic lock or DB constraint) (EC-011 related)

**Out of scope:**
- Automatic/algorithmic volunteer matching
- Volunteer acceptance/rejection flow (admin assigns directly in phase 1)
- SMS notifications
- Re-assignment flow (treated as a separate action)

### Dependencies

- Unit: Grocery Order Placement (`grocery_orders` table and `Placed` status)
- Unit: Volunteer Registration (`volunteer_profiles` table)

### Definition of Done

- [ ] AC covered by tests
- [ ] Prompt quality gate passed
- [ ] Code review complete
- [ ] No new lint or type errors
- [ ] RLS policy: only admin role can call assignment endpoint
- [ ] EC-011 (volunteer dropout) noted as follow-up; timeout/reassignment deferred to phase 2
- [ ] Feature toggled off in production until acceptance sign-off
