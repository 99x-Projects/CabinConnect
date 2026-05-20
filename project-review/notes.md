# AI-DLC project review — CabinConnect

**Branch:** `asithaw-aidlc-impl`
**Authors:** Asitha (FDE) + Claude (AI pair)
**Date:** 2026-05-20

---

## TL;DR

We ran an AI-DLC simulation through CabinConnect from customer brief to a demoable Bolt 1 (UI on typed mocks). Along the way we noticed a handful of places where greenfield projects and multi-person teams benefit from a bit more explicit guidance than the canonical AWS method gives. **These are suggestions, not corrections** — the existing scaffold is sound; these are practical additions a Project Champion could pilot on their next engagement.

The suggestions cluster into two themes:

- **Starting a greenfield project** — three suggestions covering the PRD, foundation-Intent clustering, and design as an explicit Inception leg.
- **Working as a team on AI-DLC** — one suggestion covering how artifacts split between git markdown and a live work-tracker (GitHub Issues / Project boards) once multiple people work in parallel.

## How to read this

- **Part 1** — Suggestions for starting a greenfield project (three).
- **Part 2** — Suggestion for team collaboration on AI-DLC (one).
- **Everything else** — concrete `main`-level additions, the diagrams, the per-artifact concurrency table, the cleanup checklist, and the final branch state — lives in [notes-appendix.md](notes-appendix.md).

---

# Part 1 — Suggestions for starting a greenfield project

Three observations from running the simulation. The canonical method covers the *normal* case (working on an existing codebase). Greenfield-from-zero has its own shape, and these three notes are where we found the explicit gaps.

## Suggestion 1 — Write a PRD before extracting Intents

The customer brief (usually a thin `docs/solution/Requirements.md`) is rarely rich enough to ground a Mob Elaboration session — personas are missing, NFRs are unmeasured, and the relationship between modules is unstated. Sit a **Product Requirements Document (PRD)** between the brief and the Intent files. Lives at `ai-dlc/ops/inception/prd/PRD.md`.

A workable PRD covers:

- **PRFAQ-style summary** — Amazon "working backwards" framing (one-paragraph press release + 4–6 FAQ items)
- **Customer context** — who, where, business model
- **Personas** — 3–5 named users with goals and frustrations
- **Discovery** — domain notes, competitor analysis, key insights distilled into a short list
- **Problem statement** — the gap being filled, one paragraph
- **Goals and non-goals** — explicit, so scope debates have a reference
- **Product scope** — every requirement attributed to source (`[Customer brief: …]` / `[Discovery insight: …]` / `[Simulated customer approval]`)
- **Non-Functional Requirements with *measurable thresholds*** (p95 latency, uptime, cost-per-tenant envelope — not just "must be fast")
- **Risks and mitigations**
- **Measurement criteria** — how we'll know it worked
- **Candidate Intents** — the bridge into AI-DLC; each one a future Intent file
- **Out of scope and open questions**

See our [PRD.md](../ai-dlc/ops/inception/prd/PRD.md) for a worked example.

## Suggestion 2 — Cluster elaboration for tightly-coupled Intents

The default of "one Intent → one Mob Elaboration session" works well once a platform is in place. In greenfield, foundational Intents tend to be bidirectional (auth ↔ data isolation ↔ caching ↔ locale) — running their sessions in isolation can lead to premature decisions in the first session that the second has to honour blindly or rework.

A small adaptation helps: **one Mob Elaboration session can cover multiple tightly-coupled Intents.** Intent files stay singular; the session file lives under a cluster slug (`elaborations/foundation/…`); each Intent's *Elaboration Sessions* table links to the shared session.

> **Decision rule:** Greenfield first wave → cluster. Mature system → single Intent per session. New cross-cutting concern later (multi-tenancy retrofit, new compliance regime) → cluster again.

## Suggestion 3 — Treat design as a peer Inception artifact

