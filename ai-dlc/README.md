# AI-DLC — CabinConnect

AI-Driven Development Lifecycle for CabinConnect. This folder is the operating system for how the team uses AI to build this product.

## The Three Phases

```
INCEPTION  →  BUILD  →  OPERATE
   ↑                        |
   └────── improvements ────┘
```

### Phase 1 — Inception
Discover and define what to build.

1. Write an **Intent** — a feature or capability you want the system to have
2. Run a **Mob Elaboration** — a structured session (team + AI) to break the intent into testable behaviours
3. Extract **Units** from the elaboration — atomic deliverables, each with acceptance criteria

Artifacts live in: [`ops/inception/`](ops/inception/)

### Phase 2 — Build
Plan and construct.

1. Triage and prioritise Units in the **Backlog**
2. Plan a **Bolt** — a batch of related units to deliver together (like a sprint, but outcome-scoped)
3. Execute each unit: use the skills and prompt quality gate to generate, review, and merge code
4. Log every AI interaction in [`prompts/`](prompts/) as the audit trail

Artifacts live in: [`ops/build/`](ops/build/)

### Phase 3 — Operate
Run the system and feed back.

1. Hold a **Retrospective** after each Bolt — what worked, what failed, what the AI got wrong
2. Record **Incidents** — production issues, linked to edge cases in the guidelines
3. File **Improvements** — updates to rules, guidelines, or skills triggered by operating the system

Artifacts live in: [`ops/operate/`](ops/operate/)

---

## Supporting Resources

| Folder | Purpose |
|---|---|
| [`rules/`](rules/) | Code standards, security rules, architecture decisions, prompt quality gate |
| [`skills/`](skills/) | Unit template, mob elaboration prompts, review checklist |
| [`guidelines/`](guidelines/) | Domain glossary, edge cases, acceptance patterns |
| [`prompts/`](prompts/) | Prompt audit trail — one file per feature, every session logged |

---

## Artifact Lifecycle

```
Intent
  └── Mob Elaboration
        └── Unit (status: Open)
              └── Bolt (status: Planned → Active → Complete)
                    └── Code (PR merged)
                          └── Retrospective
                                └── Incident / Improvement
                                      └── Updated Rules / Guidelines
```

## Key Files to Know

- [rules/prompt-quality-gate.md](rules/prompt-quality-gate.md) — run this before every code generation request
- [skills/mob-elab-prompts.md](skills/mob-elab-prompts.md) — reference prompts for elaboration sessions
- [skills/review-checklist.md](skills/review-checklist.md) — run this before approving any AI output
- [ops/build/backlog.md](ops/build/backlog.md) — master status of all units
