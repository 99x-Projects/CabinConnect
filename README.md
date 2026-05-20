# CabinConnect

CabinConnect is a digital community platform for cabin owners, local businesses, and neighbours in Norwegian mountain resorts. It brings together four core capabilities — cabin management, local events, grocery ordering, and tool sharing — into one lightweight, cloud-hosted app built for sustainable and social cabin life.

The project is being built by 99x using the AI-Driven Development Lifecycle (AI-DLC).

---

## Repo layout

This repository deliberately separates **process** (how we build) from **product** (what we build):

| Folder | Contains |
|---|---|
| [`platform/`](platform/) | **The product.** The CabinConnect monorepo — backend, frontend, data layer, infra, shared types. Start in [`platform/README.md`](platform/README.md). |
| [`ai-dlc/`](ai-dlc/) | **The process.** AI-DLC artifacts — Intents, Elaborations, Units, Bolts, retros, prompt logs, rules, skills, guidelines. Start in [`ai-dlc/Instructions2FDE.md`](ai-dlc/Instructions2FDE.md). |
| [`docs/`](docs/) | Customer-facing artifacts — the original requirements brief. |
| [`project-review/`](project-review/) | Review notes on the AI-DLC adoption itself (process improvements + scaffold findings). |
| [`CLAUDE.md`](CLAUDE.md) | Rules loaded by Claude at the start of every AI session. |

---

## The Product (one-line summary)

| Module | What it does |
|---|---|
| **MyCabin** | Cabin owners store, track, and share everything about their cabin — maintenance, costs, visitor instructions |
| **Events** | Administrators and residents publish and manage local community events |
| **Groceries** | Cabin owners order groceries for pickup or volunteer-delivered doorstep delivery |
| **ToolShare** | Community sharing economy for tools and equipment — lend, borrow, or rent locally |

Full requirements: [docs/solution/Requirements.md](docs/solution/Requirements.md) (customer brief) and [ai-dlc/ops/inception/prd/PRD.md](ai-dlc/ops/inception/prd/PRD.md) (enriched product spec).

---

## Starting points by role

| Who you are | Read first |
|---|---|
| Engineer setting up local dev | [`platform/README.md`](platform/README.md) (Quickstart) |
| New FDE / Project Champion onboarding | [`ai-dlc/Instructions2FDE.md`](ai-dlc/Instructions2FDE.md) |
| Architect / Tech Lead reviewing decisions | [`ai-dlc/ops/inception/tfd/TFD.md`](ai-dlc/ops/inception/tfd/TFD.md) |
| Product Owner reviewing scope | [`ai-dlc/ops/inception/prd/PRD.md`](ai-dlc/ops/inception/prd/PRD.md) |
| Engineer picking up next Unit | [`ai-dlc/ops/build/backlog.md`](ai-dlc/ops/build/backlog.md) |
| Reviewing the AI-DLC adoption itself | [`project-review/notes.md`](project-review/notes.md) |
