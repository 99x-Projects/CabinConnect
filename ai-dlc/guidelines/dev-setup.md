# Developer Environment Setup

Step-by-step guide for getting CabinConnect running locally. Complete every step in order before trying to run the application.

---

## Prerequisites

| Tool | Version | Check |
|---|---|---|
| .NET SDK | 10.0+ | `dotnet --version` |
| Node.js | 20.x+ | `node --version` |
| npm | 10.x+ | `npm --version` |
| Supabase CLI | Latest | `supabase --version` |
| Docker Desktop | Latest | `docker --version` (needed for local Supabase) |
| Git | Any recent | `git --version` |

---

## 1. Clone and Navigate

```bash
git clone <repo-url>
cd CabinConnect
```

---

## 2. Start Local Supabase

```bash
supabase start
```

This starts a local Postgres instance with the schema from `supabase/migrations/`. On first run it will pull Docker images — allow 2–5 minutes.

Once running, get your local credentials:

```bash
supabase status
```

Note down:
- `API URL` (e.g., `http://127.0.0.1:54321`)
- `anon key`
- `service_role key`

---

## 3. Configure the Backend

Create `src/backend/CabinConnect.Api/appsettings.Development.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=127.0.0.1;Port=54322;Database=postgres;Username=postgres;Password=postgres"
  },
  "Supabase": {
    "Url": "http://127.0.0.1:54321",
    "ServiceRoleKey": "<service_role key from supabase status>"
  },
  "Jwt": {
    "Secret": "<JWT secret from supabase status>"
  }
}
```

> **Never commit this file.** It is in `.gitignore`.

---

## 4. Run the Backend

```bash
cd src/backend
dotnet run --project CabinConnect.Api
```

The API starts at `https://localhost:7xxx` (port shown in console). Verify with:

```bash
curl https://localhost:<port>/api/amenity-tags
```

You should receive a JSON array of amenity tags.

---

## 5. Configure the Frontend

```bash
cd src/frontend
cp .env.example .env.local
```

Edit `.env.local`:

```
VITE_API_BASE_URL=https://localhost:<backend-port>
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=<anon key from supabase status>
```

---

## 6. Run the Frontend

```bash
cd src/frontend
npm install
npm run dev
```

Frontend starts at `http://localhost:5173`. Open it in your browser.

---

## 7. Verify Auth

1. Open `http://localhost:5173/login`
2. Create a test account via the Supabase Studio: `http://127.0.0.1:54323` → Authentication → Users → Add user
3. Log in with those credentials
4. You should land on the Dashboard

---

## 8. Run the Backend Tests

```bash
cd src/backend
dotnet test
```

All tests should pass. If any fail, investigate before starting development.

---

## Secrets Hygiene Checklist

- [ ] `appsettings.Development.json` is in `.gitignore` — confirm with `git status`
- [ ] `.env.local` is in `.gitignore` — confirm with `git status`
- [ ] `git log --all --full-diff -p -- "*.json" "*.env*"` — confirm no secrets in history
- [ ] The `service_role` key is only in `appsettings.Development.json` — never in frontend env vars

---

## Common Issues

| Issue | Fix |
|---|---|
| Supabase won't start | Ensure Docker Desktop is running |
| `dotnet run` fails with connection refused | Check Supabase is running (`supabase status`) and the connection string port is 54322 |
| 401 from API | JWT secret in `appsettings.Development.json` must match the one from `supabase status` |
| Frontend shows blank page | Check browser console for CORS errors; verify `VITE_API_BASE_URL` matches the backend port |
| Tests fail | Run `supabase start` first if tests use a database |
