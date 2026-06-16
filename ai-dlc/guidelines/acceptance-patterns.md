# Acceptance Patterns

What good acceptance criteria look like for CabinConnect. Use these patterns when writing ACs during Mob Elaboration.

---

## The Given/When/Then Format

Every AC must follow this structure:
- **Given** — the starting state of the system and the actor
- **When** — the action taken
- **Then** — the observable, verifiable outcome

```
Given a Guest is authenticated and cabin #42 is available for 2025-07-01 to 2025-07-05,
when the Guest submits a booking request for those dates,
then a Booking with status Pending is created and the Guest receives a confirmation reference.
```

---

## Rules for Writing Good ACs

### One behaviour per criterion
Bad: "The user can search, filter, and book a cabin."
Good: Three separate ACs — one for search, one for filter, one for booking.

### Observable outcomes only
Bad: "The system calls the payment service."
Good: "Then the booking status changes to Confirmed and the guest receives a confirmation email."

### No implementation details
Bad: "Then the `bookings` table is updated in PostgreSQL."
Good: "Then the booking is retrievable via GET /bookings/{id} with status Confirmed."

### State the actor explicitly
Bad: "When a booking is cancelled..."
Good: "Given a Guest with a Confirmed booking, when the Guest cancels before 48 hours prior to check-in..."

### Cover the unhappy path
Every feature needs at least one AC for a failure scenario:
```
Given cabin #42 is already booked for 2025-07-01 to 2025-07-05,
when a second Guest submits a booking request for overlapping dates,
then a 409 Conflict response is returned with a message indicating unavailability.
```

---

## Patterns by Feature Type

### Search / Query
- AC for empty results (zero matches)
- AC for pagination boundaries (first page, last page, beyond last page)
- AC for invalid filter values

### Create / Submit
- AC for successful creation (happy path)
- AC for validation failure (missing required field)
- AC for conflict / duplicate
- AC for unauthorized access

### Update / Edit
- AC for successful update
- AC for updating a field that cannot change (e.g., booking price after confirmation)
- AC for concurrent edit conflict
- AC for updating a record you do not own

### Delete / Cancel
- AC for successful cancellation
- AC for cancellation outside the allowed window
- AC for cancelling a record in a terminal state (e.g., Completed booking)

---

## AC Anti-Patterns to Reject

| Anti-Pattern | Why It Fails |
|---|---|
| "The system should handle errors gracefully" | Not testable — what error, what outcome? |
| "Performance should be acceptable" | No threshold, not verifiable |
| "The UI should look good" | Subjective, not behavioural |
| "Admins can do everything a Guest can" | Too broad — enumerate specific behaviours |
| "It should work like the old system" | The old system may have bugs — specify the desired behaviour |
