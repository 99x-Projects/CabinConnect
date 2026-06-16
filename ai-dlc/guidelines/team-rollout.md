# Team Rollout — Scaling AI-DLC to Multiple FDEs

This guide covers everything a team needs before the first multi-engineer Bolt, how to run that Bolt smoothly, and what a team leader must watch for along the way.

---

## Pre-Requisites

Before a team of FDEs starts working in parallel, these must be in place:

### 1. Git branching convention

Every unit gets its own branch: `unit/<unit-slug>` (e.g. `unit/ui-summer-color-palette`).

- No engineer works on `main` directly
- PRs merge unit branches into `main` (or a Bolt integration branch if needed)
- Branch names match the unit file name in `ai-dlc/ops/build/units/` — this makes it trivial to trace a PR back to its acceptance criteria

### 2. Environment isolation

Each engineer runs their own local stack:
- `.env.local` is never committed — every engineer sets up their own (see `Instructions2FDE.md`)
- Supabase can be shared (cloud) or run locally per engineer (`npx supabase start`) — agree before the Bolt starts
- The .NET API port must be consistent across the team (default: `http://localhost:5283`); document any override in the project README

### 3. CLAUDE.md is the single source of truth

- `CLAUDE.md` at the repo root is the behavioral contract for Claude in this project
- No engineer edits `CLAUDE.md` unilaterally — changes go through an improvement file first (`ai-dlc/ops/operate/improvements/`)
- If your team uses Cursor, keep `.cursorrules` in sync with `CLAUDE.md` — they must be identical
- If your team uses GitHub Copilot, keep `.github/copilot-instructions.md` in sync

### 4. Secrets management

Before any engineer clones the repo and starts working:
- Confirm that `appsettings.Development.json` and `.env.local` are in `.gitignore` (they are — verify before the first push)
- Share Supabase project credentials via a team password manager (1Password, Bitwarden, etc.) — never via chat, email, or a shared doc
- Each engineer who needs the Supabase service role key gets it directly from the project owner — it never appears in any committed file

### 5. Backlog ownership

One person (the team leader or a rotating backlog owner) is responsible for keeping `ai-dlc/ops/build/backlog.md` accurate at all times. Unit status transitions happen in the same PR as the code change — never as a separate commit after the fact.

### 6. AI tool alignment

Decide before the Bolt which AI tool the team uses. Mixed tooling (some on Claude Code, some on Cursor) is workable but adds friction:
- Ensure `CLAUDE.md` / `.cursorrules` / `copilot-instructions.md` are identical
- Agree on prompt log format — all logs go into `ai-dlc/prompts/YYYY-MM-DD-<feature>.md` regardless of tool

---

## Best Approach for Multi-FDE Bolts

### The unit is the parallelism unit

A Bolt is a batch of units. Units are the thing you parallelise — not tasks within a unit, not files within a unit. One engineer owns one unit at a time from start to merge.

**Why:** each unit has its own acceptance criteria, its own branch, and its own prompt log. Splitting a unit across engineers produces half-units with no clear owner and no clear done state.

### Typical Bolt rhythm

```
Day 1   Bolt planning session (whole team, ~30 min)
        → execution order agreed, units assigned, branches created

Days 2–N  Engineers execute units in parallel
          → daily 10-min sync: what's blocked, what's about to merge

Day N+1  Integration review (whole team)
          → all unit branches merged, end-to-end test run together

Day N+2  Retro (whole team, ~30 min)
          → retro file written, improvements filed
```

### PR checklist for every unit branch

Before raising a PR, the engineer must verify:

- [ ] All acceptance criteria from the unit file are met and traceable to the diff
- [ ] Prompt log entry exists in `ai-dlc/prompts/YYYY-MM-DD-<feature>.md` (link it in the PR description)
- [ ] Review checklist run (`ai-dlc/skills/review-checklist.md`) — Claude can do this: "Run the review checklist for this unit"
- [ ] No secrets or hardcoded environment values in the diff
- [ ] Edge cases EC-001–EC-010 checked; any that apply are handled or noted as out of scope
- [ ] Unit status updated to `Done` in `ai-dlc/ops/build/backlog.md`

### Merge conflict resolution

Merge conflicts in AI-generated code are common when two units touch the same file. Claude can resolve these directly — and does it better than a human working blind, because it can read both unit files and both prompt logs to understand *what each branch was trying to do* before composing the merged result.

**Workflow when two unit branches conflict:**

1. Merge the first branch into `main`
2. On the second branch, run `git merge main` (or rebase)
3. Hand the conflicted files to Claude:
   > "Resolve the merge conflicts in these files. Unit A's goal was [link to unit file + prompt log]. Unit B's goal was [link to unit file + prompt log]."
4. Review Claude's proposed resolution against both sets of ACs before accepting — do not merge without reading the result

