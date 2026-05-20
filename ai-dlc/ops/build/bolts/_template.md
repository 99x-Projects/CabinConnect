# Bolt: <Name>

**Bolt ID:** bolt-NN
**Status:** Planned | Active | Complete | Aborted
**Date opened:** YYYY-MM-DD
**Date closed:** YYYY-MM-DD
**Lead:** <name or initials> (the Human owner; AI is the pair, not the lead)

---

## Goal

<!-- One paragraph. What user-visible outcome does this Bolt deliver? Outcome-scoped, not time-scoped. -->

## Included Units

| Order | Unit | Owning Intent | Status | Notes |
|---|---|---|---|---|
| 1 | [U-NNN](../units/u-NNN-<slug>.md) | CI-NN | Planned | |
| 2 | | | | |

Suggested Bolt size: 3–8 Units. Foundation Bolt (the first Bolt of a greenfield project) is exempt — it may be larger because it covers a Foundation Cluster of Intents.

## Execution Order Rationale

<!-- Why these Units in this order? Call out dependencies that drove the order. -->

## Cross-Unit Decisions

<!-- Design decisions made across multiple Units in this Bolt. Often surfaced during Mob Construction. -->

| # | Decision | Affects Units |
|---|---|---|
| BD-1 | | |

## Definition of Done — Bolt Level

- [ ] Every Unit in this Bolt is `Done` per its own DoD checklist
- [ ] All ACs traced to code
- [ ] All tests passing in CI (automated)
- [ ] No new lint or type errors
- [ ] Security review passed for any new endpoints (auth, RLS, scope)
- [ ] Prompt log entry exists for every Unit (`ai-dlc/prompts/`)
- [ ] No Unit had its scope expanded during construction without a new Unit being created (per 99x Guardrail "scope is human-controlled")
- [ ] Retro scheduled or written in `ai-dlc/ops/operate/retros/bolt-NN.md`

## Retro

Link to retro file once closed: [bolt-NN retro](../../operate/retros/bolt-NN.md)

## Notes

<!-- Anything else relevant to the Bolt — risks accepted, deferred items, decisions reversed mid-Bolt. -->
