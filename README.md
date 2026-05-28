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

## Running Locally

Full setup checklist: [ai-dlc/guidelines/dev-setup.md](ai-dlc/guidelines/dev-setup.md). Quick start once your secrets are in place:

### 1. Prerequisites

- .NET 8 SDK
- Node 20+
- PostgreSQL access via Supabase (cloud project credentials or local `npx supabase start`)

### 2. Configure secrets (never commit)

- `src/backend/CabinConnect.Api/appsettings.Development.json`
  - `ConnectionStrings:Default` — Supabase Postgres
  - `Supabase:Url`, `Supabase:AnonKey`, `Supabase:ServiceRoleKey`
  - `Cors:AllowedOrigins` — must include the Vite dev origins you actually use, e.g. `http://localhost:5173`, `http://localhost:5174`, `http://localhost:5175`
  - `FeatureFlags:cabin_profile_mvp` — set to `true` to enable the MyCabin profile/operational pages
- `src/frontend/.env.local`
  ```
  VITE_API_BASE_URL=http://localhost:5000
  VITE_SUPABASE_URL=https://<project>.supabase.co
  VITE_SUPABASE_ANON_KEY=<anon key>
  VITE_FF_CABIN_PROFILE_MVP=true
  ```
  > The flag is parsed as the exact lowercase string `true`. Anything else disables the feature.

### 3. Apply database migrations

```powershell
# Local Supabase
npx supabase db reset
# or against an existing DB
npx supabase migration up
```

Migration manifest and verification helper: [docs/migrations.md](docs/migrations.md), [scripts/check-migrations.ps1](scripts/check-migrations.ps1).

### 4. Run the API and the web app

```powershell
# Terminal 1 — API (listens on http://localhost:5000)
dotnet run --project src/backend/CabinConnect.Api

# Terminal 2 — Frontend (Vite picks the next free port from 5173)
cd src/frontend
npm install
npm run dev
```

Then open the port Vite reports (commonly `http://localhost:5173`). If Vite falls back to `5174`/`5175`, make sure that origin is listed in `Cors:AllowedOrigins`.

### 5. Verify the stack

- `GET http://localhost:5000/health` returns `200`.
- Sign in via the web app, open **My Cabin**. With `cabin_profile_mvp` enabled you should see three dashboard buttons:
  - **Register your cabin** — enabled only when you have no cabin yet.
  - **Edit cabin details** / **Operational details** — enabled only after a cabin is registered.
- Registering a cabin posts a snake_case payload (`community_id`, `amenities`, …) to `POST /api/cabins`. The community dropdown shows only `active` communities; the **Register Cabin** button stays disabled until all required fields are filled.

### 6. Tests and build

```powershell
# Backend
dotnet test src/backend/CabinConnect.sln

# Frontend (Vitest + Testing Library)
cd src/frontend
npm run test -- --run
npm run lint
npm run build
```

### Troubleshooting

| Symptom | Likely cause / fix |
|---|---|
| `Cabin profile is currently disabled in this environment` | `VITE_FF_CABIN_PROFILE_MVP` is not exactly `true`, or the dev server was started before `.env.local` was updated — restart `npm run dev`. |
| `Failed to fetch` on `/my-cabin` | The Vite origin is not in `Cors:AllowedOrigins`. Add the port Vite is actually using and restart the API. |
| `Community id is required.` on registration | Stale frontend bundle — hard reload. The client now sends snake_case (`community_id`). |
| Port 5000 already in use | Stop the previous API process: `Get-NetTCPConnection -LocalPort 5000 \| Select-Object -Expand OwningProcess \| ForEach-Object { Stop-Process -Id $_ -Force }`. |

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
| [ai-dlc/guidelines/dev-setup.md](ai-dlc/guidelines/dev-setup.md) | Developer environment setup checklist |
