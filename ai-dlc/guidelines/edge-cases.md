# Known Edge Cases

Check this file before generating code for any unit. New edge cases are added after every retro and incident.

> **Archaeology verification rule:** Any finding that claims a specific .NET, React, or third-party API behaves unexpectedly must be verified against official documentation before being recorded here. Do not add an edge case based solely on an AI-generated archaeology summary — cite the spec or test that confirms it. See EC-011 for an example of a false positive that slipped through without this check.

---

## EC-001 — Concurrent Booking on the Same Cabin / Dates

**Scenario:** Two Guests attempt to book the same Cabin for overlapping dates at the same time.

**Required behavior:** The first Booking to reach the database wins. The Hold provides a 15-minute soft buffer — Guests must create a Hold before confirming a Booking. The availability check and Hold creation must be atomic (database-level lock or unique constraint on active holds per cabin/date range). If a Hold expires during payment, the Booking must be rejected with a clear error message.

**Where to check:** Any code that creates Holds or confirms Bookings.

---

## EC-002 — Hold Expires During Payment

**Scenario:** A Guest creates a Hold, begins payment, but the 15-minute window expires before payment confirmation arrives.

**Required behavior:** At payment confirmation, validate that the Hold is still active (`expires_at > now()`). If not, return a clear error (e.g., `HoldExpiredException`) and do not create the Booking. The Guest must restart the checkout flow.

**Where to check:** Booking confirmation service method.

---

## EC-003 — Timezone-Naive Date Comparison

**Scenario:** Dates entered by users in different time zones are compared incorrectly, causing off-by-one errors in availability.

