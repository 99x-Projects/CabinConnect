# Domain Glossary

Canonical business terms used in code, prompts, and documentation. Use only the terms defined here — do not substitute synonyms. Updated after every elaboration session that introduces new concepts.

---

## Core Entities

### Cabin
A rentable accommodation unit. The primary resource managed by a Host. Has a name, location, capacity, base rate, description, and a set of amenity tags. A Cabin is owned by exactly one Host.

**Usage notes:** "Property", "listing", "room", and "unit" are not synonyms — always use "Cabin".

**Related:** Host, Booking, Availability, Blackout Date, Cabin Key Info

---

### Booking
A confirmed reservation of a Cabin by a Guest for a specific date range. The Total Price is calculated and frozen at the moment of confirmation — it is never retroactively recalculated, even if rates change.

**Booking Statuses:** `Pending` | `Confirmed` | `Cancelled` | `Completed` | `NoShow`

**Usage notes:** "Reservation" is not a synonym — always use "Booking". A Booking is distinct from a Hold (which is uncommitted).

**Related:** Guest, Cabin, Hold, Total Price, Date Range

---

### Guest
An authenticated user who makes Bookings. Guests log in via Supabase Auth. A Guest cannot manage Cabins — they can only view available Cabins, create Holds, and confirm Bookings.

**Related:** Host, Booking, Hold, User Role

---

### Host
The operator who manages Cabin listings. A Host creates and edits Cabins, sets pricing, manages Blackout Dates, and views Bookings for their Cabins. A Host is identified by the `host_id` stored on each Cabin record.

**Usage notes:** Do not confuse with "admin" or "owner". The platform operator is not a Host — they are a super admin.

**Related:** Cabin, Seasonal Rate, Blackout Date, Cabin Key Info

---

### Hold
A temporary, uncommitted reservation created during the Guest checkout flow. A Hold reserves dates for a Cabin for up to 15 minutes. If not converted to a Booking within 15 minutes, the Hold expires and the dates become available again.

**Usage notes:** A Hold is not a Booking. A Hold is not visible to the Host. A Hold exists only to prevent race conditions during checkout.

**Related:** Booking, Availability, Guest

---

## Pricing

### Base Rate
The default nightly price for a Cabin, set by the Host. Used for any night not covered by a Seasonal Rate.

**Usage notes:** Base Rate is set at Cabin creation and can be updated. It must be a positive decimal value — zero is not valid.

**Related:** Seasonal Rate, Total Price

---

### Seasonal Rate
A nightly price override for a specific date range on a Cabin, set by the Host. Applies instead of the Base Rate for any night within its date range.

**Conflict rule:** If multiple Seasonal Rates overlap, the most specific (narrowest) date range wins. In a tie, the higher rate applies.

**Related:** Base Rate, Total Price, Date Range

---

### Total Price
The sum of nightly rates (Base Rate or applicable Seasonal Rate) for all nights in a Booking, calculated at the moment of Booking confirmation. Stored on the Booking record and never recalculated. Rate changes after confirmation do not affect existing Bookings.

**Related:** Base Rate, Seasonal Rate, Booking

---

## Availability

### Availability
A Cabin is considered available for a date range if:
1. No Confirmed or Pending Booking overlaps the requested dates, AND
2. No Hold overlaps the requested dates, AND
3. No Blackout Date overlaps the requested dates.

All three conditions must be true. Availability is always calculated on the server — the frontend never makes this determination independently.

**Related:** Booking, Hold, Blackout Date, Date Range

---

### Date Range
A period defined by an inclusive check-in date and an exclusive check-out date. Example: check-in Jun 1, check-out Jun 5 = 4 nights (Jun 1, 2, 3, 4).

**Usage notes:** Dates are stored as UTC date-only values (`DateOnly` in C#, `date` in PostgreSQL). There is no time component on check-in or check-out. All date comparisons are day-level.

**Related:** Booking, Hold, Blackout Date, Seasonal Rate

---

### Blackout Date
A date range during which a Cabin is unavailable, defined by the Host. Blackout Dates are not associated with any Guest or Booking — they block the Cabin regardless. Examples: owner stays, maintenance periods.

**Related:** Availability, Cabin, Host

---

## Sensitive Data

### Cabin Key Info
Sensitive operational information about a Cabin, accessible only to the Host. Contains: access codes, emergency contacts, and house rules. Access codes and emergency contacts are masked by default (last 4 characters visible); house rules are always shown in plaintext.

**Reveal:** A Host can request the plaintext values via `?reveal=true`. Every reveal is logged in the Key Info Reveal Log.

**Related:** Key Info Reveal Log, Host

---

### Key Info Reveal Log
An audit record created each time a Host requests plaintext Cabin Key Info. Records: cabin ID, host ID, and timestamp. The plaintext values themselves are never logged.

**Related:** Cabin Key Info

---

## Users & Roles

### User Role
An application-level role record linking a Supabase Auth user to a role (`cabin_owner`, `guest`) and tracking invitation status (`pending` → `active`). Managed by the super admin via the invitation flow.

**Statuses:** `pending` (invitation sent, user not yet signed up) | `active` (user has signed up and is linked)

**Related:** Guest, Host, Invitation

---

### Invitation
The process of adding a new user to the platform. A super admin sends an invitation email via the Supabase Admin API. The invitee receives a link to set their password. Upon sign-up, their User Role status transitions from `pending` to `active`.

**Related:** User Role

---

## Process Terms

### Bolt
A planned batch of Units executed in sequence within a single development sprint or session. A Bolt has a goal, an execution order, and a retrospective.

**Related:** Unit, Backlog, Retro

### Unit
The smallest independently deployable piece of behavior. Each Unit has acceptance criteria, edge cases, and a definition of done. Units are decomposed during Mob Elaboration and tracked in the Backlog.

**Related:** Bolt, Backlog, Mob Elaboration

### Intent
A named feature need. The starting point of the AI-DLC workflow. One Intent may decompose into multiple Bolts and many Units.

**Related:** Unit, Bolt, Mob Elaboration
