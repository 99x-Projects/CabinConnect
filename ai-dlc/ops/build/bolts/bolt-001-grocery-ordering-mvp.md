# Bolt 001 — Grocery Ordering MVP

**Status:** Planned
**Date:** 2026-05-20
**Intent:** [Grocery Ordering for Hosts](../../../inception/intents/2026-05-20-grocery-ordering.md)
**Owner:** Isanka Patabandige

---

## Goal

Deliver the end-to-end grocery ordering capability for Hosts: catalog browsing, order
placement (pickup or volunteer delivery), volunteer registration, admin assignment,
fulfillment, and order status tracking.

## Units in This Bolt

| # | Unit | File | Priority | Status |
|---|---|---|---|---|
| 1 | Grocery Catalog Browse | [grocery-catalog-browse.md](../units/grocery-catalog-browse.md) | High | Ready |
| 2 | Grocery Order Placement | [grocery-order-placement.md](../units/grocery-order-placement.md) | High | Ready |
| 3 | Volunteer Registration | [volunteer-registration.md](../units/volunteer-registration.md) | High | Ready |
| 4 | Order Assignment to Volunteer | [order-assignment.md](../units/order-assignment.md) | High | Ready |
| 5 | Order Fulfillment | [order-fulfillment.md](../units/order-fulfillment.md) | High | Ready |
| 6 | Order Status Tracking | [order-status-tracking.md](../units/order-status-tracking.md) | Medium | Ready |

## Build Order

Units must be built in dependency order:

```
Unit 1 (Catalog Browse)
  └─ Unit 2 (Order Placement)
        └─ Unit 4 (Assignment)  ←── Unit 3 (Volunteer Registration)
              └─ Unit 5 (Fulfillment)
                    └─ Unit 6 (Status Tracking)  ←── Unit 2 also feeds this
```

Units 1 and 3 have no dependencies and can be built in parallel.

## New Domain Entities

These must be added to the domain glossary and Supabase schema before coding begins:

| Entity | Description |
|---|---|
| `GroceryItem` | A catalog item available for ordering (name, price, category, unit) |
| `GroceryOrder` | An order placed by a Host; contains items, delivery method, status |
| `GroceryOrderItem` | Line item within a GroceryOrder (itemId, quantity) |
| `GroceryOrderStatus` | `Placed` / `Assigned` / `PickedUp` / `Delivered` / `Cancelled` |
| `DeliveryMethod` | `Pickup` / `VolunteerDelivery` |
| `Volunteer` | A registered community member who fulfills VolunteerDelivery orders |
| `VolunteerStatus` | `Active` / `Inactive` |

## New Supabase Tables Required

| Table | RLS Notes |
|---|---|
| `grocery_items` | SELECT for authenticated users; INSERT/UPDATE/DELETE for admin only |
| `grocery_orders` | Host can SELECT/INSERT own orders; Volunteer can SELECT assigned orders; admin can SELECT all |
| `grocery_order_items` | Inherits access from parent `grocery_orders` |
| `volunteer_profiles` | User can INSERT/SELECT own; admin can SELECT all |

## Edge Cases In Scope

| ID | Scenario | Handled In |
|---|---|---|
| EC-011 | Volunteer goes silent before fulfillment | Noted in Unit 4; reassignment deferred to phase 2 |
| EC-012 | Item out of stock at fulfillment | Noted in Unit 5; deferred to phase 2 |
| EC-013 | No volunteers available | Noted in Unit 4; admin must handle manually |
| EC-014 | Cabin has no address for volunteer delivery | Unit 2 — validated at order placement |
| EC-015 | Order cancelled after volunteer assigned | Cancellation endpoint (separate unit, phase 2) |

## Known Gaps / Phase 2 Items

- Order cancellation endpoint
- Volunteer timeout and auto-reassignment (EC-011)
- Item out-of-stock handling (EC-012)
- No-volunteer-available fallback (EC-013)
- Push/SMS notifications for status changes
- Delivery date/time scheduling
- Guest-initiated orders
- In-platform payment for groceries

## Acceptance Sign-Off Criteria

The bolt is complete when:
- [ ] All 6 units pass their Definition of Done checklists
- [ ] A Host can place a Pickup order end-to-end in a staging environment
- [ ] A Host can place a VolunteerDelivery order, have it assigned to a volunteer, and see it marked Delivered
- [ ] Attempting to access another Host's orders returns 404
- [ ] No lint errors, type errors, or failing tests
