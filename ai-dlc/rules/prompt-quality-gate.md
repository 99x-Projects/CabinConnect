# Prompt Quality Gate

Before responding to any request to write, generate, or modify code:

## Step 1 — Check for the Four Components

Every request must contain all four of the following:

| Component | What it means |
|---|---|
| **Context** | Who is asking, what system or project this relates to |
| **Constraints** | What must not be done, which rules apply (security, architecture, standards) |
| **Acceptance Criteria** | A testable pass/fail condition — how to know the output is correct |
| **Output Format** | What the response should look like (code, checklist, diagram, prose, scaffold) |

## Step 2 — If Any Component Is Missing, Do Not Generate Code

Ask the engineer one question at a time to fill the gap.
Start with the most critical missing component in this order:

1. **Acceptance Criteria** — without a pass/fail condition, there is no way to verify correctness
2. **Context** — without knowing the system, the output may not fit
3. **Constraints** — without knowing what is off-limits, the output may violate rules
4. **Output Format** — without knowing the expected shape, the response may not be usable

Do not ask all questions at once. Ask the one that matters most, wait for the answer, then proceed or ask the next.

## Step 3 — Only Generate Code Once All Four Are Present

When all four components are present, proceed with generating the output.

## Step 4 — Confirm the Components at the Top of Your Response

When you do generate code, begin your response with a brief summary of what guided the output:

```
**Context:** <one line>
**Constraints:** <one line>
**Acceptance Criteria:** <one line>
**Output Format:** <one line>
```

Then provide the output.

---

## Example: Incomplete Request

> "Add a search endpoint for cabins."

Missing: Constraints, Acceptance Criteria, Output Format.
Most critical gap: Acceptance Criteria.

Correct response:
> "Before I generate this — what's the testable condition for a correct search result? For example: given a date range and guest count, which cabins should be returned and which should be excluded?"

---

## Example: Complete Request

> "We're building CabinConnect (.NET 8 API, Supabase). Do not modify the auth layer.
> The endpoint must return only cabins with no overlapping Confirmed bookings for the given date range.
> An invalid date range (check-out ≤ check-in) must return 400.
> Generate the controller action, service method, and xUnit test stubs."

All four components present — generate immediately, confirm at the top of the response.
