# Improvement: Contract Change Detection Before Unit Execution

**Status:** Applied
**Triggered by:** [ops/operate/retros/2026-06-05-p0-defects.md](../retros/2026-06-05-p0-defects.md)
**Applied date:** 2026-06-05
**Knowledge promotion:** Pending

---

## Target File

`ai-dlc/rules/code-standards.md`

---

## Current Text

```
When the contract-change form applies, the unit file must include a **Breaking Changes
Register** — a table listing every changed contract boundary, the reason, and the
approving engineer. No unit using the contract-change form may execute without a
completed register.
```

(No explicit pre-execution check to identify whether a change is a contract change.)

---

## Proposed Replacement

Adds a mandatory "Contract Change Check" section immediately after the existing Default AC text.

---

## Reason

Adding `BaseRate` to `CreateCabinRequest` changed a public API endpoint shape. This was not identified as a contract change before the unit ran. The existing contract-change form rule is correct, but it has no trigger — there is nothing that forces the AI to ask the question before starting. The check must be explicit and mandatory.

---

## Validation

- [ ] Every unit that touches a DTO, controller, or service interface has the contract-change question asked before code is generated after 3 bolts
- [ ] No Breaking Changes Register is missing from a unit that has a contract change