**What Claude handles well:**
- "Fake conflicts" — git flagged a conflict but both changes are non-overlapping; Claude combines them cleanly
- CSS token conflicts in `index.css` — reads both unit files to understand which tokens each side needed and merges the `@theme` and `:root` blocks correctly
- Component conflicts where one side added a wrapper (e.g. `AuthenticatedLayout`) and the other side modified the wrapped content

**Where human judgment is still required:**
- Logic conflicts where both sides changed the same function to behave differently — Claude can present both options but the engineer must decide which behavior is correct
- Scope creep conflicts — if one branch quietly modified a file it was not supposed to touch, Claude may resolve the conflict correctly but won't catch that the change was out of scope; the reviewer must spot this
- Any conflict where the correct resolution depends on a product or design decision that is not in the unit files

**After any AI-resolved conflict:** re-run the quality gate check to confirm the merged output still satisfies all ACs from both units.

---

## Team Leader Guidelines

### Before the Bolt starts

- Confirm every engineer has read `Instructions2FDE.md` and can invoke a ceremony without help
- Run the mob elaboration yourself (or co-facilitate with Claude) — do not delegate elaboration to individual engineers without oversight; the quality of units determines the quality of everything downstream
- Assign units based on domain knowledge, not just availability — an engineer who doesn't understand the booking domain will produce worse ACs and worse code
- Set the Bolt's exit criteria explicitly: what does "Bolt complete" mean? (All units Done + end-to-end test + retro written is the default)

### During the Bolt

- Watch the backlog daily — a unit that stays `In Progress` for more than 2 days is blocked; find out why
- Review prompt logs as they are filed, not just the code diff — the log shows what context the AI was given; if the context was wrong, the code will be wrong in ways that aren't obvious in the diff
- If an engineer is stuck on a quality gate requirement, unblock them by helping them complete the missing component — do not tell them to skip the gate
- When two engineers raise PRs that touch the same file on the same day, merge one first and have the second engineer rebase before you review

### Reviewing AI-generated PRs

AI output looks clean and passes linting. These are the failure modes to watch for specifically:

| Failure mode | How to spot it |
|---|---|
| Hallucinated method or library | Code compiles but the method doesn't exist or does something subtly different from what the comment says — run it |
| Auth bypass | New endpoint added without `[Authorize]` or with incorrect role check — check every new controller method |
| Missing RLS | New Supabase table accessed without a corresponding RLS policy — grep for `CreateTable` or `supabase.from(` in the diff |
| Silent scope creep | AI added "helpful" logic beyond the ACs — verify the diff touches only what the unit required |
| Test that doesn't test | Test names match ACs but assertions are trivially true — read the assertions, not just the test names |

### Retro facilitation

The retro is the team's main feedback mechanism into the AI-DLC process. A good retro takes 30 minutes and produces at least one actionable improvement.

Ask Claude: "Write the retro for bolt [name]." Then in the retro session:
1. Review the "What Went Well" section — confirm it's accurate, add anything missed
2. Review the "What Didn't Go Well" section — for each item, ask: is this a process problem (fix it in `ai-dlc/`) or a domain problem (fix it in code)?
3. For every process problem, file an improvement: "File an improvement for [what and why]"
4. Assign an owner and target date for each improvement before the session ends

---

## Common Team Anti-Patterns

| Anti-pattern | Why it happens | How to prevent it |
|---|---|---|
| "We'll skip the retro this time, we're behind" | Time pressure | Retros compound — skipping one means the next Bolt has the same problems; timebox to 30 min |
| One engineer runs all elaborations without the team | Faster in the short term | Mob elaboration exists to surface domain knowledge from the whole team; solo elaboration produces units with blind spots |
| Prompt logs filed after merge (or not at all) | Engineers forget; feels like overhead | Make the prompt log a required field in the PR template; block merge without it |
| CLAUDE.md edited in a hotfix without an improvement file | Urgency | One unreviewed CLAUDE.md change can alter behavior across every future session; always go through an improvement |
| Units assigned to the fastest engineer every Bolt | Fastest gets faster; others stay stuck | Rotate unit assignments; pair a junior engineer with a complex unit as a learning opportunity |
| AI output accepted because "it looked right in the preview" | Trust builds up over time | The review checklist exists for this reason; code that looks right and runs right are different standards |

---

## Quick Reference

| Need | Where to look |
|---|---|
| What to build next | [ops/build/backlog.md](../ops/build/backlog.md) |
| How to invoke a ceremony | [Instructions2FDE.md](../Instructions2FDE.md) |
| Rules Claude follows | [../CLAUDE.md](../../CLAUDE.md) |
| Known failure modes | [edge-cases.md](edge-cases.md) |
| Review checklist | [../skills/review-checklist.md](../skills/review-checklist.md) |
| Improvement template | [../ops/operate/improvements/](../ops/operate/improvements/) |
