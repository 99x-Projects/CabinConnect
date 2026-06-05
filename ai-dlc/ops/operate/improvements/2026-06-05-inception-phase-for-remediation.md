# Improvement: Inception Phase Required for Remediation Work

**Status:** Applied
**Triggered by:** [ops/operate/retros/2026-06-05-p0-defects.md](../retros/2026-06-05-p0-defects.md)
**Applied date:** 2026-06-05
**Knowledge promotion:** Pending

---

## Target File

`CLAUDE.md` Section 6 (mirrored to `.cursorrules` and `.github/copilot-instructions.md`)

---

## Current Text

```
N/A — new addition. No rule currently governs whether Inception is required for
remediation or defect work.
```

---

## Proposed Replacement

New rule added between the elaboration turn structure and Feature flags in Section 6.

---

## Reason

The P0 defect session skipped the entire Inception phase: no intent file, no elaboration, no unit decomposition, no bolt planning, no risk assessment. Work jumped from archaeology findings directly to code generation. The implicit assumption was "it's a bug fix, process doesn't apply." This is wrong — bug fixes and remediation bolts change existing code and carry the same risks as feature bolts. The quality gate is not a substitute for the elaboration turn structure: it validates prompt components, not whether the work has been properly scoped, sequenced, and risk-assessed.

---

## Validation

- [ ] No bolt — including defect fixes and remediation — begins code generation without a corresponding intent file existing
- [ ] No bolt executes without a bolt file and risk assessment signed off
- [ ] After 3 bolts, zero instances of work starting without an intent or elaboration
