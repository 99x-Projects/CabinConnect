# Developer Setup Checklist

Run through this before starting your first Bolt or after cloning the repo on a new machine. Each section must pass before you move to the next.

---

## 1. Backend — .NET API

- [ ] .NET 8 SDK installed: `dotnet --version` → must be 8.x
- [ ] Restore packages: `dotnet restore src/backend/CabinConnect.sln`
- [ ] `appsettings.Development.json` exists at `src/backend/CabinConnect.Api/` and is **not** committed (check `.gitignore`)
- [ ] `appsettings.Development.json` contains:
  - `ConnectionStrings.Default` — Supabase Postgres connection string (get from project owner or `npx supabase status` if running locally)
  - `Supabase.Url` — e.g. `https://<project>.supabase.co`
  - `Supabase.AnonKey` and `Supabase.ServiceRoleKey`
- [ ] API starts cleanly: `dotnet run --project src/backend/CabinConnect.Api` → watch for DB connectivity log on startup
- [ ] API is reachable at `http://localhost:5283/health` (or the port in `launchSettings.json` — confirm before setting frontend env vars)

---

## 2. Frontend — React / Vite

- [ ] Node 20+ installed: `node --version` → must be 20.x or higher
- [ ] `.env.local` exists at `src/frontend/` and is **not** committed
- [ ] `.env.local` contains:
  ```
  VITE_API_BASE_URL=http://localhost:5283      ← match the API port in launchSettings.json
  VITE_SUPABASE_URL=https://<project>.supabase.co
  VITE_SUPABASE_ANON_KEY=<anon key>
  ```
  > **Common mistake:** defaulting `VITE_API_BASE_URL` to `https://localhost:5001` (the default ASP.NET dev-cert port). Always check `launchSettings.json` for the actual port.
- [ ] Install packages: `cd src/frontend && npm install` — verify packages appear in `node_modules/` and are listed in `package.json`
- [ ] Dev server starts: `npm run dev` → no import resolution errors
- [ ] If you see a stale import error after a dependency change: `rm -rf node_modules/.vite && npm run dev`

---

## 3. Supabase — Local vs Cloud

| Mode | When to use | How to start |
|---|---|---|
| **Cloud (shared)** | Default for most development | No setup — credentials from project owner |
| **Local** | When you need to test migrations or RLS changes in isolation | `npx supabase start` — run `npx supabase status` to get local keys, then update `.env.local` and `appsettings.Development.json` |

> If using local Supabase, the JWT signing key is different from cloud — the `.NET API` and `.env.local` must both point to the local project URL (`http://127.0.0.1:54321`).

---

## 4. Auth Verification

- [ ] Sign in via the frontend with a test account → dashboard loads (not a redirect loop back to login)
- [ ] A cabin list request succeeds in the browser network tab with HTTP 200 (not 401)
- [ ] Confirm the API log does not show JWT errors on the first authenticated request

> **If you see 401 with JWT errors:** verify `Supabase.Url` in `appsettings.Development.json` matches the Supabase project you authenticated against. The `.NET API` uses `{Supabase.Url}/auth/v1` as the JWKS authority — a mismatched URL means the token was issued by a different project.

---

## 5. Secrets Hygiene

- [ ] Run `git status` — confirm `appsettings.Development.json` and `.env.local` do not appear in the output
- [ ] Run `git diff --cached` before every commit — confirm no credentials are staged
- [ ] Never share Supabase keys via chat, email, or a shared doc — use the team password manager

---

## Quick Reference

| Need | Command |
|---|---|
| Get local Supabase credentials | `npx supabase status` |
| Start the API | `dotnet run --project src/backend/CabinConnect.Api` |
| Start the frontend | `cd src/frontend && npm run dev` |
| Clear Vite cache | `rm -rf src/frontend/node_modules/.vite` |
| Run backend tests | `dotnet test src/backend/CabinConnect.sln` |
| Run frontend lint | `cd src/frontend && npm run lint` |
