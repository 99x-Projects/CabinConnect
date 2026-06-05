# AI-DLC — Engineer Guide

How to work with AI on CabinConnect. Read this before your first session.

---

## What AI-DLC Is

AI-DLC is a structured operating system for building software with AI. It is not a tool — it is a set of files, ceremonies, and rules that govern how you and the AI work together.

The loop:

```
Intent → Mob Elaboration → Unit → Bolt → Code → Retro → Improvement → (next Intent)
```

Every feature starts as a written intent with testable acceptance criteria. Every AI coding session is gated by a quality check. Every failure feeds back into rules that prevent recurrence.

---

## How to Invoke Each Ceremony

You talk to the AI. The AI reads the right files and follows the right protocol.

| What you want to do | What to say to the AI |
|---|---|
| Start a new feature | "I have a new intent: [feature name]. Let's run a mob elaboration." |
| Elaborate an existing intent | "Run a mob elaboration for the [intent slug] intent." |
| Execute a unit | "Execute unit [unit name] from bolt [bolt name]." |
| Plan a bolt | "Plan a bolt from the open units in the backlog." |
| Run a retro | "Run a retro for bolt [bolt name]." |
| File an incident | "File an incident: [brief description of what went wrong]." |
| Compact old docs | "Run compact-docs." |
| Check process health | "Run process-health." |
| Run a dependency audit | "Run dependency-audit." |
| Onboard a new engineer | "I'm a new engineer on this project." |
| Get a stakeholder update | "Generate a progress digest for the [intent] intent." |
| Run a root cause analysis | "Run a root cause analysis on [incident or improvement file]." |

---

## What the Engineer Owns

AI-DLC does not remove engineering judgment. You own:

- **AC confirmation** — you decide if the proposed acceptance criteria are correct before they are written to files
- **Edge case decisions** — you decide if a surfaced edge case needs an AC or is out of scope
- **Review** — you read the diff before merging; tests passing is not the same as the feature being correct
- **Test execution** — you run the tests and verify the feature works in the running application
- **Retro honesty** — you record what actually went wrong, not a sanitized version
- **Merge approval** — no code merges without a human engineer approving the PR

---

## Phase 1 — Inception

### Intents
An intent captures a feature need before any code is written. Create an intent file in `ai-dlc/ops/inception/intents/` using the template.

### Mob Elaboration
Say: *"Run a mob elaboration for the [intent] intent."*

The AI will:
1. Run a design session (Phase 0) to agree on API contracts, data model, and architectural patterns
2. Propose units one at a time — you confirm each one before ACs are written
3. After all units are agreed, present a summary table for your sign-off
4. After sign-off, create unit files, update the backlog, and update the dependency map

**Your role:** Confirm units, add or remove ACs, flag edge cases the AI missed, give final sign-off.

---

## Phase 2 — Build

### Bolts
A Bolt is a planned batch of units. Say: *"Plan a bolt from the open units in the backlog."*

The AI will check the dependency map, propose an execution order, and create a bolt file. Before the first unit executes, the AI runs a risk assessment (reads `ai-dlc/skills/bolt-risk-assessment.md`).

### Executing Units
Say: *"Execute unit [name] from bolt [name]."*

The AI will read the unit file, check the quality gate, generate code, and remind you to:
- Verify the feature works in the running application
- Log the prompt in `ai-dlc/prompts/YYYY-MM-DD-<feature>.md`
- Update the unit status in the backlog to Done

### Feature Flags
Any new behaviour in an **existing module** is wrapped in an environment variable flag:
- Frontend: `VITE_FF_<FEATURE>=true` in `.env.local`
- Backend: `FeatureFlags:<Feature>: true` in `appsettings.Development.json`

Document the flag name and removal condition in the unit file.

---

## Phase 3 — Operate

### Retros
Say: *"Run a retro for bolt [name]."*

The AI will guide you through what went well, what didn't, and AI-specific observations. After the retro document is complete, the AI will:
1. Propose improvement files for every finding
2. Present them for your approval
3. Apply approved improvements to the target files immediately
4. Run knowledge promotion (Step 5) before closing the retro

**Do not skip retros.** A skipped retro means the same problems recur on the next Bolt.

### Incidents
Say: *"File an incident: [description]."* The AI creates an incident file and asks for details.

After the incident is resolved, say: *"Run a root cause analysis on [incident file]."*

### Improvements
Every retro and resolved incident triggers improvement files. Improvements are applied immediately — they update the rules, skills, and guidelines that govern the next Bolt.

---

## The Three Non-Negotiables

1. **Quality gate** — every code request must have all four components (Context, Constraints, AC, Output Format). If any are missing, the AI asks. Do not work around this.

2. **Review checklist** — every output is run through `ai-dlc/skills/review-checklist.md` before it is presented to you. You still review the diff — the checklist is not a substitute for your judgment.

3. **Prompt log** — every AI-assisted code session must be logged in `ai-dlc/prompts/`. This is your audit trail. If you skip it, you lose the ability to trace why decisions were made.

---

## Using Additional AI Tools

If you use **Cursor** in addition to Claude Code, rules are in `.cursorrules` at the repo root.
If you use **GitHub Copilot**, rules are in `.github/copilot-instructions.md`.

Whenever `CLAUDE.md` is updated, the other files must be updated in the same PR.

---

## Common Mistakes

| Mistake | What happens | Fix |
|---|---|---|
| Skipping the quality gate | AI generates code without clear ACs; output may not be verifiable | Always provide all four components; let the AI ask if any are missing |
| Marking a unit Done without running the app | Tests pass but the feature doesn't work end-to-end | Run the application and test the golden path before closing the unit |
| Skipping the retro | Same problems recur; no improvement files generated | Run the retro after every Bolt, even a clean one |
| Modifying `supabase/migrations/` via AI | Risk of irreversible schema damage | Describe the migration needed; write it manually |
| Not updating mirror files after CLAUDE.md change | Other AI tools operate on outdated rules | Update `.cursorrules` and `.github/copilot-instructions.md` in the same PR |
| Accepting AI output without reading the diff | Hallucinated methods or extra scope sneaks through | Read the diff; check every file touched |

---

## Quick Reference

| Ceremony | What to say |
|---|---|
| New intent | "New intent: [name]. Let's elaborate." |
| Mob elaboration | "Run a mob elaboration for [intent]." |
| Plan a bolt | "Plan a bolt from open units in the backlog." |
| Execute a unit | "Execute unit [name] from bolt [name]." |
| Retro | "Run a retro for bolt [name]." |
| Incident | "File an incident: [description]." |
| RCA | "Run a root cause analysis on [file]." |
| Process health | "Run process-health." |
| Dependency audit | "Run dependency-audit." |
| Stakeholder update | "Progress digest for [intent]." |
| Archive old docs | "Run compact-docs." |
| New engineer onboarding | "I'm new to this project." |
