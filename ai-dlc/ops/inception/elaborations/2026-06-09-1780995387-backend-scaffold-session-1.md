# Elaboration Session: Backend Scaffold — .NET 8 API with Supabase JWT, PostgreSQL, and Health Check — Session 1

**Intent:** [intent/2026-06-09-1780994238-backend-scaffold.md](../intents/2026-06-09-1780994238-backend-scaffold.md)
**Date:** 2026-06-09
**Participants:** Chinthaka, Claude (AI facilitator)
**Session goal:** Decompose the backend scaffold intent into atomic units with testable ACs and edge case coverage.

---

## Units Agreed This Session

| # | Unit name | Purpose | ACs agreed? | Edge cases surfaced? |
|---|---|---|---|---|
| 1 | API Project Scaffold | Base project, env var config, CORS pipeline | Yes | Yes |
| 2 | Supabase JWT Validation Middleware | HS256 JWT auth, protect endpoints, public routes unaffected | Yes | Yes |
| 3 | PostgreSQL Database Connection | Npgsql/EF Core DbContext, startup connectivity check | Yes | Yes |
| 4 | Health Check Endpoint | Public `GET /health` returning JSON with API name, version, DB status | Yes | None (explicitly deferred) |

---

## Unit Detail

### Unit 1: API Project Scaffold

**Purpose:** Create the .NET 8 Web API project with the base configuration pipeline — environment variable binding, CORS policy for the frontend origin, and the middleware pipeline skeleton — so all subsequent units have a running host to wire into.

**Acceptance Criteria:**
1. Given the .NET 8 SDK is installed and environment variables are configured, when `dotnet run` is executed, then the API starts without errors and listens on the port specified by the `ASPNETCORE_URLS` environment variable.
2. Given CORS is configured with the allowed origin read from the `CORS_ALLOWED_ORIGINS` environment variable, when a request arrives from `http://localhost:5173`, then the response includes the correct `Access-Control-Allow-Origin` header.
3. Given a request arrives from an origin not in the allowed list, when the browser sends a preflight `OPTIONS` request, then the server returns a response with no `Access-Control-Allow-Origin` header for that origin.
4. Given no secrets, connection strings, or API keys are hardcoded in source files, when the repository is inspected, then all sensitive configuration values are absent from source — loaded only from environment variables or `.NET` user secrets.
5. Given the application is started without a required environment variable (e.g. `CORS_ALLOWED_ORIGINS`), when configuration binding runs, then the application fails fast with a clear startup error rather than silently using a null/empty value.

**Edge cases surfaced:**
- Multiple CORS origins: `CORS_ALLOWED_ORIGINS` should split on commas
- CORS wildcard risk: must not default to `*` if env var is missing — fail fast instead
- `launchSettings.json` leaking secrets: sensitive values must not appear there
- HTTP vs HTTPS: no redirect enforced locally; pipeline must not block HTTPS in production

**Open questions:** None.

---

### Unit 2: Supabase JWT Validation Middleware

**Purpose:** Configure JWT bearer authentication using the Supabase JWT secret (HS256 symmetric validation) so that any endpoint marked `[Authorize]` rejects requests without a valid Supabase-issued token, and accepts requests that carry one.

**Acceptance Criteria:**
1. Given a valid Supabase-issued JWT in the `Authorization: Bearer <token>` header, when a request is made to a protected endpoint, then the API returns a non-401 response.
2. Given no `Authorization` header is present, when a request is made to a protected endpoint, then the API returns `401 Unauthorized`.
3. Given an expired JWT in the `Authorization` header, when a request is made to a protected endpoint, then the API returns `401 Unauthorized`.
4. Given a JWT with a tampered signature in the `Authorization` header, when a request is made to a protected endpoint, then the API returns `401 Unauthorized`.
5. Given a JWT signed with the wrong secret, when a request is made to a protected endpoint, then the API returns `401 Unauthorized`.
6. Given the JWT secret is read from the `SUPABASE_JWT_SECRET` environment variable, when the application starts, then no JWT secret value appears in any source-controlled file.
7. Given a request is made to a public endpoint (e.g. `GET /health`), when no `Authorization` header is present, then the API returns `200 OK` — the auth middleware does not block public routes.

