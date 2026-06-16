# Edge Cases & Known Failure Modes

Known scenarios where the system can behave incorrectly if not explicitly handled.
Reference this file when writing acceptance criteria and reviewing AI-generated output.

---

## Booking & Availability

**EC-001 — Concurrent booking race condition**
Two guests book the same cabin for the same dates simultaneously. Without a database-level lock or optimistic concurrency check, both bookings can succeed.
_Mitigation:_ Use a database transaction with a unique constraint or advisory lock when creating a booking. The Hold mechanism provides a soft buffer.

**EC-002 — Hold expiry during checkout**
A guest's Hold expires while they are completing payment. If the Hold is released and another guest books the same dates, the first guest's payment may succeed but the booking cannot be fulfilled.
_Mitigation:_ Validate that the Hold is still active at the point of payment confirmation. Return a clear error if it has expired.

**EC-003 — Timezone-naive date comparisons**
Storing or comparing dates without timezone context causes off-by-one errors around midnight. A guest in UTC+10 checking out "tomorrow" may collide with a guest checking in "today" in UTC.
_Mitigation:_ All dates stored as UTC. Check-in/check-out are date-only (no time component). UI displays in local timezone but submits UTC dates.

**EC-004 — Blackout dates not checked at booking creation**
A blackout date added after a booking is created does not invalidate the booking. However, blackout dates added before booking creation must block availability.
_Mitigation:_ Availability query always filters out blackout dates. Existing confirmed bookings are not automatically cancelled when a blackout is added — requires manual Host action.

---

## Pricing

**EC-005 — Overlapping seasonal rates**
If two seasonal rates overlap the same date range, the system must have a deterministic rule for which applies.
_Mitigation:_ Most specific date range wins. If equally specific, the higher rate wins. Document this rule in the UI for Hosts.

**EC-006 — Rate changes after booking confirmation**
A Host changes the Base Rate after a Guest has a Confirmed booking. The booking price must not change retroactively.
_Mitigation:_ Total price is stored on the Booking record at the time of confirmation and is never recalculated from current rates.

---

## Auth & Access

**EC-007 — Guest accessing another Guest's booking**
Without RLS, a Guest could fetch or modify another Guest's booking by guessing the booking ID.
_Mitigation:_ RLS policy on the bookings table restricts reads and writes to the authenticated user's own bookings. Server-side also validates ownership before any mutation.

**EC-008 — Expired JWT on long sessions**
A guest with an open browser tab may submit requests with an expired token.
_Mitigation:_ Frontend uses Supabase Auth's `onAuthStateChange` to refresh tokens proactively. API returns 401 on expired tokens; frontend redirects to login.

---

## Data & Validation

**EC-009 — Check-out before check-in**
A malformed request where check-out date is before or equal to check-in date.
_Mitigation:_ Validated server-side before any database query. Frontend also validates but server validation is the authoritative gate.

**EC-010 — Zero-night booking**
Check-in and check-out on the same date results in a zero-night stay.
_Mitigation:_ Minimum booking duration is 1 night. Enforce in validation with a clear error message.
