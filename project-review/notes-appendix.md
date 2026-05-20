# AI-DLC project review — Appendix

Supporting detail for [`notes.md`](notes.md). Open this when you want the diagrams, the per-artifact concurrency table, the concrete `main`-level cleanup checklist, or a snapshot of the final branch state.

## Contents

- [A. Concrete additions to consider for `main`](#a--concrete-additions-to-consider-for-main)
- [B. What this simulation did NOT do](#b--what-this-simulation-did-not-do)
- [C. Diagrams](#c--diagrams)
- [D. Concurrency profiles per artifact](#d--concurrency-profiles-per-artifact)
- [E. `main` cleanup checklist](#e--main-cleanup-checklist)
- [F. What's working well on `main` (keep this)](#f--whats-working-well-on-main-keep-this)
- [G. Missing 99x adaptation content (currently NOT on `main`)](#g--missing-99x-adaptation-content-currently-not-on-main)
- [H. Final state of this branch (commit-ready)](#h--final-state-of-this-branch-commit-ready)

---

## A — Concrete additions to consider for `main`

If the four suggestions in [`notes.md`](notes.md) land for the 99x team, three small additions to the AI-DLC scaffold cover them:

| Addition | Lives at | Connects to |
|---|---|---|
| `prd/` slot | `ai-dlc/ops/inception/prd/` | Suggestion 1 |
| `dfd/` slot | `ai-dlc/ops/inception/dfd/` | Suggestion 3 |
| `team-setup.md` guideline | `ai-dlc/guidelines/team-setup.md` *(new)* | Suggestion 4 |

Plus paragraphs in `CLAUDE.md` §5 and `ai-dlc/ops/inception/README.md` codifying:

- The **PRD as a singleton Inception document** with the section list from Suggestion 1
- The **DFR** ritual alongside Mob Elaboration
- Cluster-elaboration mechanics (Suggestion 2)
- The **file ↔ Issue** split for team setups (Suggestion 4)

The stale-content cleanup is in [E. `main` cleanup checklist](#e--main-cleanup-checklist) below.

---

## B — What this simulation did NOT do

- **Bolt 1 retro not run.** Bolt 1's 7 Units are `Done`. Retro is the next step. User review is the trigger.
- **Bolt 2 not executed.** Planned (8 Units). Bolt 2 platform code (`backend/`, `data-layer/`, `infra/`) is deliberately absent — appears when Bolt 2 executes.
- **No designer staffed.** DFD is mock-quality FDE-stand-in content. A real engagement needs a designer to validate before any UI work commits.
- **Nothing committed.** Branch state is ready to commit; user is reviewing.
- **Did not look at `sachith-ai-dlc-impl`.** We wanted a clean baseline read off `main` so we wouldn't be primed by another worked example.
- **Did not touch `main`.** All work on `asithaw-aidlc-impl`.

---

## C — Diagrams

### Diagram 1: Two parallel Inception artifacts

```
INCEPTION
   │
   ├─►  PRD  (what / why)               ─►  Intents              ─►  Mob Elaboration   ─►  Bolts (Construction)
   │
   └─►  DFD  (how it looks and feels)   ─►  Design-system Units  ─►  Design Foundation Review
```

### Diagram 2: Definitions vs work state (Suggestion 4)

```
GIT (markdown — durable, PR-reviewed)             ISSUES / PROJECTS (live work surface)
─────────────────────────────────────             ─────────────────────────────────────
 PRD / DFD                                          
 Intent files (after Elaborated)             ↔     (optional umbrella Issue per Intent)
 Elaboration session files                          
 Unit files (definition — ACs, scope, DoD)   ↔     Unit Issues (status, assignee, in-flight notes)
 Bolt files (goal, included Units)           ↔     Bolt Milestones (aggregate Unit Issues)
 Retro files                                 ↔     Retro action-item Issues
 Improvements (= PRs)                               
 Prompt logs                                        
 ADRs / Rules / Skills / Guidelines                 
                                                     Project board (= the "backlog" in team mode)

Discipline:  decisions land in the file; comments stay in the Issue.
             Project Champion ensures comment-thread decisions reach the file
             before the Issue closes.
```

---

## D — Concurrency profiles per artifact

| Artifact | Change frequency | Right surface |
|---|---|---|
| PRD / DFD | Weekly during inception, then quarterly | Git markdown |
| Intent definition | A few edits during Mob Elaboration, then frozen | Git markdown |
| Elaboration session content | Captured once at end of session | Git markdown |
| Unit definition (ACs, scope, deps, DoD) | Created during elaboration, then largely frozen | Git markdown |
| **Unit work state** (status, assignee, blockers) | **Multiple times per day during a Bolt** | **GitHub Issue** |
| **Bolt execution state** (which Units are Done now) | **Daily** | **GitHub Milestone** |
| Bolt definition (goal, Units, cross-Unit decisions) | Set once at planning | Git markdown |
| **Backlog** | **Every status change — many times per day** | **Project board view (not a file)** |
| Retro | Written once at Bolt close | Git markdown |
| ADRs | Authored once, rarely revised | Git markdown |
| Prompt log | Append-only during execution | Git markdown |
| Rules / Skills / Guidelines | Updated via Improvements (PRs) | Git markdown |

Two artifacts behave very differently in team mode vs solo mode:

- **`backlog.md`** is the artifact that breaks first. In team mode it's a Project board filter view, not a file.
- **Unit files split.** The *contract* (ACs, scope, deps, DoD) stays in git; the *execution* (status, assignee, blockers) moves to an Issue. They reference each other.

---

## E — `main` cleanup checklist

Minimum cleanup to make `main` ready for a fresh team:

- [ ] Rewrite `CLAUDE.md` Project Identity + Domain Language + Edge Cases against `Requirements.md` (4-module community platform, not booking platform) *(draft on our branch)*
- [ ] Add 99x adaptation content to `CLAUDE.md` — Mental Model, Vocabulary (Bolt / Unit / Human+AI pair / etc.), 99x Guardrails *(drafted)*
- [ ] Add the three scaffold additions from [section A](#a--concrete-additions-to-consider-for-main) (`prd/`, `dfd/`, `team-setup.md`)
- [ ] Add the suggestions summary in `CLAUDE.md` §5 *(drafted)*
- [ ] Rewrite `ai-dlc/guidelines/domain-glossary.md` against the 4-module platform
- [ ] Reset `ai-dlc/guidelines/edge-cases.md` to the 10 starter cases (EC-001..EC-010)
- [ ] Update the 4 prompt headers in `ai-dlc/skills/mob-elab-prompts.md` — drop "cabin booking platform"
- [ ] Create `ai-dlc/ops/build/` with `units/README.md`, `bolts/_template.md`. For `backlog.md`: either create it (solo mode) or document that it's a Project board view (team mode).
- [ ] Fix broken `_template.md` path references in `CLAUDE.md` reference map

---

## F — What's working well on `main` (keep this)

The structural choices in the existing scaffold are sound. The following are worth highlighting in any internal 99x write-up:

| Area | Why |
|---|---|
| Three-phase folder structure (`ops/inception`, `ops/build`, `ops/operate`) | Maps cleanly to canonical AI-DLC; the `improvements ←──` loop is correctly modelled |
| Intent template with 4-stage status lifecycle | Better than most teams' "issue tracker" approach |
| Mob Elaboration session template with *Context Loaded* checklist | Forces conscious context injection before prompts fire |
| Inception README's *Definition of Done* | Explicit, testable; prevents "kind of done" drift |
| Review Checklist | Five AI-specific failure modes well-mapped |
| Mob elab prompts 1–5 | Right sequence; reusable |
| `Instructions2FDE.md` | Clear engineer-facing onboarding |

---

## G — Missing 99x adaptation content (currently NOT on `main`)

The AWS PDF is the canonical method. The 99x April PPT layers concepts on top that aren't yet reflected in the scaffold — worth back-porting:

| 99x concept | In scaffold on `main`? |
|---|---|
| **Bolt** replacing Sprint | Mentioned in README; no template existed |
| **Unit owned by a Human + AI pair** | Not mentioned |
| **Pilot model** (AI Plans → Clarifies → Human Validates → AI Executes) | Not in any rule |
| **Two failure modes** (Blind / Frustrated Engineer) | Not framed |
| **Xianix** as L2 platform layer | Not referenced |
| **FDE** acronym expanded | Filename only |
| **Project Champion** role | Not mentioned |
| **AI-Maestro skill set** | Not mentioned |
| **Four-Layer Abstraction model** | Not mentioned |
| **99x Guardrails** (Process / Technical / Governance) | Not codified |

All addressed in our `CLAUDE.md` rewrite.

---

## H — Final state of this branch (commit-ready)

```
CabinConnect/
├── platform/                        ← Bolt 1 product code only
│   ├── frontend/                    (React + Vite + TS strict + Tailwind + i18n + PWA + CabinProfile demonstrable)
│   ├── shared/                      (contract types — Bolt 1 ↔ Bolt 2 handoff surface)
│   ├── .env.example, .husky/, eslint.config.js, .prettierrc.json, lint-staged.config.js
│   ├── pnpm-workspace.yaml, package.json
│   └── README.md                    (See the UI: cd platform && pnpm install && cd frontend && pnpm dev)
│
├── ai-dlc/
│   ├── ops/inception/{prd, tfd, dfd, intents, elaborations}/
│   ├── ops/build/
│   │   ├── backlog.md               (20 Units indexed — 7 Done, 8 Planned, 5 Deferred)
│   │   ├── bolts/{bolt-01-ui-foundation.md, bolt-02-backend-foundation.md, _template.md}
│   │   └── units/                   (20 Unit files)
│   ├── ops/operate/runbooks/rotate-supabase-key.md
│   └── prompts/                     (4 audit-trail entries)
│
├── project-review/
│   ├── notes.md                     ← the suggestions
│   └── notes-appendix.md            ← this document
├── .github/
│   └── ISSUE_TEMPLATE/unit.md       ← Unit Issue template (Suggestion 4 — file ↔ Issue pattern made concrete)
├── CLAUDE.md                        ← rewritten with 99x adaptation content + Inception slots
├── .editorconfig                    ← repo-wide
└── README.md                        ← thin pointer between platform/ and ai-dlc/
```

> **Note on `tfd/`:** the branch contains a `tfd/` slot we created during the simulation. On reflection it overlaps with the existing `ai-dlc/rules/architecture.md` ADR log, so we did not promote it to a recommendation. Kept on the branch as a worked example for anyone who wants to compare a singleton-architecture-doc approach with the ADR-log approach.

— End of review —