Canonical AI-DLC documents *what* to build (PRD, per Suggestion 1) and how to build it technically (implicitly through team practice). It is less explicit about *how the product looks and feels.* In our simulation this gap was noticeable enough to suggest a parallel artifact — a **Design Foundation Document (DFD)** — alongside its own review ritual, the **Design Foundation Review (DFR)**, owned by the designer.

The DFD captures cross-cutting visual decisions — palette, typography, component library choice, accessibility target, brand voice. The DFR is where the team agrees these *before* any UI Bolt commits to ad-hoc choices.

See our [DFD.md](../ai-dlc/ops/inception/dfd/DFD.md) for a worked example.

---

# Part 2 — Suggestion for team collaboration on AI-DLC

This applies once you're working in a team of 3 or more. Solo mode doesn't need it — but as soon as multiple people work in parallel, the way we kept everything in markdown files will create merge conflicts and serialisation bottlenecks.

## Suggestion 4 — Separate definitions from work state

In a team setup, AI-DLC artifacts split into two categories with very different concurrency profiles:

- **Definitions** (specifications, captured moments, decisions) — **markdown in git**. Durable, signed by commits, edited via PR. Reviewed at the same cadence as code.
- **Work state** (current status, assignee, in-flight notes, ordering) — **GitHub Issues + Project boards**. Concurrent-edit safe, real-time visible, low-friction status changes.

The Unit *file* is the contract; the Unit *Issue* is the execution. `backlog.md` is a solo-only artifact — in team mode it's a Project board view of the Unit Issues. The Bolt *file* is the plan; the Bolt *Milestone* is the live dashboard.

### When does the Unit file get mirrored to a GitHub Issue?

This is the question that determines whether the pattern is usable day-to-day.

| Step | What happens |
|---|---|
| **Trigger** | When a Unit moves from `Open` (in the backlog) to `Planned` (selected for a Bolt). *Not* at Unit creation — open Units may still be Deferred or split. |
| **Who creates the Issue** | The AI agent — given `gh` CLI / GitHub MCP access — runs `gh issue create` with a templated body. Falls back to manual creation by the Bolt lead if no agent access. Either way, the Issue is created *as part of opening the Bolt*, not later. |
| **What the Issue carries** | A link to the canonical Unit file, the owning Intent (CI-NN), the Bolt label, the assignee, the live status. **The contract — ACs, scope, dependencies, DoD — stays in the file only**, never duplicated. |
| **During execution** | Issue carries the noisy stuff: status changes, assignment, daily-progress comments, blockers, PR links. None of this touches the Unit file. |
| **Closure** | Issue closes when the Unit's DoD is verified. The same PR that closes the Issue (`Closes #42`) also flips the Unit file's `Status:` line to `Done`. One PR, one decision, one signed commit. |

> **The discipline that makes the hybrid work:** decisions land in the file; comments stay in the Issue. When a comment thread surfaces a decision (a refined AC, a new dependency, a deferred sub-task), the Project Champion is responsible for writing it into the file via PR *before* the Issue closes.

### Is the CabinConnect repo team-collab-ready?

It's a GitHub repo — Issues + Projects + Milestones are available by default. To make the file ↔ Issue pattern concrete, the repo benefits from a small `.github/` configuration:

- **`.github/ISSUE_TEMPLATE/unit.md`** — Unit Issue template. *Added on this branch as a worked example.*
- **A GitHub Project board** with columns matching the Unit status lifecycle (`Planned` / `In Progress` / `Awaiting Review` / `Done`) — configured in the GitHub UI, not committed to the repo.
- **A Milestone per Bolt** — so each Bolt's dashboard aggregates its Unit Issues.

A per-artifact split table and a diagram are in [notes-appendix.md](notes-appendix.md).

---

For concrete additions to `main`, simulation boundaries, diagrams, the cleanup checklist, and the final branch state → see [notes-appendix.md](notes-appendix.md).
