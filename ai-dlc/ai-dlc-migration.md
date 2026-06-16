# AI-DLC Migration Guide

This document explains how to replicate the AI-DLC framework in a new repository. Everything here is generic — substitute your project's technology stack, domain terms, and rules where indicated.

---

## What You Are Building

AI-DLC is a structured operating system for building software with AI assistance. It is not a tool — it is a set of files, conventions, and ceremonies that govern how your team and your AI work together. The output is a repo where:

- Every feature starts with a written intent and testable acceptance criteria
- Every AI interaction is gated by a quality check and logged for audit
- Every failure feeds back into rules that prevent recurrence
- Any engineer (or AI tool) opening the repo knows exactly how to work in it

---

## Step 1 — Create the Folder Structure

Create this directory tree at the root of your repository:

```
ai-dlc/
  Instructions2FDE.md        ← main guide for engineers
  README.md                  ← how the process achieves quality
  rules/
    prompt-quality-gate.md   ← the 4-component gate run before every code generation
    code-standards.md        ← language/framework conventions and anti-patterns
    security.md              ← never/always security rules
    architecture.md          ← ADRs — decisions and their rationale
  skills/
    mob-elab-prompts.md      ← interactive protocol and prompts for elaboration sessions
    review-checklist.md      ← structured lens for reviewing AI output
    unit-template.md         ← how to write a unit (reference doc)
  guidelines/
    domain-glossary.md       ← canonical business terms used in code and prompts
    edge-cases.md            ← known failure modes to check before generating code
    acceptance-patterns.md   ← rules and anti-patterns for writing ACs
    dev-setup.md             ← environment setup checklist for new engineers
    team-rollout.md          ← scaling to multiple engineers
  prompts/                   ← one file per feature; every AI session logged here
  ops/
    inception/
      intents/               ← one file per feature intent
        _template.md
        README.md
      elaborations/          ← one folder per intent; one file per session
        _template.md
    build/
      backlog.md             ← master status of all units
      units/                 ← one file per atomic unit of work
        _template.md
      bolts/                 ← one file per planned batch of units
        _template.md
    operate/
      retros/                ← one file per completed bolt
        _template.md
      incidents/             ← one file per production issue
        _template.md
      improvements/          ← one file per process change triggered by retro/incident
        _template.md
```

---

## Step 2 — Write CLAUDE.md (The Behavioral Contract)

`CLAUDE.md` lives at the **repo root** (not inside `ai-dlc/`). It is loaded automatically by Claude Code every session. Every section below is required.

### Section 1 — Project Identity

State what the system is and its technology stack. Be specific — the AI needs to know:
- What the product does (one sentence)
- Backend language/framework and key patterns
- Frontend language/framework
- Database and auth approach
- **System boundaries** — what calls what; what must never happen (e.g. "frontend never calls the database directly")

```markdown
## 1. Project Identity

**<ProjectName>** is a <one-sentence description>.
- Backend: <language/framework, key patterns>
- Frontend: <language/framework>
- Database: <database, auth approach>

**System boundaries:**
- <boundary rule 1>
- <boundary rule 2>
```

### Section 2 — Prompt Quality Gate

This section tells the AI to enforce the four-component check before every code response. Copy this block verbatim and add a link to `ai-dlc/rules/prompt-quality-gate.md`:

```markdown
## 2. Prompt Quality Gate — Run This Before Every Code Response

Before writing, generating, or modifying any code, check that the request contains all four components:

| Component | What it requires |
|---|---|
| **Context** | Who is asking, what system or feature this touches |
| **Constraints** | What must not be done; which rules apply |
| **Acceptance Criteria** | A testable pass/fail condition (Given/When/Then) |
| **Output Format** | What the response should look like |

**If any component is missing:** do not generate code. Ask one question at a time in this order: Acceptance Criteria → Context → Constraints → Output Format.

**When all four are present:** generate the output and open the response with:
**Context:** <one line>
**Constraints:** <one line>
**Acceptance Criteria:** <one line>
**Output Format:** <one line>

Full gate definition: [ai-dlc/rules/prompt-quality-gate.md](ai-dlc/rules/prompt-quality-gate.md)
```

