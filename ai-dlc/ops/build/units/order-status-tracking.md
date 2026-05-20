## Unit: Order Status Tracking

**Status:** Ready
**Intent:** [Grocery Ordering for Hosts](../../inception/intents/2026-05-20-grocery-ordering.md)

### Context

Hosts need to view the current status and history of their grocery orders. This gives
visibility after order placement without requiring direct communication with the volunteer.

### Acceptance Criteria

- Given an authenticated Host, when they request their orders, then all GroceryOrders owned by that Host are returned with current status and order summary
- Given a Host requests a specific order by ID, when the order belongs to that Host, then full order details are returned including items, quantities, delivery method, and status history
- Given a Host requests an order that belongs to a different Host, when the request is processed, then a 404 is returned (ownership not revealed)
- Given a Host filters orders by status, when the request is submitted, then only orders matching that status are returned
- Given an unauthenticated request, when the endpoint is called, then a 401 is returned

### Scope

**In scope:**
- `GET /grocery-orders` endpoint with optional `?status=` filter (Host sees own orders only)
- `GET /grocery-orders/{orderId}` endpoint for order detail
- Response includes: orderId, cabinId, deliveryMethod, status, items, createdAt, updatedAt
- Status history log (list of `{ status, timestamp }` transitions)

**Out of scope:**
- Push notifications for status changes (phase 2)
- Admin view of all orders (separate admin endpoint)
- Order amendment after placement
- Exporting order history

### Dependencies

- Unit: Grocery Order Placement (orders must exist)
- Unit: Order Fulfillment (status transitions must be recorded)

### Definition of Done

- [ ] AC covered by tests
- [ ] Prompt quality gate passed
- [ ] Code review complete
- [ ] No new lint or type errors
- [ ] RLS policy: Host can SELECT only their own orders (enforces EC-007 equivalent)
- [ ] 404 returned for cross-Host access (not 403, to avoid confirming existence)
- [ ] Feature toggled off in production until acceptance sign-off
