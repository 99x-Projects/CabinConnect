# platform — CabinConnect monorepo

The CabinConnect product code. This is the engineer-facing root. AI-DLC process artifacts live in the sibling [`../ai-dlc/`](../ai-dlc/) folder.

**Current state: Bolt 1 — UI Foundation `Done`.** Bolt 2 (Backend Foundation) is `Planned` but not yet executed, so `backend/`, `data-layer/`, and `infra/` directories will appear when Bolt 2 ships.

---

## See the UI right now (≤ 1 minute)

```bash
# from the repo root:
cd platform
pnpm install              # ~30s — fetches React, Vite, Tailwind, i18next, vite-plugin-pwa
cd frontend
pnpm dev                  # Vite dev server on http://localhost:5173
```

Open <http://localhost:5173>. You'll see:

- Title **Birkebakk** in primary pine green
- Subtitle *"Hemsedal — Birkebakkvegen 42"*
- **Capacity** card showing "8 guests" *(Bokmål: "8 gjester")*
- **Amenities** card with chips: `ski-storage / sauna / wood-stove / wifi`
- Two action buttons (Edit profile / Share visitor instructions)
- A small **EN / NB** toggle in the top-right

**Click EN / NB** — text re-renders in the other locale instantly (`U-009` i18n at work).
**DevTools → Application → Manifest** — installable PWA appears (`U-007`).
**View source** — design tokens flow through Tailwind via `var(--color-primary)` (`U-D01` + `U-D02`).

The screen is rendered against **mock data** at `src/mocks/cabin-mock.ts`, typed via `../shared/src/api/cabin.ts`. When Bolt 2 ships, the mock import is replaced with a real `fetch()` — that's the entire migration.

---

## Layout (current Bolt 1 state)

```
platform/
  frontend/                ← React 18 + Vite + TypeScript strict (PWA)
    src/
      App.tsx, main.tsx              ← mounts CabinProfile via i18n + globals.css
      pages/CabinProfile.tsx         ← the demonstrable
      mocks/cabin-mock.ts            ← typed mock (Bolt 2 contract)
      components/ui/Button.tsx       ← shadcn-style sample
      design-tokens/{tokens.json, css-vars.css}
      lib/i18n.ts                    ← react-i18next bootstrap
      locales/{nb-NO,en}.json
      styles/globals.css             ← @tailwind directives + design tokens
      features/                      ← per-feature folders (empty; arrive in feature Bolts)
    public/manifest.webmanifest      ← PWA manifest
    tailwind.config.ts, vite.config.ts, tsconfig.json, components.json
    package.json
  shared/                  ← TS types shared between backend and frontend
    src/
      index.ts                       ← re-exports
      api/cabin.ts                   ← Bolt 2 contract: Cabin entity
      api/community.ts               ← Bolt 2 contracts: Community, User, branded IDs
    package.json, tsconfig.json
  .env.example             ← every env var documented (real values via .env.local, git-ignored)
  .husky/pre-commit        ← lint-staged on commit
  eslint.config.js, .prettierrc.json, lint-staged.config.js
  pnpm-workspace.yaml, package.json
  README.md (this file)
```

Per TFD §3 + ADR-003 (v2). Coming in Bolt 2: `backend/` (.NET 8 Web API), `data-layer/` (Supabase migrations + RLS helpers), `infra/` (IaC).

---

## Where things live

| You want to… | Go to |
|---|---|
| See the UI in action | `pnpm dev` from this directory; open `http://localhost:5173` |
| Modify the demonstrable screen | `frontend/src/pages/CabinProfile.tsx` |
| Add or update mock data | `frontend/src/mocks/` (typed via `shared/src/api/`) |
| Add a shared type | `shared/src/api/` — this is the Bolt 1 / Bolt 2 handoff surface |
| Modify the design system | `frontend/src/design-tokens/tokens.json` then mirror to `css-vars.css` |
| Add or update a locale string | `frontend/src/locales/{nb-NO,en}.json` (keep keys mirrored) |
| Add a UI component | `pnpm dlx shadcn add <name>` lands in `frontend/src/components/ui/` |
| Read architectural decisions | [`../ai-dlc/ops/inception/tfd/TFD.md`](../ai-dlc/ops/inception/tfd/TFD.md) |
| Read design decisions | [`../ai-dlc/ops/inception/dfd/DFD.md`](../ai-dlc/ops/inception/dfd/DFD.md) |
| See active units of work | [`../ai-dlc/ops/build/backlog.md`](../ai-dlc/ops/build/backlog.md) |
| Run lint / typecheck / tests | `pnpm <script>` from this directory |

---

## Bolt 2 full Quickstart *(after Bolt 2 ships)*

This section is a placeholder — the full local stack (backend + Supabase emulator + Docker compose) becomes available when Bolt 2 executes:

```bash
# After Bolt 2 has shipped — not yet runnable:
cd platform/backend
dotnet new sln -n CabinConnect.Api
# ...further .NET solution scaffold + Supabase local + docker compose
```

See `bolt-02-backend-foundation.md` for what's coming.

---

## Why is the product separate from `ai-dlc/`?

Because they have **different consumers and different lifecycles**:

- `platform/` is consumed by engineers and the deployment pipeline.
- `ai-dlc/` is consumed by AI-DLC practitioners and AI tools (Claude, Cursor) at session-start.

Mixing them at the root crowds both audiences. The split lives in the repo's root layout for that reason — see [`../project-review/notes.md`](../project-review/notes.md) for the broader rationale.
