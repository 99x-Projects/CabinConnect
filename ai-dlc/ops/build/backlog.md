# Backlog

All units tracked here. Update status when work begins or completes.

**Statuses:** `Draft` | `Ready` | `In Progress` | `Done` | `Deferred`

---

## Bolt 001 — Grocery Ordering MVP

| Unit | File | Status | Notes |
|---|---|---|---|
| Grocery Catalog Browse | [units/grocery-catalog-browse.md](units/grocery-catalog-browse.md) | In Progress | No dependencies |
| Grocery Order Placement | [units/grocery-order-placement.md](units/grocery-order-placement.md) | Ready | Depends on Catalog Browse |
| Volunteer Registration | [units/volunteer-registration.md](units/volunteer-registration.md) | Ready | No dependencies |
| Order Assignment to Volunteer | [units/order-assignment.md](units/order-assignment.md) | Ready | Depends on Order Placement + Volunteer Registration |
| Order Fulfillment | [units/order-fulfillment.md](units/order-fulfillment.md) | Ready | Depends on Order Assignment |
| Order Status Tracking | [units/order-status-tracking.md](units/order-status-tracking.md) | Ready | Depends on Order Placement + Fulfillment |
