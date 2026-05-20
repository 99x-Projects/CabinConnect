# Technical Foundation Document (TFD)

The TFD is the engineering team's **platform-level decision record** for CabinConnect — the technical counterpart to the [PRD](../prd/PRD.md). Where the PRD says *what* the system must do, the TFD says *on what platform and with what tooling we will build it*.

The TFD is the artifact **Bolt 0 — Technical Scaffolding** is drawn from. Every scaffolding Unit traces back to a section of this document.

---

## How This Folder Fits Into AI-DLC

```
docs/solution/Requirements.md     ← customer brief
              ↓ derives                                      ↓ derives
ai-dlc/ops/inception/prd/PRD.md     ai-dlc/ops/inception/tfd/TFD.md
              ↓                                              ↓
          Intents                                  Scaffolding decisions
              ↓ Mob Elaboration                              ↓ Technical Foundation Review
        Foundation Cluster + Feature Intents         Scaffolding Units (U-TNN)
              ↓                                              ↓
        Foundation Bolt (Bolt 1)                     Bolt 0 — Technical Scaffolding
        + Feature Bolts (Bolt 2..N)
```

See [`project-review/notes.md`](../../../../project-review/notes.md) — the principle *"in greenfield, recognise foundational Bolts before feature Bolts"* — for why this slot exists.

---

## Lifecycle

The TFD is a **singleton** (one per project). Its lifecycle field sits in the document header:

| Status | Meaning |
|---|---|
| `Draft` | Being written; not ready for Bolt 0 planning |
| `Review` | Complete; team/architect review in progress |
| `Approved` | Signed off; Bolt 0 may be planned |
| `Superseded` | A major rewrite has replaced this version (kept for history; new version takes the name `TFD.md` and this one is archived to `TFD-archived-YYYY-MM-DD.md`) |

Minor edits within a status (typos, link fixes, ADR appendage) do not require a status change — record them in the Change Log at the bottom of the TFD.

---

## Ritual — Technical Foundation Review (TFR)

The TFD does **not** go through Mob Elaboration. Its content is *decisions with low ambiguity*, not behaviour decomposition. The appropriate ritual is a **Technical Foundation Review (TFR)** — a shorter, architect/FDE-led session that:

- Walks each section and confirms (or amends) the decision
- Captures the ADR for any newly-introduced or changed decision
- Produces the candidate scaffolding Units that go into Bolt 0

A TFR is typically 30–60 minutes. No turn-by-turn AI prompting required — the AI's role here is to draft proposals and flag inconsistencies, not to drive decomposition.

---

## Relationship to `CLAUDE.md` and `ai-dlc/rules/architecture.md`

The TFD is the **single source of truth** for project-wide technical decisions. CLAUDE.md §1 mirrors a tiny subset (stack identity) for AI session-load; `ai-dlc/rules/architecture.md` holds the **ADR appendix** with full rationale, alternatives considered, and consequences for each ADR linked from the TFD.

| Doc | Role |
|---|---|
| `TFD.md` | The platform-level decisions, organized by area (stack, repo, CI/CD, etc.). Source of truth. |
| `CLAUDE.md` §1 | One-paragraph stack summary loaded into every AI session. Mirrors `TFD §2`. |
| `ai-dlc/rules/architecture.md` | Full ADR entries (one ADR per decision). Linked from the TFD inline list. |

When a TFD decision changes, all three must be updated together.
