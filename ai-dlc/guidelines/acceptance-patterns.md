# Acceptance Criteria Patterns

Rules and anti-patterns for writing testable acceptance criteria. Apply these during every mob elaboration session.

---

## Required Structure: Given / When / Then

Every AC must follow this structure:

```
Given [the starting state / actor context],
When [the action taken],
Then [the observable outcome].
```

All three parts are required. A missing "Given" makes the test unrunnable. A missing "Then" makes the AC unverifiable.

---

## Rules

### One behavior per criterion
Each AC covers exactly one behavioral outcome. Do not combine multiple outcomes with "and" in the Then clause unless they are inseparable.

**Wrong:**
```
Given a host, when they create a cabin with valid data, then a 201 is returned and the cabin is stored in the database and the host receives a confirmation email.
```

**Correct:**
```
AC1: Given a host, when they create a cabin with valid data, then a 201 is returned with the created cabin DTO.
AC2: Given a cabin, when it is confirmed as created, then it is retrievable via GET /api/cabins/{id}.
```

---

### Name the actor in every Given
Always say who is performing the action. The actor determines which authorization rules apply.

**Wrong:**
```
Given valid cabin data is submitted, when the endpoint is called...
```

**Correct:**
```
Given an authenticated host, when POST /api/cabins is called with valid data...
```

---

### Cover at least one unhappy path per unit
Every unit must have at least one AC that describes what happens when the action fails, is unauthorized, or receives invalid input.

**Required unhappy path types for this project:**
- **Authorization failure** — caller does not own the resource → 403
- **Not found** — resource does not exist → 404
- **Validation failure** — input is invalid (missing field, wrong type, out of range) → 400
- **Conflict** — duplicate name, version mismatch, overlapping dates → 409

---

### No implementation details in ACs
ACs describe observable outcomes — what the caller sees, what the database contains, what the user experiences. They do not describe how the code achieves the outcome.

**Wrong:**
```
Given a cabin, when UpdateAsync is called, then the CabinRepository.UpdateAsync method is invoked with the correct version number.
```

**Correct:**
```
Given an authenticated host, when they update a cabin with a valid version number, then the cabin is updated and a 200 is returned with the updated DTO.
```

---

### Use concrete HTTP status codes and domain terms
In backend ACs, always name the specific HTTP status code. In frontend ACs, describe the user-visible outcome.

**Backend:**
```
...then a 201 is returned with a CabinDto in the response body.
```

**Frontend:**
```
...then the cabin appears in the cabin list on the dashboard.
```

---

### Avoid vague outcome language
Ban the following in Then clauses: "it should work", "the correct result is returned", "an error occurs", "the user sees a message". Be specific.

| Vague | Specific |
|---|---|
| "an error is returned" | "a 400 Bad Request is returned with a message describing the validation failure" |
| "the user sees feedback" | "a toast notification appears with the message 'Cabin saved'" |
| "the cabin is updated" | "the cabin's name is updated and the new version number is returned in the response" |

---

## Anti-Patterns to Avoid

| Anti-pattern | Why it fails |
|---|---|
| AC tests the implementation path, not the behavior | Breaks if code is refactored, even if behavior is correct |
| Compound Then: "then X and Y and Z" | Can only partially pass — makes test results ambiguous |
| Missing actor in Given | Can't determine which auth rules apply |
| "Happy path only" unit | Leaves failure paths untested and edge cases unspecified |
| AC describes a UI element by CSS class | Fragile; breaks on UI changes that don't affect behavior |
| AC contains "should" instead of "then" | "Should" is ambiguous — use "then" for deterministic outcomes |

---

## CabinConnect-Specific AC Patterns

### Availability ACs always cover all three blocking conditions
Any AC about Cabin availability must cover: existing Bookings, active Holds, AND Blackout Dates. Never write an availability AC that only covers one of the three.

### Pricing ACs always specify "at confirmation" vs "current"
When writing ACs about price, specify whether the price is the stored Total Price (frozen at confirmation) or the current rate calculation. These are different — never conflate them.

### Date ACs specify UTC and date-only
ACs involving dates should state "as a UTC date-only value" to make it clear that timezone conversion is not part of the server behavior.

### Ownership ACs always include the non-owner failure path
Any AC about an operation on a Host-owned resource must include:
```
Given an authenticated host who does not own the cabin, when [action], then 403 is returned.
```
