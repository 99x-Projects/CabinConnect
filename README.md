# CabinConnect

CabinConnect is a digital community platform for cabin owners, local businesses, and neighbors in Norwegian mountain resorts. It brings together four core capabilities — cabin management, local events, grocery ordering, and tool sharing — into one lightweight, cloud-hosted app built for sustainable and social cabin life.

The project is being built by 99x using the AI-Driven Development Lifecycle (AI-DLC).

---

## The Product

| Module | What it does |
|---|---|
| **MyCabin** | Cabin owners store, track, and share everything about their cabin — maintenance, costs, visitor instructions |
| **Events** | Administrators and residents publish and manage local community events |
| **Groceries** | Cabin owners order groceries for pickup or volunteer-delivered doorstep delivery |
| **ToolShare** | Community sharing economy for tools and equipment — lend, borrow, or rent locally |

Full requirements: [docs/solution/Requirements.md](docs/solution/Requirements.md)

---

## Tech Stack

- **Backend:** C# / .NET 8 Web API
- **Frontend:** React 18 + TypeScript
- **Database & Auth:** Supabase (PostgreSQL with RLS)
- **Hosting:** Shared cloud infrastructure

---

## How We Build

This project follows the AI-DLC process. Work is structured as Intents → Units → Bolts across three phases: Inception, Build, and Operate.

| Document | Purpose |
|---|---|
| [ai-dlc/Instructions2FDE.md](ai-dlc/Instructions2FDE.md) | Main guide — how to work in this project using AI-DLC |
| [ai-dlc/README.md](ai-dlc/README.md) | Artifact lifecycle overview |
| [ai-dlc/ops/build/backlog.md](ai-dlc/ops/build/backlog.md) | Live status of all units |
| [CLAUDE.md](CLAUDE.md) | Rules loaded by Claude at the start of every session |

---

## Key References

| Document | Purpose |
|---|---|
| [ai-dlc/guidelines/domain-glossary.md](ai-dlc/guidelines/domain-glossary.md) | Canonical business terms used in code and prompts |
| [ai-dlc/guidelines/edge-cases.md](ai-dlc/guidelines/edge-cases.md) | Known failure modes to check before generating code |
| [ai-dlc/rules/prompt-quality-gate.md](ai-dlc/rules/prompt-quality-gate.md) | The four-component check run before every AI code generation |
| [ai-dlc/rules/architecture.md](ai-dlc/rules/architecture.md) | Architecture decisions and their rationale |
| [ai-dlc/rules/code-standards.md](ai-dlc/rules/code-standards.md) | Naming conventions, patterns, and testing standards |
| [ai-dlc/rules/security.md](ai-dlc/rules/security.md) | Security rules — never/always |
| [ai-dlc/guidelines/team-rollout.md](ai-dlc/guidelines/team-rollout.md) | Pre-requisites and guidelines for multi-engineer teams |