**Edge cases surfaced:**
- EC-008: API returns clean `401` with no stack trace; frontend detects and refreshes via `onAuthStateChange`
- Clock skew: default .NET 5-minute tolerance is acceptable — document as known trade-off
- Algorithm pinning: must explicitly set `ValidAlgorithms = ["HS256"]`; reject RS256 and `none`
- 401 response body: must not expose library error messages

**Open questions:** None. Issuer/audience validation explicitly deferred.

---

### Unit 3: PostgreSQL Database Connection

**Purpose:** Register a Npgsql/EF Core `DbContext` configured from the `DATABASE_URL` environment variable so the application can open and verify a connection to the Supabase PostgreSQL database at startup, making the data layer ready for feature bolts.

**Acceptance Criteria:**
1. Given the `DATABASE_URL` environment variable contains a valid Supabase PostgreSQL connection string, when the application starts, then the `DbContext` is registered in the DI container and can open a connection to the database without error.
2. Given the `DbContext` is registered, when a connection is opened and a simple connectivity query is executed (e.g. `SELECT 1`), then the query returns successfully — confirming the database is reachable.
3. Given the `DATABASE_URL` environment variable is missing or empty, when the application starts, then it fails fast with a clear startup error rather than starting in a broken state.
4. Given the connection string contains incorrect credentials or an unreachable host, when a connection attempt is made, then the application surfaces a clear error — no internal Npgsql stack trace is exposed to any client.
5. Given the `DbContext` is registered, when the application starts, then no database migrations are run — schema management is out of scope for this unit.
6. Given the connection string is read from the environment variable, when the repository is inspected, then no connection string value appears in any source-controlled file.

**Edge cases surfaced:**
- SSL/TLS required: connection string must include `SSL Mode=Require`
- Service role bypasses RLS: intentional — must never be exposed client-side
- Connection string format: Supabase provides both URI and keyword formats; keyword format recommended for Npgsql; document in `.env.example`
- Transient startup failure: fail fast is acceptable for scaffold

**Open questions:** None.

---

### Unit 4: Health Check Endpoint

**Purpose:** Expose a public `GET /health` endpoint that returns `200 OK` with a structured JSON response containing the API name, version, and the health status of both the API and the database connection.

**Acceptance Criteria:**
1. Given the API is running and the database is reachable, when `GET /health` is called without an `Authorization` header, then the API returns `200 OK` with a JSON body containing `status: "healthy"`, the API name, version, and `database: "healthy"`.
2. Given the API is running but the database is unreachable, when `GET /health` is called, then the API returns `503 Service Unavailable` with a JSON body containing `status: "unhealthy"` and `database: "unhealthy"` — the API name and version are still present.
3. Given `GET /health` is called, when the response is received, then the `Content-Type` header is `application/json`.
4. Given `GET /health` is called with a valid `Authorization` header, when the response is received, then the endpoint still returns `200 OK` — the auth middleware does not interfere with public routes.
5. Given the health check response includes a version field, when the application is built, then the version value is read from the assembly version — no hardcoded string in the response handler.

**Edge cases surfaced:** None — explicitly deferred by the engineer.

**Open questions:** None.

---

## Session Notes

- All four units are independent of business logic — this is pure infrastructure scaffold
- Unit 4 (Health Check) depends on Units 1, 2, and 3 being complete — it is the integration signal
- Units 1, 2, and 3 should be executed in order; Unit 4 last
- Health check JSON shape agreed: `{ "api": "CabinConnect", "version": "<assembly>", "status": "healthy|unhealthy", "database": "healthy|unhealthy" }`
- Version read from assembly, not hardcoded
- Issuer/audience JWT validation deferred to a future security hardening bolt
- No migrations, entity models, or repository pattern in this bolt — pure scaffold only

---

## Next Session

**Goal:** Not required — all units for this intent are fully elaborated.
**Prerequisite:** Plan a bolt to group and execute these four units.
