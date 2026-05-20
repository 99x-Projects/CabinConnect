# Unit: U-T03 — Dev environment (Docker Compose + .env templates)

**Owning artifact:** [TFD §5 Dev Environment](../../inception/tfd/TFD.md)
**Status:** Open
**Bolt:** Bolt 2 — Backend Foundation *(re-scoped 2026-05-20 from Bolt 0)*
**Dependencies:** U-T01

---

## Context

A working local stack with Postgres + Supabase emulator + API + Web — runnable from a single `docker compose up` once `.env.local` is filled. The 30-minute onboarding budget (TFD §5) is what this Unit serves.

## Acceptance Criteria

- Given a fresh clone with Docker Desktop (or equivalent) installed, when `docker compose up` runs from `platform/`, then Postgres, Supabase emulator, API, and Web dev server all start without errors.
- Given `platform/.env.example` is copied to `platform/.env.local` and the documented local values are filled, when the stack starts, then the API can connect to the Supabase emulator AND the Web can call the API.
- Given a new engineer follows the [`platform/README.md`](../../../../platform/README.md) Quickstart, when they complete it, then they reach a running stack in ≤ 30 minutes (timed by the engineer, captured in their onboarding log).
- Given `platform/.env.local` exists, when `git status` is checked, then it does not appear (git-ignored).
- Given the Docker stack is running, when `dotnet watch` is invoked in `platform/backend/`, then API hot-reload works.
- Given the Docker stack is running, when `pnpm dev` is invoked in `platform/frontend/`, then Vite HMR works.
- Given `supabase start` is invoked from `platform/data-layer/`, when the local Supabase emulator starts, then Supabase Studio is reachable at the documented localhost port.

## Scope

**In scope:**
- `platform/docker-compose.yml`
- `platform/.env.example` documenting every required environment variable by name (with placeholder values)
- `.gitignore` entries for `platform/.env.local` and `platform/.env.*.local`
- `platform/README.md` Quickstart section
- Supabase CLI bootstrap config at `platform/data-layer/supabase/config.toml`
- Documented localhost ports for each service

**Out of scope:**
- Production environment configuration (U-T06)
- Database schema and migrations (U-T05 + U-001..U-005)
- Application code

## Definition of Done

- [ ] All ACs verified
- [ ] Onboarding timed by a colleague who didn't author the Unit
- [ ] Prompt quality gate passed
- [ ] Code review complete
- [ ] No new lint or type errors
