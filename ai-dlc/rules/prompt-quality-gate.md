# Prompt Quality Gate

Every code generation request must contain all four components before code is written. If any are missing, stop and ask — one question at a time, starting with the most critical gap.

---

## The Four Components

### 1. Context
Who is asking and what part of the system this touches.

**Sufficient:**
> "I'm adding a blackout date range for a cabin. This touches the .NET API (BlackoutDatesController), the Domain (BlackoutDate entity), and the Infrastructure (BlackoutDateRepository)."

**Insufficient:**
> "I need to block out some dates."

---

### 2. Constraints
What must not happen; which rules apply.

**Sufficient:**
> "Must not allow overlapping blackout ranges for the same cabin. Must verify the caller is the cabin's host before writing. Must not expose error detail to the client."

**Insufficient:**
> "The usual rules."

---

### 3. Acceptance Criteria
A testable pass/fail condition. Must be in Given/When/Then form with at least one unhappy path.

**Sufficient:**
```
AC1: Given a host, when they create a blackout date range with valid start/end dates for their own cabin, then the range is persisted and a 201 is returned.
AC2: Given a host, when they attempt to create a blackout range for a cabin they do not own, then a 403 is returned and nothing is persisted.
AC3: Given a host, when they submit a range where end_date < start_date, then a 400 is returned with a descriptive error.
```

**Insufficient:**
> "It should work correctly and reject bad input."

---

### 4. Output Format
What the response should look like — code only, code + tests, diff, explanation, etc.

**Sufficient:**
> "C# controller method, service method, repository method, and one xUnit test per AC. No migration files."

**Insufficient:**
> "Just the code."

---

## Missing Component Protocol

Ask for missing components one at a time in this order:

1. **Acceptance Criteria** — most critical; without it no output can be verified
2. **Context** — needed to scope the change correctly
3. **Constraints** — needed to avoid prohibited patterns
4. **Output Format** — needed to know what to produce

**Do not ask for multiple components in one message.** Ask for the most critical missing one, wait for the answer, then proceed or ask for the next.

---

## Complete Request Example

```
Context: Host cabin management — adding blackout date support.
Touches: CabinsController (new endpoint), BlackoutDate entity (Domain), BlackoutDateRepository (Infrastructure), BlackoutDateConfiguration (Infrastructure).

Constraints: Must verify host owns the cabin at the controller level. Must not allow end_date < start_date. Must not expose stack traces. Parameterized queries via EF Core only.

Acceptance Criteria:
AC1: Given an authenticated host, when POST /api/cabins/{id}/blackout-dates is called with valid start/end dates for a cabin they own, then the blackout date is persisted and a 201 with the created resource is returned.
AC2: Given an authenticated host, when the cabin ID belongs to a different host, then 403 is returned and nothing is written.
AC3: Given any caller, when end_date is before or equal to start_date, then 400 is returned with a descriptive error message.
AC4: Given an authenticated host, when the cabin does not exist, then 404 is returned.

Output Format: C# — controller endpoint, service method, repository method, EF Core configuration. xUnit tests for all 4 ACs using NSubstitute and FluentAssertions. No migration files — those are a forbidden zone.
```

---

## Gate Output Header

When all four components are present, open the code response with:

```
**Context:** <one line>
**Constraints:** <one line>
**Acceptance Criteria:** <one line summary — e.g., "4 ACs, including 2 failure paths">
**Output Format:** <one line>
```
