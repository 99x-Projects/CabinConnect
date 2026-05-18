# AI-DLC Engineer's Guide — CabinConnect

This is the main reference for every engineer working on CabinConnect using the AI-Driven Development Lifecycle. Read this before writing any code.

---

## What Is AI-DLC?

AI-DLC is a structured process for building software with AI assistance. It is not "use AI whenever you feel like it." It is a discipline: every piece of work starts with a clear intent, gets broken down collaboratively, is executed against testable acceptance criteria, and is logged so the team can improve.

The loop looks like this:

```
INCEPTION  →  BUILD  →  OPERATE
   ↑                        |
   └────── improvements ────┘
```

- **Inception:** Figure out what to build and define it precisely enough to act on
- **Build:** Write the code, using AI to accelerate — but with a human in control at every gate
- **Operate:** Run the system, learn from it, and feed that learning back into the process

---

## How This Project Is Organized

```
ai-dlc/
  Instructions2FDE.md       ← you are here
  README.md                 ← artifact lifecycle overview
  rules/                    ← non-negotiable rules Claude and engineers must follow
  skills/                   ← how-to guides and prompt templates
  guidelines/               ← domain knowledge and patterns
  prompts/                  ← audit trail of every AI interaction (one file per feature)
  ops/
    inception/              ← intents and elaboration sessions
    build/                  ← backlog, units, bolts
    operate/                ← retros, incidents, improvements
```

Before starting work, know these four files:

| File | Why it matters |
|---|---|
| [CLAUDE.md](../CLAUDE.md) | Loaded by Claude every session — the behavioral rules it follows |
| [rules/prompt-quality-gate.md](rules/prompt-quality-gate.md) | The gate Claude runs before generating any code |
| [ops/build/backlog.md](ops/build/backlog.md) | The live status of all units — what's open, planned, in progress, done |
| [guidelines/domain-glossary.md](guidelines/domain-glossary.md) | Canonical business terms — use these exactly in code and prompts |

---

## Running Ceremonies with Claude

Claude knows the full AI-DLC process. You do not need to manually copy templates, write prompts from scratch, or follow step-by-step checklists. Just tell Claude what ceremony you want to run and it will handle the structure, ask the right questions, create the right files, and update the backlog.

### How to invoke each ceremony

| You want to… | Say to Claude |
|---|---|
| Define a new capability | "Let's write an intent for [feature]" |
| Break an intent into units | "Run a mob elaboration for [intent name]" |
| Plan the next batch of work | "Plan a bolt from the open units in the backlog" |
| Build a unit | "Execute unit [name] from bolt [name]" |
| Write a retro | "Write the retro for bolt [name]" |
| Record a production issue | "Log an incident for [description of the problem]" |
| Improve a rule or guideline | "File an improvement for [what needs to change and why]" |

Claude will enforce the prompt quality gate, follow the mob elaboration interactive protocol, create all artifact files from templates, and update the backlog — without you needing to manage any of that manually.

### What you still own

Claude accelerates the ceremonies but does not replace your judgment:

- **Review every diff** before it merges. "It looks right" is not a review.
- **Confirm acceptance criteria** during mob elaboration — Claude proposes, you decide.
- **Run the tests** and verify the actual behavior in the UI, not just that the tests pass.
- **Check edge cases** against [guidelines/edge-cases.md](guidelines/edge-cases.md) for anything the code you're reviewing touches.

---

## Phase 1 — Inception

> Goal: turn a vague idea into a set of units with testable acceptance criteria.

An **Intent** is a one-page description of a capability you want the system to have. It describes the outcome, not the solution. A good intent fits on one page — if you need more, you have two intents.

A **Mob Elaboration** is a collaborative session where the team (with Claude as facilitator) breaks an intent into independently buildable units. Claude runs this as a turn-by-turn conversation: one unit at a time, confirming acceptance criteria and edge cases before moving on.

**To run inception:** tell Claude "Let's write an intent for [feature]" and follow the conversation. When the intent is ready, say "Run a mob elaboration for this intent." Claude will produce all files and backlog entries on sign-off.

---

## Phase 2 — Build

> Goal: take Open units, plan them into a Bolt, build the code with AI assistance, and ship.

A **Bolt** is a batch of related units that delivers a coherent, end-to-end outcome. Think of it as a mini-sprint scoped by what the user can do, not by how long it takes. A Bolt should be completable in 1–2 weeks with 3–8 units.

**To plan a bolt:** tell Claude "Plan a bolt from the open units in the backlog" and it will select units, set execution order, and create all files.

**To execute a unit:** tell Claude "Execute unit [name]" — Claude will apply the prompt quality gate, generate the code, and remind you to log the prompt. Work in this order:
1. API contract first
2. Implementation scaffold
3. Fill in TODOs
4. Tests
5. Claude self-review (ask: "Review your output against the rules and ACs")

**Before merging:** run through [skills/review-checklist.md](skills/review-checklist.md). Claude can run this for you — ask "Run the review checklist for this unit."

---

## Phase 3 — Operate

> Goal: learn from what was built and make the process better.

**After every Bolt:** say "Write the retro for bolt [name]." Claude will produce the retro file. Review it and add any action items it missed.

**When production issues occur:** say "Log an incident for [description]." Claude will create the incident file and check whether it relates to a known edge case.

**When the process needs updating:** say "File an improvement for [what needs to change and why]." Claude will quote the current text, write the replacement, apply it to the target file, and mark the improvement as applied.

---

## The Three Non-Negotiables