### Section 3 — Code Rules

Three subsections:

**Never do these** — absolute prohibitions for your stack. Common examples:
- Commit secrets, API keys, or connection strings
- Trust client-supplied IDs without server-side ownership verification
- Expose internal stack traces to the client
- Use raw SQL string concatenation
- *(Add stack-specific rules — e.g. no `.Result`/`.Wait()` in async .NET, no `any` in TypeScript)*

**Always do these** — mandatory patterns for your stack. Common examples:
- Validate and sanitize all input at the API boundary
- Authenticate every endpoint — explicitly mark public routes
- *(Add domain-specific rules — e.g. how prices are stored, how dates are handled)*

**Naming conventions** — per language/framework. Be explicit about file naming, type naming, variable naming, and database naming.

Link to `ai-dlc/rules/code-standards.md`, `ai-dlc/rules/security.md`, and `ai-dlc/rules/architecture.md`.

### Section 4 — Domain Language

List every business term the team uses with its exact definition. This is the most important section for preventing logic errors — if the AI uses "Order" when your domain uses "Booking," the output will be subtly wrong throughout.

```markdown
| Term | Meaning |
|---|---|
| **<Term>** | <precise definition> |
```

Link to `ai-dlc/guidelines/domain-glossary.md` for the full glossary.

### Section 5 — Known Edge Cases

Table of known failure modes the AI must check before generating code. Start with the ones relevant to your domain. Format:

```markdown
| ID | Scenario | Required behavior |
|---|---|---|
| EC-001 | <scenario> | <what the code must do> |
```

Add edge cases here as they are discovered in retros and incidents. Link to `ai-dlc/guidelines/edge-cases.md`.

### Section 6 — AI-DLC Workflow

This section tells the AI the artifact hierarchy and the mob elaboration protocol. Copy the mob elaboration turn structure verbatim — it is what prevents the AI from dumping all units at once instead of running a proper conversation:

```markdown
**Turn structure — strictly one unit per turn:**
1. Propose a single candidate unit (name + one-sentence purpose only). Stop and wait.
2. Once confirmed, propose ACs as a numbered list. Stop and wait.
3. Once ACs are agreed, surface edge cases and open questions. Stop and wait.
4. Move to next unit. Repeat.
5. After all units agreed, present summary table and ask for final sign-off before writing any files.
```

Include the artifact table (what lives where) and the "never do these during elaboration" rules.

### Section 7 — Review Behavior

A short checklist the AI runs before presenting any output. Minimum items:
- Every AC is traceable to the code
- No hallucinated APIs or library methods
- Known edge cases checked
- No secrets or hardcoded environment values
- Auth checked on every new endpoint
- Tests exist for each AC

Link to `ai-dlc/skills/review-checklist.md` for the full checklist.

### Section 8 — Reference Map

A table mapping common needs to their files. Engineers and the AI both use this to navigate the framework.

---

## Step 3 — Write the Rules Files

### `rules/prompt-quality-gate.md`

Defines the four components in detail with examples of complete and incomplete requests. Include:
- What each component means
- The order to ask for missing components
- An example of an incomplete request and the correct response
- An example of a complete request

### `rules/code-standards.md`

Document your stack's patterns and anti-patterns. Key sections:
- Languages & runtimes
- Naming conventions (per language)
- Framework patterns (backend and frontend)
- Formatting & linting tooling
- Testing requirements and coverage thresholds

**Critically:** add anti-patterns discovered through actual failures — e.g. framework methods that look correct but have unit-testing limitations. These turn retro findings into permanent rules.

### `rules/security.md`

Two sections:
- **Never do these** — injection, auth gaps, secrets, data exposure
- **Always do these** — input validation, auth on every endpoint, least privilege

