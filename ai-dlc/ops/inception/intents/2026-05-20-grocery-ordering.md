# Intent: Grocery Ordering for Hosts

**Status:** Ready
**Date:** 2026-05-20
**Owner:** Isanka Patabandige

---

## What

Hosts can browse a grocery catalog, place orders for items, and choose between
self-pickup or volunteer doorstep delivery to their cabin.

## Why

Hosts need a convenient way to stock or restock their cabins without leaving the
platform. Offering a volunteer delivery option serves remote cabin locations where
commercial delivery is unavailable or impractical.

## Success Looks Like

- A Host can browse the grocery catalog, add items to an order, and submit it
- A Host can track the status of their order from placement to fulfillment
- A volunteer can register, receive an assigned order, and mark it as delivered
- A Host who chooses self-pickup can mark their order collected

## Assumptions

- A grocery catalog is pre-populated by an admin (not self-managed by a supplier)
- Volunteers are trusted community members; vetting is out of scope for this intent
- Payment for groceries is handled outside the platform (e.g. cash on pickup/delivery) — no in-platform payment integration in this phase
- Each cabin has an address recorded that can be used for delivery routing
- One volunteer is assigned per order (not split fulfilment)

## Open Questions

<!-- Resolved 2026-05-20 -->
- **Who manages the grocery catalog?** → Admin only (not Host). Documented in Assumptions.
- **Maximum order size/weight for volunteers?** → No limit enforced in phase 1; deferred to phase 2.
- **No volunteers available?** → Admin handles manually in phase 1; no automated fallback (EC-013).
- **Scheduled delivery windows?** → Out of scope for phase 1.
- **Tied to a specific Booking?** → Standalone in phase 1; optional Booking link deferred to phase 2.
- **Timeout for unassigned orders?** → No auto-cancel in phase 1; deferred to phase 2.

## Out of Scope

- In-platform payment or invoicing for groceries
- Volunteer vetting, background checks, or ratings
- Real-time delivery tracking (GPS)
- Integration with external grocery suppliers or inventory management
- Guest-initiated grocery orders (Guests do not order directly in this phase)
- Grocery ordering tied to specific Booking records

---

## Elaboration Sessions

| Session | Date | Units Extracted |
|---|---|---|
| [Session 1](../elaborations/grocery-ordering/2026-05-20-session-1.md) | 2026-05-20 | 6 |

## Extracted Units

| Unit | File | Status |
|---|---|---|
| Grocery Catalog Browse | [grocery-catalog-browse.md](../../build/units/grocery-catalog-browse.md) | Draft |
| Grocery Order Placement | [grocery-order-placement.md](../../build/units/grocery-order-placement.md) | Draft |
| Volunteer Registration | [volunteer-registration.md](../../build/units/volunteer-registration.md) | Draft |
| Order Assignment to Volunteer | [order-assignment.md](../../build/units/order-assignment.md) | Draft |
| Order Fulfillment | [order-fulfillment.md](../../build/units/order-fulfillment.md) | Draft |
| Order Status Tracking | [order-status-tracking.md](../../build/units/order-status-tracking.md) | Draft |
