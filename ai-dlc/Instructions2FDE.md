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

## Phase 1 — Inception

> Goal: turn a vague idea into a set of units with testable acceptance criteria.

### Step 1 — Write an Intent

An **Intent** is a one-page description of a capability you want the system to have. It is not a user story, a task, or a specification. It describes the outcome, not the solution.

1. Copy [ops/inception/intents/_template.md](ops/inception/intents/_template.md)
2. Name the file: `YYYY-MM-DD-<intent-name>.md` (e.g. `2025-07-01-cabin-search.md`)
3. Fill in: What, Why, Success Looks Like, Assumptions, Out of Scope
4. Set **Status: Draft**
5. When it is ready to elaborate: set **Status: Ready**

A good intent fits on one page. If you are writing more than that, you have two intents.

### Step 2 — Run a Mob Elaboration Session

A **Mob Elaboration** is a 45–90 minute session where the team (2–4 people + AI) breaks an intent into independently buildable units.

**Before the session:**
- Intent is in `Ready` status
- Everyone has read the intent
- Facilitator has [skills/mob-elab-prompts.md](skills/mob-elab-prompts.md) open

**During the session:**

1. Read the intent aloud. Confirm what success looks like.
2. Paste **Prompt 1** (Feature Decomposition) from [skills/mob-elab-prompts.md](skills/mob-elab-prompts.md) into Claude. Fill in the feature name and description from the intent.
3. Review the AI's proposed units as a team. Challenge each one:
   - Can it be built and deployed independently?
   - Does it have a testable outcome?
   - Is it the right size? (1–3 days of work; 2–5 acceptance criteria)
4. For each unit that survives, paste **Prompt 2** (Acceptance Criteria) to generate Given/When/Then criteria.
5. Record all outputs and team decisions in a session file: copy [ops/inception/elaborations/_template.md](ops/inception/elaborations/_template.md) to `ops/inception/elaborations/<intent-slug>/YYYY-MM-DD-session-1.md`
6. Note any new edge cases discovered — add them to [guidelines/edge-cases.md](guidelines/edge-cases.md)

**Session rules:**
- One question at a time to Claude — do not batch everything into one mega-prompt
- If you disagree with the AI's output, say so explicitly and re-prompt with the correction
- If the session exceeds 90 minutes, the intent is too large — split it

### Step 3 — Extract Units

After the session, create a unit file for each extracted unit:

1. Copy [ops/build/units/_template.md](ops/build/units/_template.md)
2. Name the file: `<unit-slug>.md` in kebab-case, no date (e.g. `cabin-availability-check.md`)
3. Fill in all sections — especially Acceptance Criteria in Given/When/Then format
4. Check [guidelines/acceptance-patterns.md](guidelines/acceptance-patterns.md) if you are unsure whether your ACs are good
5. Add the unit to [ops/build/backlog.md](ops/build/backlog.md) with **Status: Open**
6. Update the Intent file's Elaboration Sessions and Extracted Units tables
7. When all units are extracted: set the Intent to **Status: Elaborated**

---

## Phase 2 — Build

> Goal: take Open units, plan them into a Bolt, build the code with AI assistance, and ship.

### Step 1 — Triage the Backlog

Before planning a Bolt, review [ops/build/backlog.md](ops/build/backlog.md):
- Are all Open units properly defined? (AC written, dependencies clear)
- Which units are blocked and why?
- What is the highest-value outcome the team can deliver next?

### Step 2 — Plan a Bolt

A **Bolt** is a batch of related units that delivers a coherent, end-to-end outcome. Think of it as a mini-sprint scoped by what the user can do, not by how long it takes.

1. Copy [ops/build/bolts/_template.md](ops/build/bolts/_template.md)
2. Name the file: `bolt-NN-<name>.md` (e.g. `bolt-01-cabin-search.md`)
3. Select 3–8 units from the backlog that deliver a coherent outcome together
4. Define the execution order — which units have dependencies on others
5. Update each selected unit's status in the backlog to **Planned**
6. Update each unit file's Bolt field

A Bolt should be completable by the team in 1–2 weeks. If the selected units would take longer, reduce scope.

