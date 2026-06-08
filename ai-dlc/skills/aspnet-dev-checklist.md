# Skill: ASP.NET + SPA Dev Checklist

This skill captures the recurring "looks-correct-but-breaks-locally" gotchas that surface when an ASP.NET Core API is paired with a SPA frontend (React, Vue, Angular, Svelte) in the same bolt. Run through every item below **before** declaring a SPA→API integration done.

If a single item fails, fix it before moving on — these items compound: e.g. an HTTPS-redirect problem will mask a CORS configuration problem, which will in turn mask a port mismatch.

---

## When to Use

- Generating any code that involves an ASP.NET Core Web API consumed by a browser-based SPA on a different origin/port
- Diagnosing any of the following symptoms:
  - `ERR_NETWORK_ACCESS_DENIED`, `Failed to fetch`, or "redirect is not allowed for preflight"
  - 401 from the API even though the user is signed in
  - `OPTIONS` preflight returning 307/308 redirect
  - Frontend hitting `https://localhost:7001` while the API is actually on `http://localhost:5150`
  - "CORS error" with no other clear cause
- Authoring or reviewing the `Program.cs` of a new ASP.NET Core API for a SPA bolt

---

## Pre-flight Checklist — Run Before Writing Code

- [ ] Decide and **write down** in the bolt or unit file:
  - The exact API base URL (scheme, host, port) the SPA will call
  - The exact SPA dev server URL (scheme, host, port)
  - Whether the dev environment uses HTTP or HTTPS for the API
- [ ] Confirm the SPA has an environment variable (e.g. `VITE_API_BASE_URL`) and that the value matches the planned API port — not the template default
- [ ] Confirm the chosen API port is free (`Get-NetTCPConnection -LocalPort <port>` on Windows, `lsof -i :<port>` on macOS/Linux)

---

## HTTPS Redirection — The #1 Silent Killer

The default `dotnet new webapi` template enables `app.UseHttpsRedirection()` unconditionally. In dev, when the SPA calls `http://localhost:5150`, ASP.NET responds with a 307 redirect to `https://localhost:7001`. **Browsers do not follow redirects on CORS preflight requests.** The result is a CORS error message that has nothing to do with CORS configuration.

**Required pattern in `Program.cs`:**

```csharp
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    // Do NOT call app.UseHttpsRedirection() in dev when the SPA calls over HTTP.
}
else
{
    app.UseHttpsRedirection();
    app.UseHsts();
}
```

**Diagnostic command** (PowerShell):

```powershell
curl.exe -i -X OPTIONS http://localhost:5150/api/<endpoint> `
  -H "Origin: http://localhost:5173" `
  -H "Access-Control-Request-Method: POST" `
  -H "Access-Control-Request-Headers: authorization,content-type"
```

If the response status is `307` or `308`, HTTPS redirection is the root cause — not CORS.

---

## CORS Configuration

CORS must allow the SPA origin **exactly**, including scheme and port. Wildcards (`*`) are forbidden in production by `rules/security.md`.

**Required pattern:**

```csharp
const string SpaCorsPolicy = "SpaCorsPolicy";

builder.Services.AddCors(options =>
{
    options.AddPolicy(SpaCorsPolicy, policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:5173",          // Vite dev server
                "https://app.example.com")        // production SPA
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();                  // required if SPA sends Authorization header or cookies
    });
});

// ...

app.UseRouting();
app.UseCors(SpaCorsPolicy);   // MUST come before UseAuthentication / UseAuthorization
app.UseAuthentication();
app.UseAuthorization();
```

**Common mistakes:**

| Mistake | Symptom |
|---|---|
| `UseCors` placed after `UseAuthentication` | Preflight returns 401 instead of 200 |
| `WithOrigins("*")` combined with `AllowCredentials()` | Browser silently rejects the response |
| Forgetting to add a new SPA port (e.g. when Vite picks 5174 because 5173 is taken) | Random "CORS error" on a previously-working bolt |
| Using `SetIsOriginAllowed(_ => true)` in dev "for convenience" | Hides real CORS bugs and ships to prod via copy-paste |

---

## Port Configuration

| Source of truth | What it sets |
|---|---|
| `src/api/<Project>/Properties/launchSettings.json` | Local dev port for `dotnet run` (`applicationUrl`) |
| `appsettings.json` / env var `ASPNETCORE_URLS` | Port when the app runs without launch settings (containers, prod) |
| SPA `.env.local` (`VITE_API_BASE_URL` etc.) | Port the SPA *thinks* the API is on |

**The rule:** all three must agree. The most common bug is the SPA `.env.local` pointing at the template default (`https://localhost:7001`) while the API is actually running on the port the engineer chose (`http://localhost:5150`).

**Verification command** (PowerShell):

```powershell
# 1. Confirm the API is bound to the expected port
Get-NetTCPConnection -State Listen -LocalPort 5150 -ErrorAction SilentlyContinue

# 2. Confirm the SPA is reading the right URL
Select-String -Path src/web/.env.local -Pattern "VITE_API_BASE_URL"
```

---

## Authentication Header Pass-through

If the SPA uses Supabase Auth, Auth0, or any external IdP, the JWT must reach the API on every authenticated call.

- [ ] SPA HTTP client injects `Authorization: Bearer <token>` automatically (single source of truth — not per-call)
- [ ] API CORS policy includes `AllowAnyHeader()` (or explicitly `WithHeaders("Authorization", "Content-Type")`)
- [ ] API CORS policy includes `AllowCredentials()` if cookies are also in play
- [ ] JWT validation parameters (`Authority`, `Audience`, `IssuerSigningKey`) match the IdP exactly — a single character mismatch yields a generic 401 with no body

**Diagnostic command:**

```powershell
curl.exe -i -X GET http://localhost:5150/api/<protected> `
  -H "Authorization: Bearer <paste-jwt>" `
  -H "Origin: http://localhost:5173"
```

If `200`, auth is working. If `401`, decode the JWT at <https://jwt.io> and compare `iss`, `aud`, and `exp` against the API's expected values.

---

## Connectivity to External Services (DB, Auth, etc.)

Code-level debugging cannot distinguish a misconfiguration from a network-layer block. Before assuming the bug is in your code:

- [ ] `Test-NetConnection <host> -Port <port>` succeeds for every external dependency (DB, Auth API, object storage)
- [ ] If on a corporate or managed device, EDR/firewall (SentinelOne, CrowdStrike, Defender for Endpoint) is not blocking destination IPs — check by retrying after a policy refresh or VPN change
- [ ] If using Supabase, prefer the **AWS Session Pooler** hostname (`aws-1-<region>.pooler.supabase.com:5432`) over the direct DB hostname — the direct hostname is IPv6-only on most projects and many corporate networks are IPv4-only

---

## Final End-to-End Verification

The bolt is **not** done until all of these pass against a freshly-restarted API and SPA:

- [ ] SPA loads with no console errors
- [ ] Sign-in succeeds and the JWT appears in `localStorage` (or wherever the auth library stores it)
- [ ] At least one authenticated SPA→API round-trip returns the expected JSON (verified by reading the network tab — not just by the UI rendering)
- [ ] Hard-refresh the SPA (Ctrl+Shift+R) and confirm the session persists
- [ ] Sign out and confirm a subsequent protected call returns 401 (not a stale success from a cached token)

---

## Output Format When Used in a Review

When this skill is invoked during a review, produce a single table with one row per checklist item: `Item | Pass / Fail / N/A | Evidence`. A bolt that fails any non-N/A item is not ready to merge.
