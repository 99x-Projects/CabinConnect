# Improvement: ASP.NET + SPA dev checklist skill

**Status:** Applied
**Triggered by:** [retros/2026-06-08-bolt-cabin-profile-mvp.md](../retros/2026-06-08-bolt-cabin-profile-mvp.md) — findings "The .NET API redirected HTTP→HTTPS in dev, breaking CORS preflight" and "A network-layer block (SentinelOne) … was invisible to the code"
**Applied date:** 2026-06-08

---

## Target File

`ai-dlc/skills/aspnet-dev-checklist.md` (new file)

---

## Current Text

```
N/A — new addition
```

---

## Proposed Replacement

A new skill file at `ai-dlc/skills/aspnet-dev-checklist.md` covering the gotchas that surface when an ASP.NET Core API is paired with a SPA:

1. **Pre-flight checklist** — write down the API base URL, SPA dev server URL, and HTTP/HTTPS choice in the bolt or unit file *before* any code is written.
2. **HTTPS redirection** — explicit `Program.cs` pattern that wraps `app.UseHttpsRedirection()` in `else (! IsDevelopment())`, with a `curl` diagnostic command that returns `307` if redirection is the root cause.
3. **CORS** — required pattern (`UseCors` before `UseAuthentication`, no wildcards with credentials), and a table of common mistakes mapped to symptoms.
4. **Port configuration** — three sources of truth (`launchSettings.json`, `ASPNETCORE_URLS`, SPA `.env.local`) all of which must agree, with a verification command.
5. **Auth header pass-through** — checklist for `Authorization: Bearer` injection, CORS-allowed headers, and JWT validation parameters.
6. **External-service connectivity** — `Test-NetConnection` to every external dependency before assuming a code bug; explicit guidance on EDR (SentinelOne / CrowdStrike / Defender for Endpoint) and on preferring the AWS Session Pooler hostname for Supabase Postgres on IPv4-only networks.
7. **Final end-to-end verification** — the bolt is not done until sign-in, an authenticated SPA→API round-trip, hard-refresh persistence, and sign-out 401 all pass against freshly restarted servers.
8. **Output format** when used in a review — a single pass/fail/evidence table.

See [skills/aspnet-dev-checklist.md](../../../skills/aspnet-dev-checklist.md) for the full content.

A routing line is also added to the master rule file Section 6 so the skill is discovered automatically:

```
**ASP.NET + SPA dev checklist:** read `ai-dlc/skills/aspnet-dev-checklist.md` when scaffolding or debugging an ASP.NET Core API consumed by a SPA.
```

---

## Reason

Three separate findings in the cabin-profile-mvp retro all map to the same gap: the project had no single place capturing the well-known integration gotchas between ASP.NET Core and a SPA dev server.

1. `app.UseHttpsRedirection()` was emitted by the default template and broke CORS preflight. The fix is a one-line wrap in `else { … }`, but the symptom presented as "CORS error", which sent debugging in the wrong direction.
2. The SPA `.env.local` initially pointed at `https://localhost:7001` (template default) while the API was actually on `http://localhost:5150`. The mismatch produced 30 minutes of debugging.
3. SentinelOne blocked outbound TCP/443 to Cloudflare IPs, which made Supabase Auth unreachable from the browser. The agent initially assumed the bug was in code or config; only after running `Test-NetConnection` did the network-layer block become visible.

Capturing each of these as a checklist item — with the matching diagnostic command — turns 30+ minutes of debugging per bolt into a 60-second sweep at the start. Diagnostic commands are intentionally PowerShell-flavoured to match the project's primary dev environment (Windows + VS Code).

---

## Validation

- [ ] The HTTPS-redirection / CORS / port-mismatch trio does not recur in any of the next 3 bolts that involve an ASP.NET + SPA pairing
- [ ] When a network-layer block occurs, it is identified within 5 minutes of the first failed request rather than after extended code-side debugging
- [ ] Engineers reviewing PRs for new ASP.NET + SPA bolts use this checklist as the structure for review comments
- [ ] The skill file is referenced from the master rule file Section 6 routing list