### Step 3 — Execute a Unit

This is where you write code. For each unit in the active Bolt, follow this sequence exactly:

#### 3a. Confirm the unit is ready
- Acceptance criteria are written in Given/When/Then format
- Dependencies are Done or not required
- You have read [guidelines/edge-cases.md](guidelines/edge-cases.md) for relevant failure modes

#### 3b. Apply the Prompt Quality Gate

Before sending any prompt to Claude, confirm the request contains all four components:

| Component | Question to ask yourself |
|---|---|
| **Context** | Did I tell Claude what system this is and what it touches? |
| **Constraints** | Did I say what must not be changed and which rules apply? |
| **Acceptance Criteria** | Is there a testable pass/fail condition in the prompt? |
| **Output Format** | Did I say what I want back (code, scaffold, contract, test stubs)? |

If any component is missing, Claude will ask you one question at a time to fill the gap. Do not skip this — it is the main mechanism that prevents wasted AI output.

Full gate: [rules/prompt-quality-gate.md](rules/prompt-quality-gate.md)

#### 3c. Generate the output

Use the prompts in [skills/mob-elab-prompts.md](skills/mob-elab-prompts.md):

| Prompt | Use it for |
|---|---|
| Prompt 3 — API Contract | Design the endpoint shape before writing any code |
| Prompt 4 — Implementation Scaffold | Generate the .NET controller, service, repository, and test stubs |
| Prompt 5 — Review AI Output | Ask Claude to critique its own output against rules and ACs |

Work in this order: API Contract → Scaffold → Fill in TODOs → Tests → Review.

#### 3d. Log the prompt

Every AI interaction must be logged. Create or append to `prompts/YYYY-MM-DD-<feature>.md`:
- Paste the exact prompt you used
- Summarize what the AI produced
- Note the quality gate result
- List any changes you made to the AI output before accepting it

This is the audit trail. Do not skip it.

#### 3e. Run the Review Checklist

Before raising a PR, go through every item in [skills/review-checklist.md](skills/review-checklist.md). Key checks:

- Every acceptance criterion is traceable to the code
- No hallucinated API methods or type signatures
- Auth is checked on every new endpoint
- RLS policies updated if new Supabase tables are introduced
- At least one test per acceptance criterion
- Prompt log entry exists for this unit

Do not approve a PR that skips this checklist. Document any deliberate skips with a reason.

#### 3f. Close the unit

Once the PR is merged:
1. Update the unit file's Status to **Done**
2. Update the backlog
3. Update the Bolt's unit status table

### Step 4 — Close the Bolt

When all units in the Bolt are Done:
1. Run an integration test — the complete user journey the Bolt enables, end-to-end
2. Deploy to staging or preview environment
3. Get stakeholder acceptance if required
4. Update the Bolt status to **Complete**
5. Move to Operate phase

---

## Phase 3 — Operate

> Goal: learn from what was built and make the process better.

### After Every Bolt — Retrospective

Hold a retro within 48 hours of closing the Bolt. Create a file from [ops/operate/retros/_template.md](ops/operate/retros/_template.md) named `bolt-NN.md`.

Cover these specifically:
- Which prompts worked and why
- Which prompts needed revision before output was usable
- Whether the quality gate caught anything that would have merged badly
- Whether any reviewer accepted AI output without reading the diff

For every action item, file an **Improvement** (see below) before closing the retro.

### When Production Issues Occur — Incidents

Every production bug or unexpected behaviour must be recorded. Create a file from [ops/operate/incidents/_template.md](ops/operate/incidents/_template.md).

Always answer:
- Was this a known edge case that wasn't handled?
- Was it in [guidelines/edge-cases.md](guidelines/edge-cases.md) but not checked?
- Does a new edge case need to be added?

### When the Process Needs Updating — Improvements

When a retro or incident reveals that a rule, guideline, or skill needs changing:
1. Create a file from [ops/operate/improvements/_template.md](ops/operate/improvements/_template.md)
2. Quote the current text and the proposed replacement
3. Apply the change to the target file
4. Mark the improvement as Applied