Add a section for your specific platform's security quirks (e.g. Supabase RLS, AWS IAM patterns, OAuth flows).

### `rules/architecture.md`

One ADR per significant decision. Format:

```markdown
### ADR-001 — <Decision title>
**Decision:** <what was decided>
**Why:** <the reasoning>
**Trade-off:** <what you gave up>
```

Add an ADR whenever a new cross-cutting decision is made — especially ones where the AI might make a different choice if not told (e.g. symmetric vs asymmetric JWT signing, SSR vs SPA, monorepo vs polyrepo).

---

## Step 4 — Write the Skills Files

### `skills/mob-elab-prompts.md`

The mob elaboration reference. Must include:
- The mandatory interactive protocol (turn structure + never-do rules)
- Facilitation prompts for: opening a session, proposing ACs, edge case check, generating API contract, generating implementation scaffold, reviewing output

### `skills/review-checklist.md`

Structured review sections covering all five AI failure modes:

| Section | Failure mode covered |
|---|---|
| Functional Correctness | Logic errors that look correct |
| Code Quality | Over-engineering; dead code |
| Security | Security vulnerabilities |
| Architecture | Architectural drift |
| Tests | Logic errors; hallucinations |
| AI-Specific Checks | Hallucinated library calls; prompt log; scope creep |
| Deployment Readiness | Configuration errors; breaking changes |

Key items that must be present:
- Feature verified in a real environment — tests passing alone is not sufficient
- Nothing in the diff beyond what the ACs required (no extra abstractions or future-proofing)
- Diff checked against system boundaries in `architecture.md`
- Behavioral trade-offs confirmed before accepting output
- For wrapper/layout components: existing files grepped for patterns the new component will duplicate before generation

---

## Step 5 — Write the Guidelines Files

### `guidelines/domain-glossary.md`

Full definitions for every domain term. Each entry: term, definition, usage notes, and related terms. The glossary in `CLAUDE.md` is a summary — this file is the authoritative source.

### `guidelines/edge-cases.md`

Full descriptions of each known edge case: the scenario, the required behavior, and which parts of the system must handle it. Start with the ones most relevant to your domain. Add entries from retros and incidents.

### `guidelines/acceptance-patterns.md`

Rules for writing good Given/When/Then ACs:
- One behavior per criterion (no compound ACs)
- Name the actor in every Given
- Cover at least one unhappy path per unit
- No implementation details in ACs
- Anti-patterns to avoid (vague outcomes, testing implementation not behavior)


### `guidelines/dev-setup.md`

Step-by-step environment setup for a new engineer:
- All prerequisites with version checks
- Configuration files needed and what goes in them (no actual secrets — explain how to get them)
- How to start each service
- Auth verification steps
- Secrets hygiene checklist

### `guidelines/team-rollout.md`

Covers: git branching conventions, environment isolation, secrets management, backlog ownership, multi-FDE Bolt rhythm, PR checklist, merge conflict resolution (including AI-assisted resolution), team leader review guidelines, and common anti-patterns.

---

## Step 6 — Write the Ops Templates

Each template file defines the structure for its artifact type. The key templates:

### `ops/inception/intents/_template.md`
Fields: Status, Date, Owner, What, Why, Success Looks Like, Assumptions, Open Questions, Out of Scope, Elaboration Sessions, Extracted Units.

### `ops/build/units/_template.md`
Fields: Status, Intent link, Elaboration link, Bolt link, Priority, Context, Acceptance Criteria, Scope (in/out), Dependencies, Pre-generation Checks, Edge Cases to Handle, Definition of Done, Prompt Log link, Notes.

The **Pre-generation Checks** section is critical for wrapper/layout units — list grep patterns to run across existing files before generating to surface duplication.

### `ops/build/bolts/_template.md`
Fields: Status, Goal, Start/Target/Completed dates, Units table, Execution Order diagram, Risks & Assumptions, Definition of Done, Retrospective link.

