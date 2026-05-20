# Unit: U-D03 — Accessibility CI gate (axe-core)

**Owning artifact:** [DFD §5 Accessibility](../../inception/dfd/DFD.md)
**Status:** Open — deferred to Bolt 3
**Bolt:** Bolt 3+ (depends on U-T02 CI/CD existing)
**Dependencies:** U-T02 (CI/CD pipeline)

---

## Context

Wire `axe-core` into Playwright E2E tests so accessibility violations fail CI. Per DFD §5, WCAG 2.2 AA is the target.

This Unit is **deferred to Bolt 3** because it requires the CI/CD pipeline (U-T02, Bolt 2) to be in place. Installing the npm packages and writing the test code without the CI hook means nothing — the test runs but never gates anything.

## Acceptance Criteria

*Plan-quality starting points (to be refined when Bolt 3 elaborates):*

- Given a Playwright E2E test runs against a page, when axe-core analyses the page, then critical and serious violations are reported.
- Given the CI workflow runs the Playwright suite, when a PR introduces a serious or critical a11y violation, then the build fails with a clear report citing the rule and location.

## Scope

*Refined when Bolt 3 plans this Unit.*

## Definition of Done

*Refined when Bolt 3 plans this Unit.*
