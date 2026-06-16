# Domain Glossary

Canonical definitions for business terms used in CabinConnect. Use these exact terms in code, prompts, and documentation to avoid ambiguity.

---

## Core Entities

**Cabin**
A rentable accommodation unit. Has a name, description, capacity (max guests), location, and a set of amenities. A cabin can be active or inactive.

**Booking**
A confirmed reservation of a Cabin by a Guest for a specific date range. A booking always has a status (see Booking Status).

**Booking Status**
The lifecycle state of a Booking:
- `Pending` — created but not yet confirmed (e.g., awaiting payment)
- `Confirmed` — payment received; dates are held
- `Cancelled` — cancelled by Guest or Host before check-in
- `Completed` — check-out date has passed and the stay occurred
- `NoShow` — check-in date passed without the Guest arriving

**Guest**
A user who makes bookings. Authenticated via Supabase Auth.

**Host**
The operator managing cabins. May have admin-level access to manage listings, view all bookings, and configure pricing.

**Availability**
The state of a Cabin on a given date range. A cabin is available if no Confirmed or Pending booking overlaps the requested dates.

**Date Range**
Always inclusive of check-in date, exclusive of check-out date. Example: check-in 2025-06-01, check-out 2025-06-05 = 4 nights.

---

## Pricing Terms

**Base Rate**
The nightly price for a Cabin, defined by the Host.

**Seasonal Rate**
An override to the Base Rate for a specific date range (e.g., peak summer pricing).

**Total Price**
The sum of nightly rates across the booking date range. Does not include taxes unless explicitly stated.

---

## Operational Terms

**Hold**
A temporary, uncommitted reservation placed during the checkout flow to prevent double-booking. Expires after a configurable timeout (default: 15 minutes).

**Blackout Date**
A date range during which a Cabin is not available for booking regardless of confirmed reservations (e.g., maintenance, owner use).

---

## Abbreviations
| Abbreviation | Meaning |
|---|---|
| AC | Acceptance Criteria |
| RLS | Row-Level Security (Supabase/PostgreSQL) |
| DLC | AI-Driven Development Lifecycle |
