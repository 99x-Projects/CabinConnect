# Developer Setup Checklist

Run through this before starting your first Bolt or after cloning the repo on a new machine. Each section must pass before you move to the next.

---

## 1. Backend — .NET API

- [ ] .NET 10 SDK installed: `dotnet --version` → must be 10.x
- [ ] Restore packages: `dotnet restore CabinConnect.slnx`
- [ ] `appsettings.Development.json` exists at `src/CabinConnect.Api/` and is **not** committed (check `.gitignore`)
- [ ] `appsettings.Development.json` contains the following keys — see the format notes below before copying from the Supabase dashboard:

```json
{
  "Cors": {
    "AllowedOrigins": [ "http://localhost:5173" ]
  },
  "ConnectionStrings": {
    "CabinConnectDb": "Host=<pooler-host>;Port=5432;Database=postgres;Username=postgres.<project-ref>;Password=<your-password>;Ssl Mode=Require"
  },
  "Supabase": {
    "Url": "https://<project-ref>.supabase.co",
    "JwtAuthority": "https://<project-ref>.supabase.co/auth/v1",
    "JwtAudience": "authenticated"
  }
}
```

### Connection string — IMPORTANT notes

**Use the Npgsql key-value format only. Never use the URL format (`postgresql://...`).**

> The Supabase dashboard offers a URL-format connection string by default. Do **not** paste it directly. If your password contains special characters (e.g. `@`, `&`, `#`), the URL parser will silently truncate the hostname at the first `@`, producing a misleading DNS error rather than a credentials error.

**Use the Session Mode Pooler, not the direct host.**

> New Supabase projects expose `db.<project>.supabase.co` on **IPv6 only**. On IPv4-only machines or networks, connecting to this host produces `WSANO_DATA` ("name valid, no data of requested type"). Use the session-mode pooler instead:
>
> 1. Go to your Supabase dashboard → **Connect** button (top left)
> 2. Select **Session mode** (port 5432)
> 3. The pooler host will be `aws-<N>-<region>.pooler.supabase.com`
> 4. The username changes to `postgres.<project-ref>` (project ref appended)
>
> Correct example for project `xmhrstlmrwpnljpzsxgd` in `ap-northeast-1`:
> ```
> Host=aws-1-ap-northeast-1.pooler.supabase.com;Port=5432;Database=postgres;Username=postgres.xmhrstlmrwpnljpzsxgd;Password=<password>;Ssl Mode=Require
> ```

**Always edit the source file, not the `bin/` copy.**

> `appsettings.Development.json` inside `bin/Debug/net10.0/` is a build artifact — it is **overwritten on every rebuild**. Always edit `src/CabinConnect.Api/appsettings.Development.json`. The bin copy will be updated automatically the next time you build.

**Stop any running API process before rebuilding.**

> If the API executable is running, MSBuild cannot overwrite it and the build will fail after 10 retries. Stop the process first:
> ```powershell
> Get-Process -Name "CabinConnect.Api" -ErrorAction SilentlyContinue | Stop-Process -Force
> ```

- [ ] API starts cleanly: `dotnet run --project src/CabinConnect.Api` → no DNS or connection errors in output
- [ ] API is reachable at `http://localhost:5232` (confirm port in `src/CabinConnect.Api/Properties/launchSettings.json`)

---

## 2. Database — Run Migrations

Before making any API calls that touch data, run the SQL scripts against your Supabase database via the **SQL Editor** in the Supabase dashboard:

| Order | File | What it does |
|---|---|---|
| 1 | `src/CabinConnect.Api/Database/amenities.sql` | Creates `amenities` table, RLS (authenticated read), seeds catalog |
| 2 | `src/CabinConnect.Api/Database/cabins.sql` | Creates `cabins`, `cabin_amenities`, `cabin_custom_amenities` tables + RLS |

Run each script in order. Rerunning is safe — scripts use `CREATE TABLE IF NOT EXISTS` and `INSERT … ON CONFLICT DO NOTHING`.

---

## 3. Frontend — React / Vite

- [ ] Node 20+ installed: `node --version` → must be 20.x or higher
- [ ] `.env.local` exists at `web/` and is **not** committed
- [ ] `web/.env.local` contains:

```
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_<your-key>
VITE_API_BASE_URL=http://localhost:5232
```

> Use `VITE_SUPABASE_PUBLISHABLE_KEY` (new Supabase key format), not `VITE_SUPABASE_ANON_KEY`. The value starts with `sb_publishable_`.
>
> `VITE_API_BASE_URL` must match the port in `src/CabinConnect.Api/Properties/launchSettings.json` — default is `5232`.

- [ ] Install packages: `cd web && npm install`
- [ ] Dev server starts: `npm run dev` → opens at `http://localhost:5173`
- [ ] If you see a stale import error: `rm -rf web/node_modules/.vite && npm run dev`

---

## 4. Supabase — Cloud vs. Local

| Mode | When to use | How to start |
|---|---|---|
| **Cloud (shared)** | Default for all development in this project | No setup — use credentials from team |
| **Local** | When testing migrations or RLS changes in isolation | `npx supabase start` → `npx supabase status` for local keys |

> If using local Supabase, update both `appsettings.Development.json` (use `Host=localhost;Port=54322` for the local DB) and `web/.env.local` (point to `http://127.0.0.1:54321`). The JWT signing key is different from cloud — mismatched URLs produce 401 errors on every authenticated request.

---

## 5. Auth Verification

- [ ] Sign in via `http://localhost:5173` with a Supabase user account → cabin list page loads
- [ ] A request to `GET /api/cabins` in the browser network tab returns HTTP 200 (not 401 or 500)
- [ ] API log shows no JWT validation errors on the first authenticated request

> **If you see 401 with JWT errors:** verify `Supabase:JwtAuthority` in `appsettings.Development.json` matches the Supabase project the frontend is authenticating against. The API derives its JWKS endpoint from this value.

---

## 6. Secrets Hygiene

- [ ] `git status` — confirm `appsettings.Development.json` and `web/.env.local` do **not** appear
- [ ] `git diff --cached` before every commit — confirm no credentials are staged
- [ ] Never share Supabase keys via chat, email, or shared documents

---

## Quick Reference

| Need | Command |
|---|---|
| Start the API | `dotnet run --project src/CabinConnect.Api` |
| Stop the API | `Get-Process -Name "CabinConnect.Api" \| Stop-Process -Force` |
| Start the frontend | `cd web && npm run dev` |
| Run backend tests | `dotnet test CabinConnect.slnx` |
| Run frontend type-check | `cd web && npx tsc --noEmit` |
| Run frontend lint | `cd web && npm run lint` |
| Clear Vite cache | `Remove-Item -Recurse -Force web/node_modules/.vite` |
| Flush DNS cache | `ipconfig /flushdns` |