These are never optional, regardless of time pressure:

### 1. The Prompt Quality Gate
Every code generation request goes through the four-component check (Context, Constraints, Acceptance Criteria, Output Format). Claude enforces this automatically — if a component is missing, it will ask before generating any code.

### 2. The Review Checklist
Every AI-generated diff is reviewed by a human against the checklist before merge. Read the code. Run the tests. Check the edge cases. Claude can run the checklist for you, but the human sign-off is not optional.

### 3. The Prompt Log
Every AI interaction is logged in `prompts/`. Claude will remind you to log after each session. If there is no log entry, there is no audit trail.

---

## Using a Different AI Tool (Cursor or GitHub Copilot)

This guide is written for **Claude Code** (the CLI / VS Code extension), where `CLAUDE.md` is automatically loaded every session and Claude runs ceremonies autonomously. If your team uses Cursor or GitHub Copilot instead, the process is the same but the configuration layer changes.

### Cursor

Cursor supports project-level AI instructions via a `.cursorrules` file in the repo root. This is the equivalent of `CLAUDE.md`.

**What to change:**
1. Create `.cursorrules` at the repo root and copy the full contents of `CLAUDE.md` into it. Cursor loads this automatically for every chat in the project.
2. Ceremonies work the same way — type the same invocations ("Run a mob elaboration for…", "Execute unit…") into Cursor Chat. Cursor will follow the rules in `.cursorrules`.
3. For file context that Claude Code loads automatically (backlog, unit files, edge cases), use Cursor's `@file` references explicitly when needed — e.g. `@ops/build/backlog.md what are the open units?`
4. Keep `CLAUDE.md` in the repo as the source of truth. Sync any rule changes to `.cursorrules` as well — they should always be identical.

**What stays the same:** the artifact structure, templates, quality gate, review checklist, and prompt log are all tool-agnostic. Nothing in `ai-dlc/` needs to change.

---

### GitHub Copilot

GitHub Copilot Chat supports workspace-level instructions via `.github/copilot-instructions.md`. This is loaded automatically in VS Code and JetBrains when Copilot Chat is open.

**What to change:**
1. Create `.github/copilot-instructions.md` and copy the full contents of `CLAUDE.md` into it.
2. Ceremonies require more explicit context than with Claude Code. At the start of each ceremony, reference the relevant files in your message — for example: `Using the rules in CLAUDE.md and the template at ai-dlc/ops/build/units/_template.md, help me write a unit for…`
3. Copilot does not persist context between chat sessions. For multi-turn ceremonies like mob elaboration, keep the chat window open for the entire session or re-paste the intent file at the start of each new session.
4. Copilot is strongest at **unit execution** (generating code against ACs) and weakest at **ceremony orchestration** (mob elaboration, bolt planning). For complex ceremonies, consider using Claude.ai in the browser with the relevant files pasted in, then switching to Copilot for code generation.

**What stays the same:** all `ai-dlc/` artifacts, templates, quality gate rules, and the prompt log requirement are unchanged.

---

### Summary comparison

| Capability | Claude Code | Cursor | GitHub Copilot |
|---|---|---|---|
| Rules auto-loaded every session | Yes (`CLAUDE.md`) | Yes (`.cursorrules`) | Yes (`.github/copilot-instructions.md`) |
| Runs ceremonies autonomously | Yes | Yes | Partial — needs explicit file context |
| Persists context across sessions | Yes (memory system) | No | No |
| Config file to maintain | `CLAUDE.md` only | `CLAUDE.md` + `.cursorrules` (keep in sync) | `CLAUDE.md` + `.github/copilot-instructions.md` (keep in sync) |

---

## Common Mistakes

| Mistake | Consequence | Correct approach |
|---|---|---|
| Skipping the quality gate on a "simple" request | Simple requests produce the most hallucinated output because they lack context | Claude enforces the gate — don't try to bypass it |
| Writing units without acceptance criteria | Engineers build the wrong thing; review is impossible | No unit enters a Bolt without ACs — Claude will block this |
| Not logging prompts | The team re-learns the same lessons next Bolt | Log immediately after each session |
| Accepting AI output without reading the diff | Hallucinated methods, wrong auth, missing edge cases reach production | Read the code; run the checklist |
| Bolts that are too large | The Bolt never closes; retro never happens; improvements never land | 3–8 units max; if in doubt, cut scope |
| Edge cases discovered in production but not recorded | Same issue recurs in the next feature | Every incident triggers an edge-cases.md update |

---

## Quick Reference

| I want to… | Say to Claude |
|---|---|
| Start a new feature | "Let's write an intent for [feature]" |
| Run a mob elaboration | "Run a mob elaboration for [intent name]" |
| Plan a bolt | "Plan a bolt from the open units in the backlog" |
| Execute a unit | "Execute unit [name] from bolt [name]" |
| Check unit status | "What's the current backlog status?" |
| Review AI output | "Run the review checklist for this unit" |
| Write a retro | "Write the retro for bolt [name]" |
| Record a production incident | "Log an incident for [description]" |
| Improve a rule or guideline | "File an improvement for [what and why]" |
| Look up a domain term | [guidelines/domain-glossary.md](guidelines/domain-glossary.md) |
| Check known failure modes | [guidelines/edge-cases.md](guidelines/edge-cases.md) |
| See what Claude is told every session | [../CLAUDE.md](../CLAUDE.md) |
| Scale to a multi-engineer team | [guidelines/team-rollout.md](guidelines/team-rollout.md) |
