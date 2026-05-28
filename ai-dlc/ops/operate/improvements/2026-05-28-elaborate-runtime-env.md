# Improvement: Add a runtime-environment audit gate to mob elaboration

**Date:** 2026-05-28
**Triggered By:** [Retro — Bolt repo-scaffold](../retros/repo-scaffold.md)
**Target File:** [ai-dlc/skills/mob-elab-prompts.md](../../../skills/mob-elab-prompts.md)
**Status:** Applied

---

## What to Change

Insert a new section **before** the existing "1. Break Down a Feature into Units" prompt. It forces the elaboration session to surface runtime-environment assumptions (Docker availability, IPv4/IPv6 reach, managed-service constraints, OS, hosted-vs-local services) **before** any acceptance criteria are written.

### Current

```
# Mob Elaboration Prompts

Reference prompts for use during Mob Elaboration sessions. Copy, adapt context, and paste into the AI tool. Log the output in `prompts/YYYY-MM-DD-feature.md`.

---

## 1. Break Down a Feature into Units
```

### Proposed

```
# Mob Elaboration Prompts

Reference prompts for use during Mob Elaboration sessions. Copy, adapt context, and paste into the AI tool. Log the output in `prompts/YYYY-MM-DD-feature.md`.

---

## 0. Runtime Environment Audit (run this BEFORE breaking down units)

Run this checklist at the start of every mob elaboration session. Capture answers in the elaboration session file. If any answer is "no" or "unknown", flag it as a constraint that ACs must respect — do NOT write ACs that assume a capability the team cannot deliver locally.

- [ ] Docker available on every dev box that will execute units in this bolt? (If no: no Testcontainers, no WireMock containers, no `npx supabase start`, no `docker compose`.)
- [ ] IPv6 reachable from dev boxes and CI runners? (If no: assume Supabase / hosted-Postgres direct DB hostnames are unreachable — design for the pooler / proxy host instead. See EC-011.)
- [ ] Which OS/shell will units be executed on? (Windows + PowerShell ≠ macOS + bash for path separators, env-var syntax, line endings, file casing.)
- [ ] Are all required managed services already provisioned? (Supabase project, S3 bucket, SendGrid, etc.) Note their region — region mismatches break pooler hostnames.
- [ ] Are there any company / network-level egress restrictions? (Corporate proxy, firewall blocking 5432, geo-blocked endpoints.)
- [ ] Which credentials need to exist locally for units to be testable end-to-end? Are they already rotated and stored in a gitignored file (NOT in chat)?

Output of this gate must appear in the elaboration session file under a "Runtime constraints" heading, and the resulting unit ACs must explicitly acknowledge or work around each constraint.

---

## 1. Break Down a Feature into Units
```

## Why

During `repo-scaffold` Wave 2, two units (`db-migration-tooling`, `supabase-project-and-auth`) shipped with ACs that assumed Docker and direct-DB IPv6 reach. Neither was available on the dev box. This forced mid-bolt AC renegotiation, an opt-in `SkippableFact`, a one-off `tools/db-probe` console app, and ~15 minutes of brute-force region probing.

The root cause was simple: we never asked "what's the runtime?" before writing ACs. The Quality Gate covers *what* and *how* but not *where*.

## Expected Outcome

- Every elaboration session starts with a one-page environment audit captured in the session file.
- ACs that assume a capability (Docker, IPv6, a specific managed service) explicitly acknowledge it as a constraint and ship with a fallback path.
- Bolts no longer hit mid-execution surprises that force AC renegotiation.

## Applied

- [x] Target file updated ([ai-dlc/skills/mob-elab-prompts.md](../../../skills/mob-elab-prompts.md))
- [x] Retro updated to mark this improvement as applied ([retros/repo-scaffold.md](../retros/repo-scaffold.md))
- [ ] Team notified — n/a (single-operator project at this time)
