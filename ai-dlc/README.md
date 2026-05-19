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

## How This Process Achieves High Quality

AI code generation is fast but produces five classes of failure: logic errors that look correct, security vulnerabilities, hallucinated library calls, over-engineering, and architectural drift. Each phase of AI-DLC has specific mechanisms that prevent or catch each class. Quality is not a review step at the end — it is built into every gate.

### Before a line of code is written — Inception controls

**Problem:** AI optimizes for what it was asked to do, not what the system should actually do. If the request is vague, the output will be confidently wrong.

**How AI-DLC addresses it:**
- The [Prompt Quality Gate](rules/prompt-quality-gate.md) requires four components before any code generation: Context, Constraints, Acceptance Criteria, and Output Format. A missing component blocks generation — Claude asks for it first.
- [Mob Elaboration](skills/mob-elab-prompts.md) produces ACs in Given/When/Then format through a turn-by-turn conversation. One unit at a time, with human sign-off at every step — the team's domain knowledge shapes the ACs, not the AI's inference.
- The [Unit template](ops/build/units/_template.md) records explicit In Scope / Out of Scope boundaries and Pre-generation Checks — for wrapper or layout units, patterns to grep across existing files before generating, to surface duplication before code is written.
- [Known edge cases](guidelines/edge-cases.md) (EC-001–EC-010) are checked per unit during elaboration, not discovered in production.

The result: by the time an engineer types "execute unit X," the AI has been given a precise, constrained, testable brief — which is the single biggest driver of output quality.

### During generation — Rules as a behavioral contract

**Problem:** AI doesn't inherently know this system's architecture, security posture, or domain rules.

**How AI-DLC addresses it:**
- [CLAUDE.md](../CLAUDE.md) is loaded every session and acts as a behavioral contract. It covers domain language, system boundaries, security never/always rules, naming conventions, and known edge cases. Claude cannot generate code without these rules in context.
- [Code standards](rules/code-standards.md) encode lessons learned from past failures — e.g. `BadRequest` not `ValidationProblem` in .NET controllers (discovered Bolt 01), and the React auth reactive redirect pattern (discovered Bolt 02). Failures become rules so the same mistake cannot recur.
- [Architecture decisions](rules/architecture.md) record system boundaries as ADRs, including the Supabase ES256/JWKS JWT pattern. Claude enforces these boundaries during generation; engineers check them during review.
- [Security rules](rules/security.md) cover injection, auth, RLS, secrets, CORS, file uploads, and dependency management — applied at generation time, not discovered at audit time.

### After generation — The Review Checklist as a structured lens

**Problem:** AI output looks clean. It compiles, passes linting, and reads as plausible. The failure modes hide in the gaps between what was asked and what was needed.

**How AI-DLC addresses it:**

The [Review Checklist](skills/review-checklist.md) provides a structured lens for each of the five failure modes:

| Failure mode | Checklist mechanism |
|---|---|
| **Logic errors** | Every AC traced to code; feature verified in a real environment — tests passing alone is not sufficient |
| **Security vulnerabilities** | Full security section: auth on every endpoint, RLS policies, no SQL concatenation, no secrets; active walk-through not a passive tick |
| **Hallucinated library calls** | Compile and run the code — TypeScript strict mode and `dotnet build` catch most; runtime-only misuse requires running the feature |
| **Over-engineering** | Explicit check: nothing in the diff beyond what the ACs required — no extra abstractions, interfaces, or future-proofing |
| **Architectural drift** | Dedicated Architecture section: diff checked against system boundaries in `rules/architecture.md`; new cross-boundary patterns require an ADR |

Two additional AI-specific checks close gaps that generic code review misses: existing pages are grepped for patterns a new wrapper will duplicate before generation (not after browser review), and behavioral trade-offs are confirmed with the engineer before output is accepted.

### After the Bolt — The retro as a process compiler

**Problem:** AI-assisted development produces failures that are different from traditional failures — wrong assumptions about algorithms, subtle behavioral trade-offs silently baked in, scope creep that looks like helpfulness. These failures recur unless the process learns.

**How AI-DLC addresses it:**
- A [Retrospective](ops/operate/retros/) is held after every Bolt. It records what worked, what the AI got wrong, which prompts needed revision, and where output was accepted without enough review.
- Every process problem identified in a retro must produce either an [Improvement file](ops/operate/improvements/) or an explicit reason why no rule change is warranted. "None filed at this time" without a reason is not acceptable.
- Improvements update the rules, guidelines, or skills files directly — so the lesson is encoded into the next session's behavioral contract, not just remembered.

This is the closed loop: failures in Operate update rules in Build, which change generation behavior in the next Inception. Each Bolt makes the process measurably better than the last.

### The audit trail — Accountability without overhead

Every AI interaction is logged in [`prompts/`](prompts/) with the quality gate components, key decisions, and output summary. This serves three purposes:
1. **Review:** a reviewer can read the prompt log to understand what context the AI was given — wrong context explains wrong output, which points to a rule gap, not just a bad diff
2. **Debugging:** when something fails in production, the prompt log traces the decision back to the generation session
3. **Improvement:** retros reference prompt logs to identify which prompt patterns worked and which needed revision

---

## Supporting Resources

| Folder | Purpose |
|---|---|
| [`rules/`](rules/) | Code standards, security rules, architecture decisions, prompt quality gate |
| [`skills/`](skills/) | Unit template, mob elaboration prompts, review checklist |
| [`guidelines/`](guidelines/) | Domain glossary, edge cases, acceptance patterns, dev setup, team rollout |
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
- [guidelines/dev-setup.md](guidelines/dev-setup.md) — environment setup checklist for new engineers
- [guidelines/team-rollout.md](guidelines/team-rollout.md) — scaling AI-DLC to a multi-engineer team
