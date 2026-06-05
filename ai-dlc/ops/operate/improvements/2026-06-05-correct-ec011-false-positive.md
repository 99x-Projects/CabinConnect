# Improvement: Correct EC-011 False Positive

**Status:** Applied
**Triggered by:** [ops/operate/retros/2026-06-05-p0-defects.md](../retros/2026-06-05-p0-defects.md)
**Applied date:** 2026-06-05
**Knowledge promotion:** Pending

---

## Target File

`ai-dlc/guidelines/edge-cases.md`

---

## Current Text

```
## EC-011 — Booking.Nights Calculation Across Year Boundary

**Scenario:** A Booking spans December 31 → January 2 (or any year boundary).

**Required behavior:** Night count must be calculated as `(checkOut - checkIn).Days`
(absolute day difference), not as `checkOut.DayNumber - checkIn.DayNumber`
(day-of-year, which resets at January 1 and gives wrong results).

**Where to check:** `Booking.Nights` computed property in
`CabinConnect.Domain/Entities/Booking.cs`.
```

---

## Proposed Replacement

```
## EC-011 — Booking.Nights Calculation Across Year Boundary — Verified Correct

**Scenario:** A Booking spans December 31 → January 2 (or any year boundary).

**Verified behavior:** `Booking.Nights` uses `CheckOut.DayNumber - CheckIn.DayNumber`.
`DateOnly.DayNumber` in .NET is an absolute epoch-based day count (days since
January 1, year 1) — it is NOT `DayOfYear` (which resets at January 1).
The subtraction is correct and safe across year boundaries.

Regression tests in `CabinConnect.Tests/P0DefectTests.cs` (AC1, AC2) confirm this.

**Do not change this implementation.** This calculation was initially recorded as a
defect during archaeology but was verified correct against .NET documentation.

**Where to check:** `Booking.Nights` in `CabinConnect.Domain/Entities/Booking.cs`.
```

Also adds an archaeology verification note at the top of the file.

---

## Reason

The archaeology agent confused `DateOnly.DayNumber` (absolute epoch count since Jan 1, year 1) with `DateOnly.DayOfYear` (day within the current year, 1–366). The false finding was recorded in edge-cases.md and then carried forward unchallenged into the AC proposals. The implementation is correct. Leaving the false entry risks a future engineer "fixing" a working implementation and introducing a real bug.

---

## Validation

- [ ] EC-011 no longer claims the implementation is wrong
- [ ] The corrected entry cites the regression tests that verify the behavior
- [ ] Archaeology note at top of edge-cases.md is present and links to this finding
- [ ] No recurrence of a false positive being added without citing a spec or test after 3 bolts
