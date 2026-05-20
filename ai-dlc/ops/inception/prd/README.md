# Product Requirements Document (PRD)

The PRD is the engineering team's **enriched product brief** for CabinConnect. It is derived from the customer brief in [`docs/solution/Requirements.md`](../../../../docs/solution/Requirements.md) and extended with our domain research, competitor analysis, persona work, NFR thresholds, risks, and measurement criteria.

The PRD is the artifact Mob Elaboration sessions reference when they break Intents into Units. Every Intent we write should be traceable back to a section of this document.

---

## How This Folder Fits Into AI-DLC

```
docs/solution/Requirements.md          ← customer brief (canonical, immutable by convention)
              ↓ derives
ai-dlc/ops/inception/prd/PRD.md        ← this folder (enriched product spec)
              ↓ produces candidate intents
ai-dlc/ops/inception/intents/          ← one Intent per capability we choose to build
              ↓ elaborated in
ai-dlc/ops/inception/elaborations/     ← one or more sessions per Intent
              ↓ extracts
ai-dlc/ops/build/units/                ← atomic Units with ACs
```

---

## Lifecycle

The PRD is a **singleton** (one per project). Its lifecycle field sits in the document header:

| Status | Meaning |
|---|---|
| `Draft` | Being written; not ready for Inception |
| `Review` | Complete; team review in progress |
| `Approved` | Signed off; basis for the next Intent waves |
| `Superseded` | A major rewrite has replaced this version (kept for history; the new version takes the name `PRD.md` and this one is archived to `PRD-archived-YYYY-MM-DD.md`) |

Minor edits within a status (typos, link fixes, attribution updates) do not require a status change; record them in the Change Log at the bottom of the PRD.

---

## Relationship to `Requirements.md`

`docs/solution/Requirements.md` is the **customer brief** — what we received. It does not change without explicit customer approval. The PRD is our enriched version. Every requirement in the PRD is attributed to its source:

| Attribution tag | Meaning |
|---|---|
| `[Customer brief: MC-01]` | Directly from Requirements.md |
| `[Discovery insight: I-3]` | Derived from our research (insight number references §6 of the PRD) |
| `[Assumption (customer-approved): …]` | Our addition; in simulation mode we treat this as signed off |

This makes "where did this come from?" answerable in seconds during retros and reviews.

---

## Why This Slot Exists

The AWS AI-DLC PDF lists PRFAQ, NFR definitions, Risk Descriptions, and Measurement Criteria as **outputs of the Inception phase** — but the scaffold on `main` does not have a folder for them. The Inception phase had `intents/` and `elaborations/` only. This PRD folder fills that gap.

See [`project-review/notes.md`](../../../../project-review/notes.md) for the recommendation to bake this slot into the scaffold on `main`.

---

## Research Subfolder (optional)

If any single discovery section in the PRD grows too large to embed cleanly (e.g. a 20-row competitor matrix), it can spill out into a `research/` subfolder inside `prd/` and be linked from the PRD. The default is to **embed**; spill out only when embedded length hurts readability.

```
prd/
  README.md
  PRD.md
  research/            ← optional; only when a discovery section gets too large
    competitor-matrix.md
```