This is how the process evolves. Do not skip it — unrecorded lessons repeat.

---

## The Three Non-Negotiables

These are never optional, regardless of time pressure:

### 1. The Prompt Quality Gate
Every code generation request goes through the four-component check. If a component is missing, Claude will ask for it. Do not try to bypass this by stuffing partial context into a single rushed prompt. A bad prompt produces output that costs more time to fix than it saved.

### 2. The Review Checklist
Every AI-generated diff is reviewed by a human against the checklist before merge. "It looks right" is not a review. Read the code. Run the tests. Check the edge cases.

### 3. The Prompt Log
Every AI interaction is logged in `prompts/`. If there is no log entry, there is no audit trail. This is how the team learns which prompts work, which don't, and why.

---

## Working with Claude — Practical Tips

**Be specific about what must not change.**
"Don't touch the auth layer" is more valuable than a long description of what to build. Constraints prevent scope creep.

**Paste the acceptance criteria into the prompt.**
Claude can only produce correct output if it knows what correct means. ACs in Given/When/Then format are the most reliable form of correctness signal.

**Ask for one thing at a time.**
"Generate the API contract" and "Generate the implementation" are two separate prompts. Mixing them produces worse output for both.

**When Claude produces something wrong, say why.**
"This is wrong because it doesn't check cabin ownership before returning booking data" is more useful than "try again." Claude uses your correction to improve the next output in the session.

**Use Prompt 5 (Review) before accepting scaffolded code.**
Ask Claude to critique its own output before you read it. It will often catch its own hallucinated methods or missed edge cases.

**Domain terms matter.**
Use the exact terms from [guidelines/domain-glossary.md](guidelines/domain-glossary.md) in every prompt. If you say "reservation" when the system calls it "Booking," Claude may generate code using inconsistent naming.

---

## Common Mistakes

| Mistake | Consequence | Correct approach |
|---|---|---|
| Skipping the quality gate on a "simple" request | Simple requests produce the most hallucinated output because they lack context | Run the gate every time |
| Writing units without acceptance criteria | Engineers build the wrong thing; review is impossible | No unit enters a Bolt without ACs |
| Not logging prompts | The team re-learns the same lessons next Bolt | Log immediately after each session |
| Accepting AI output without reading the diff | Hallucinated methods, wrong auth, missing edge cases reach production | Read the code; run the checklist |
| Bolts that are too large | The Bolt never closes; retro never happens; improvements never land | 3–8 units max; if in doubt, cut scope |
| Edge cases discovered in production but not recorded | Same issue recurs in the next feature | Every incident triggers an edge-cases.md update |

---

## Quick Reference

| I want to... | Go here |
|---|---|
| Start a new feature | [ops/inception/intents/_template.md](ops/inception/intents/_template.md) |
| Run a mob elaboration | [skills/mob-elab-prompts.md](skills/mob-elab-prompts.md) |
| Record an elaboration session | [ops/inception/elaborations/_template.md](ops/inception/elaborations/_template.md) |
| Write a unit | [ops/build/units/_template.md](ops/build/units/_template.md) |
| See all unit status | [ops/build/backlog.md](ops/build/backlog.md) |
| Plan a bolt | [ops/build/bolts/_template.md](ops/build/bolts/_template.md) |
| Check the prompt quality gate | [rules/prompt-quality-gate.md](rules/prompt-quality-gate.md) |
| Review AI output before merging | [skills/review-checklist.md](skills/review-checklist.md) |
| Look up a domain term | [guidelines/domain-glossary.md](guidelines/domain-glossary.md) |
| Check known failure modes | [guidelines/edge-cases.md](guidelines/edge-cases.md) |
| Write a retro | [ops/operate/retros/_template.md](ops/operate/retros/_template.md) |
| Record a production incident | [ops/operate/incidents/_template.md](ops/operate/incidents/_template.md) |
| Improve a rule or guideline | [ops/operate/improvements/_template.md](ops/operate/improvements/_template.md) |
| See what Claude is told every session | [../CLAUDE.md](../CLAUDE.md) |