**Required behavior:** All dates are stored as UTC date-only values (`DateOnly` in C#, `date` type in PostgreSQL). No time component is stored. The UI converts local dates to UTC date-only before sending to the API. The API never does timezone conversion — it trusts the date-only value it receives.

**Where to check:** Any date comparison logic, date input parsing, and availability queries.

---

## EC-004 — Blackout Dates Not Checked at Booking

**Scenario:** A Cabin has Blackout Dates defined by the Host, but the availability query fails to filter them out.

**Required behavior:** The availability query must always include a Blackout Date filter. A Cabin is unavailable if any Blackout Date overlaps the requested check-in/check-out range. Blackout Dates take precedence over all other availability signals.

**Where to check:** Every availability query and Hold creation check.

---

## EC-005 — Overlapping Seasonal Rates

**Scenario:** Two Seasonal Rates defined by the Host cover overlapping date ranges for the same Cabin.

**Required behavior:** The most specific (narrowest) date range wins. If two Seasonal Rates have equal specificity (same start and end date), the higher rate applies. This logic must be deterministic — no random tiebreaker.

**Where to check:** Any code that calculates nightly prices for a date range.

---

## EC-006 — Rate Change After Booking Confirmation

**Scenario:** A Host updates the Base Rate or Seasonal Rate after a Booking is confirmed.

**Required behavior:** The Total Price stored on the Booking record is frozen at confirmation and is never recalculated. Rate changes affect only future Bookings. Display the stored Total Price, never recalculate it from current rates.

**Where to check:** Booking display, invoice generation, any code that reads pricing from a confirmed Booking.

---

## EC-007 — Guest Accessing Another Guest's Booking

**Scenario:** A Guest attempts to read or modify a Booking that belongs to a different Guest.

**Required behavior:** RLS restricts reads/writes to the Booking owner (`guest_id = auth.uid()`). The .NET API also validates ownership at the controller level: `booking.GuestId == guestId` before any operation. Both layers must enforce this independently.

**Where to check:** Any Booking read/write endpoint; RLS policy on the `bookings` table.

---

## EC-008 — Expired JWT on Long Session

**Scenario:** A Guest's JWT expires while they are using the application (e.g., a long checkout session).

**Required behavior:** The .NET API returns 401 when the JWT is expired. The frontend's `apiFetch()` wrapper intercepts 401, calls `supabase.auth.signOut()` (awaited), then redirects to `/login`. The frontend should also use Supabase's `onAuthStateChange` to proactively detect token expiration before making requests.

**Where to check:** `apiFetch()` in `services/api.ts`; auth context `onAuthStateChange` handler.

---

## EC-009 — Check-Out Before Check-In

**Scenario:** A user submits a Booking or Hold with a check-out date on or before the check-in date.

**Required behavior:** The server validates `check_out > check_in` before any database query. A 400 error is returned with a descriptive message. The frontend validates this too (Zod schema), but the server is authoritative.

**Where to check:** Booking creation, Hold creation, any endpoint accepting date ranges. Database has a check constraint (`check_out > check_in`) as a final backstop.

---

## EC-010 — Zero-Night Booking (Same-Day Check-In/Check-Out)

**Scenario:** A user submits a Booking with check-in and check-out on the same date (0 nights).

**Required behavior:** Minimum 1 night enforced. The server validates `check_out > check_in` (same day fails this check). The frontend validates with a minimum nights schema rule. A 400 is returned with a descriptive error.

**Where to check:** Same as EC-009.

---

## EC-011 — Booking.Nights Calculation Across Year Boundary — Verified Correct

**Scenario:** A Booking spans December 31 → January 2 (or any year boundary).

**Verified behavior:** `Booking.Nights` uses `CheckOut.DayNumber - CheckIn.DayNumber`. `DateOnly.DayNumber` in .NET is an **absolute epoch-based day count** (days since January 1, year 1) — it is NOT `DayOfYear` (which resets at January 1). The subtraction is correct and safe across year boundaries. Regression tests in `CabinConnect.Tests/P0DefectTests.cs` (AC1, AC2) confirm this.

**Do not change this implementation.** This calculation was initially recorded as a defect during archaeology but was verified correct against .NET documentation. This entry is retained as a warning against re-opening it.

**Where to check:** `Booking.Nights` in `CabinConnect.Domain/Entities/Booking.cs`.

---

## EC-012 — Cabin Created with Zero Base Rate

**Scenario:** A Cabin is created without a Base Rate or with a Base Rate of 0.

**Required behavior:** Base Rate is required on cabin creation. The `CreateCabinRequest` must include a `BaseRate` field with a minimum value validation (e.g., `> 0`). The service must not allow a Cabin to be created with `BaseRate = 0`.

**Where to check:** `CreateCabinRequest`, `CabinService.CreateAsync()`.

---

## EC-013 — Concurrent Update Version Conflict

**Scenario:** Two users (or two browser tabs) update the same Cabin simultaneously, causing an EF Core concurrency exception.

**Required behavior:** The repository catches `DbUpdateConcurrencyException` and rethrows as `CabinVersionConflictException` carrying the current version. The controller maps this to 409 Conflict with the `currentVersion` in the response body. The frontend displays a conflict message and prompts the user to reload.

**Where to check:** `CabinRepository.UpdateAsync()`, `CabinsController` conflict handling.

---

## EC-014 — Amenity Tags at Cabin Creation

**Scenario:** A host creates a Cabin without selecting any amenity tags.

**Required behavior:** At least 1 amenity tag is required at creation. This is enforced in both the frontend Zod schema (`z.array(z.string()).min(1)`) and the backend request validation. This matches the behavior on the cabin edit page.

**Where to check:** `CreateCabinModal` Zod schema, `CreateCabinRequest` validation.

---

## EC-015 — Key Info Reveal Race Condition

**Scenario:** A Host edits and saves Cabin Key Info while another tab or session has already revealed the plaintext values.

**Required behavior:** The `KeyInfoPanel` must include a `version` field when submitting updates, matching the version-based optimistic locking pattern used for Cabin updates. A 409 is returned if the version has changed. The host must reload before saving.

**Where to check:** `KeyInfoPanel` component, `UpsertKeyInfoRequest`, `CabinKeyInfoService.UpsertAsync()`.