### `ops/operate/retros/_template.md`
Sections: What Went Well, What Didn't Go Well, AI-Specific Observations (prompts that worked / needed revision / quality gate failures / output accepted without enough review), Actions table, Improvements Triggered (**required** — cannot be left blank without a stated reason), New Intents Triggered.

### `ops/operate/improvements/_template.md`
Fields: Triggered by (retro/incident link), Target file, Current text, Proposed replacement, Reason, Status, Applied date.

---

## Step 7 — Write Instructions2FDE.md

This is the main onboarding document for every engineer. Sections:
1. What AI-DLC is (the loop diagram: Inception → Build → Operate → Improvements)
2. How to invoke each ceremony by talking to the AI (not by following manual steps)
3. What the engineer still owns (review, AC confirmation, running tests, edge case checks)
4. Phase 1 — Inception (how intents and mob elaboration work)
5. Phase 2 — Build (bolts, unit execution order, review before merge)
6. Phase 3 — Operate (retros, incidents, improvements)
7. The Three Non-Negotiables (quality gate, review checklist, prompt log)
8. Using a different AI tool (Cursor → `.cursorrules`; GitHub Copilot → `.github/copilot-instructions.md`)
9. Common mistakes table
10. Quick reference table (ceremony → what to say to the AI)

---

## Step 8 — Mirror CLAUDE.md for Other AI Tools

Once `CLAUDE.md` is stable, create tool-specific copies:

**Cursor:**
```bash
cp CLAUDE.md .cursorrules
```
Then change line: "This file governs how **Cursor** operates in this project."

**GitHub Copilot:**
```bash
mkdir -p .github
cp CLAUDE.md .github/copilot-instructions.md
```
Then change line: "This file governs how **GitHub Copilot** operates in this project."
Also update all relative links from `ai-dlc/` to `../ai-dlc/` since the file lives inside `.github/`.

**Sync rule:** whenever `CLAUDE.md` is updated, update both mirror files. This is a team discipline, not automated — add it to the PR checklist.

---

## Step 9 — Initialize the Backlog and First Intent

1. Create `ops/build/backlog.md` with empty Open / Planned / In Progress / Done / Blocked / Deferred sections
2. Identify the first capability to build and write an intent: `ops/inception/intents/YYYY-MM-DD-<slug>.md`
3. Say to Claude: "Run a mob elaboration for the [intent name] intent"
4. After sign-off, Claude creates unit files and updates the backlog
5. Say: "Plan a bolt from the open units in the backlog"
6. Say: "Execute unit [name] from bolt [name]"

---

## What Makes This Work

The quality of the framework depends entirely on two things:

**1. The specificity of CLAUDE.md.** Generic rules produce generic output. The more your `CLAUDE.md` encodes your actual domain language, your actual architectural decisions, and your actual learned anti-patterns, the better every AI interaction will be. A `CLAUDE.md` written on day one will be much weaker than one shaped by three bolts of retros.

**2. The discipline of the retro loop.** The retro is the compiler for the process. Every failure that is not encoded into a rule will recur. Every retro that produces no improvement file means the next bolt starts from the same baseline. Run the retro after every bolt, file the improvements, and the framework compounds.

---

## Checklist: Ready to Start

- [ ] Folder structure created
- [ ] `CLAUDE.md` written with all 8 sections
- [ ] `rules/` files written (quality-gate, code-standards, security, architecture)
- [ ] `skills/` files written (mob-elab-prompts, review-checklist)
- [ ] `guidelines/` files written (domain-glossary, edge-cases, acceptance-patterns, dev-setup)
- [ ] Ops templates written (intent, unit, bolt, retro, incident, improvement)
- [ ] `Instructions2FDE.md` written
- [ ] `ai-dlc/README.md` written
- [ ] `.cursorrules` created (if using Cursor)
- [ ] `.github/copilot-instructions.md` created (if using GitHub Copilot)
- [ ] First intent written and ready for mob elaboration
