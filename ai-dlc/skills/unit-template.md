# Unit Template

A **Unit** is the atomic deliverable of work in AI-DLC. Each Unit maps to one feature slice: a user-facing behaviour, a data operation, or an integration point.

---

## Unit Structure

```
## Unit: <short name>

### Context
<1-2 sentences on why this unit exists and what problem it solves>

### Acceptance Criteria
- Given <starting state>, when <action>, then <observable outcome>
- (Add one AC per distinct behaviour — no compound ACs)

### Scope
**In scope:**
- <explicit list of what this unit covers>

**Out of scope:**
- <explicit list of what is intentionally excluded>

### Dependencies
- <other units or services this depends on>

### Definition of Done
- [ ] AC covered by tests
- [ ] Prompt quality gate passed (see rules/prompt-quality-gate.md)
- [ ] Code review complete
- [ ] No new lint or type errors
- [ ] Feature toggled off in production until acceptance sign-off
```

---

## Example Unit

```
## Unit: Cabin Availability Check

### Context
Guests need to see which cabins are available for a given date range before booking.

### Acceptance Criteria
- Given a valid date range, when the guest searches, then only cabins with no overlapping confirmed bookings are returned
- Given an invalid date range (check-out before check-in), when submitted, then a validation error is returned and no query is made

### Scope
**In scope:**
- Availability query endpoint (GET /cabins/available)
- Date range validation
- Filtering by cabin capacity (optional param)

**Out of scope:**
- Pricing calculation
- Booking creation
- Real-time hold/lock on cabins during browsing

### Dependencies
- Cabin entity and database schema must exist
- Booking entity with status field must exist

### Definition of Done
- [ ] AC covered by tests
- [ ] Prompt quality gate passed
- [ ] Code review complete
- [ ] No new lint or type errors
- [ ] Feature toggled off in production until acceptance sign-off
```
