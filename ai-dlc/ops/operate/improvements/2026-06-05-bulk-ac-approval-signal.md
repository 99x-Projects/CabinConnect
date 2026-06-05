# Improvement: Bulk AC Approval as Disengagement Signal

**Status:** Applied
**Triggered by:** [ops/operate/retros/2026-06-05-p0-defects.md](../retros/2026-06-05-p0-defects.md)
**Applied date:** 2026-06-05
**Knowledge promotion:** Pending

---

## Target File

`ai-dlc/rules/engagement.md`

---

## Current Text

```
- A proposed acceptance criterion, unit, or design decision is approved immediately
  without any challenge, modification, or question
```

(No special handling for bulk AC approval exists.)

---

## Proposed Replacement

Adds a new signal to the list and a special-case intervention rule for bulk AC approval.

---

## Reason

All 5 ACs in the P0 defect fixes session were approved with a single "these are fine" response. This passed an archaeology false positive (EC-011) through into the codebase unchallenged. The existing signal ("a proposed AC is approved without challenge") counts toward the 3-signal threshold, but that threshold is too slow — bulk AC approval on its own is high-risk enough to trigger immediate intervention. A wrong AC is not correctable after code is generated against it.

---

## Validation

- [ ] Bulk AC approval now triggers an immediate challenge question, not just a tally toward the 3-signal threshold
- [ ] No AC set passes without at least one AC receiving a substantive answer from the engineer after 3 bolts
