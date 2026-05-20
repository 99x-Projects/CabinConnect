# Design Foundation Document (DFD)

The DFD is the design team's **product-design decision record** for CabinConnect — the third Inception artifact, peer to the [PRD](../prd/PRD.md) and the [TFD](../tfd/TFD.md).

| Artifact | Decides |
|---|---|
| PRD | *what* the system does and *why* — features, scope, NFRs, risks |
| TFD | *how* the system is built — stack, repo shape, CI/CD, tooling |
| **DFD** | *how the system looks and feels* — design system, visual identity, a11y, UX patterns |

Bolt 0 (or a separate Bolt 0.5) — Design System Units — are drawn from this document.

---

## How This Folder Fits Into AI-DLC

```
docs/solution/Requirements.md     ← customer brief
              ↓                              ↓                              ↓
ai-dlc/ops/inception/
   prd/PRD.md                     tfd/TFD.md                     dfd/DFD.md
              ↓                              ↓                              ↓
         Intents                  Scaffolding decisions          Design-system decisions
              ↓                              ↓                              ↓
   Mob Elaboration                Technical Foundation Review     Design Foundation Review (DFR)
              ↓                              ↓                              ↓
   Feature Intents                Scaffolding Units               Design-system Units
              ↓                              ↓                              ↓
   Feature Bolts                  Bolt 0                          Bolt 0.5 (or interleaved with Bolt 0)
```

See [`project-review/notes.md`](../../../../project-review/notes.md) — Principle 4 — for the broader rationale.

---

## Why This Slot Exists

Canonical AI-DLC (AWS PDF) talks about user stories and PRFAQ but does not address **product design** as an explicit Inception concern. The result in practice:

- Tech stack ("React") is mistaken for a design system decision
- The first feature Bolt that ships UI silently commits the product to whatever component choice / colour values / spacing scale were made on the fly
- A designer (if present) operates outside the AI-DLC ritual map — outside the retro, outside the audit trail
- Drift compounds: the second feature reinvents the first feature's empty state because nothing canonical exists

The DFD closes this gap by making design decisions **explicit, reviewable, and durable** — the same way the TFD does for technical decisions.

---

## Lifecycle

The DFD is a **singleton** (one per project). Lifecycle field sits in the document header:

| Status | Meaning |
|---|---|
| `Draft` | Being written; not ready for design-system Unit extraction |
| `Review` | Complete; designer + team review in progress |
| `Approved` | Signed off; design-system Bolt may be planned |
| `Superseded` | Major rewrite has replaced this version (archived to `DFD-archived-YYYY-MM-DD.md`) |

---

## Ritual — Design Foundation Review (DFR)

The DFD does **not** go through Mob Elaboration. Like the TFD, its content is *decisions with low ambiguity* — what library, what palette, what accessibility target. The appropriate ritual is a **Design Foundation Review (DFR)** — designer-led, walks each section, captures the ADR for any newly-introduced choice, produces the candidate Units.

A DFR is typically 60–90 minutes (slightly longer than a TFR because design decisions invite more debate). The AI's role is to draft proposals and flag inconsistencies, not to drive decomposition.

---

## Relationship to other documents

| Doc | Role |
|---|---|
| `DFD.md` | Source of truth for design decisions |
| `CLAUDE.md` §1 | Stack identity only — does *not* mirror DFD |
| `platform/frontend/src/design-tokens/` *(future)* | Where design tokens actually live in code — the runtime form of decisions captured here |
| Figma file *(future, optional)* | Designer's working file — reference, not source of truth at MVP |

When a DFD decision changes, the design-token files in code update together with this document and (if used) the Figma file.
