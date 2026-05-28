# Prompt Log: Repo Scaffold

**Bolt:** [repo-scaffold](../ops/build/bolts/repo-scaffold.md)
**Intent:** [repo-scaffold](../ops/inception/intents/repo-scaffold.md)
**Date started:** 2026-05-28
**Contributors:** HL (engineer), GitHub Copilot (Claude Opus 4.7)

---

## Session 2026-05-28 — Quality-gate halt on Wave 1 kickoff

### Prompt
Single turn in GitHub Copilot Chat:
1. "Kick off Wave 1"

### Output Summary
Assistant ran the Prompt Quality Gate on the request to execute Wave 1 of `cabin-profile-mvp` (units `community-registry` and `owner-signup`). Gate failed on **Context**: the repo has no .NET solution, no React app, and no Supabase wiring. Assistant did not generate code. Surfaced three options (Option A: foundational scaffold bolt; Option B: ad-hoc scaffold with deviation noted; Option C: generate code against assumed structure). Recommended Option A.

### Quality Gate Result
Halted at Context — gate not passed; no code generated. Output was an interactive decision prompt, not generated code.

### Decision Notes
- The Prompt Quality Gate caught a real risk: code would have referenced `POST /api/users/me`, `GET /api/communities`, Supabase JWKS validation, etc. with no scaffold in place.
- Recommending Option A (run a separate scaffold ceremony) preserves AI-DLC traceability: no orphan code.

### Next Action
User chose Option A.

---

## Session 2026-05-28 — Mob elaboration: repo-scaffold

### Prompt
Multi-turn interactive ceremony in GitHub Copilot Chat following the turn-by-turn protocol (one unit per response: name → ACs → edge cases → next unit).
1. "option A"
2. "go" (skip clarifying questions; proceed with assumed `src/backend/`, `src/frontend/`, `supabase/` structure and empty backend)
3. Confirmed each of 5 units across 15 turns (5 × confirm-name, 5 × accept-ACs, 5 × accept-edges)
4. "Sign off — write the files"

### Output Summary
Assistant decomposed the (backfilled) repo-scaffold intent into five units following the strict turn-by-turn protocol — never decomposing more than one unit per response, never writing files before sign-off. On sign-off it created 10 artifacts: the backfilled intent file, one elaboration session record, the bolt file, five unit files, an updated backlog, and this prompt log.

Files created:
- `ai-dlc/ops/inception/intents/repo-scaffold.md` (backfilled)
- `ai-dlc/ops/inception/elaborations/repo-scaffold/2026-05-28-session-1.md`
- `ai-dlc/ops/build/bolts/repo-scaffold.md`
- `ai-dlc/ops/build/units/dotnet-api-scaffold.md`
- `ai-dlc/ops/build/units/react-app-scaffold.md`
- `ai-dlc/ops/build/units/supabase-project-and-auth.md`
- `ai-dlc/ops/build/units/db-migration-tooling.md`
- `ai-dlc/ops/build/units/feature-flag-plumbing.md`
- `ai-dlc/prompts/2026-05-28-repo-scaffold.md`

File updated:
- `ai-dlc/ops/build/backlog.md` (5 new Planned units, new `repo-scaffold` bolt row sequenced before `cabin-profile-mvp`)

### Quality Gate Result
Not strictly applicable — no code generated. Informal elaboration-ceremony gate:
- Context: Pass — CLAUDE.md, Requirements.md, existing bolt/unit templates, and the existing `cabin-profile-mvp` bolt all loaded.
- Constraints: Pass — turn-by-turn protocol enforced; no files written before sign-off; out-of-scope items explicit per unit; AI-DLC discipline (backfilled intent) preserved instead of skipped.
- Acceptance criteria: Pass — every unit has Given/When/Then ACs with verifiable outcomes.
- Output format: Pass — followed established unit, intent, elaboration, and bolt templates exactly.

### Changes Made to Output (cross-cutting decisions worth recording)
- **Backfilled intent rather than skipped.** Audit-trail integrity over speed.
- **Dual-tool migration story (EF Core + Supabase SQL) plus CI guardrail script.** Prevents future "RLS in EF migration" or "table DDL in Supabase migration" drift.
- **Snake-case via `EFCore.NamingConventions`** — avoids per-entity fluent boilerplate; matches CLAUDE.md §3.
- **`ClockSkew = 30 s` made explicit.** Framework default of 5 min is too loose for a JWT-issuance lifecycle measured in seconds.
- **Backend throws on unknown flag name; frontend uses typed union.** Both surfaces fail loudly on typo / dead flags — opposite of the typical "silent default false".
- **Backend forgiving boolean parsing vs frontend strict `"true"` parsing** documented as deliberate asymmetry rather than papered over.
- **`/health` `.AllowAnonymous()` from day one** before any global `[Authorize]` exists, so the policy never surprises the endpoint later.
- **Sequencing change to backlog.** `repo-scaffold` bolt now sits before `cabin-profile-mvp`; `cabin-profile-mvp` units remain Planned and are gated on `repo-scaffold` completion. Documented in both bolt files and the backlog's Bolts section.

### Decision Notes
- Five units fits the 3–8 bolt guideline. Did not artificially merge (e.g. "auth + migrations + flags" as one unit) — each has distinct concerns and tests.
- Did not split `supabase-project-and-auth` into frontend-auth and backend-auth: they share the JWT contract; splitting would risk one stack diverging from the other.
- No new global edge cases added to `guidelines/edge-cases.md`. Each unit captures its own local edge cases. CLAUDE.md EC-008 reinforced inside `supabase-project-and-auth`.
- Cross-cutting "improvement candidates" remain open from prior sessions (CLAUDE.md vs Requirements.md domain reconciliation; quality-gate scope for ceremony artifacts). Not blocking.

### Next Action
1. Update `ai-dlc/ops/build/backlog.md` with the five new Planned units and the new `repo-scaffold` bolt row (done by this same session).
2. Human assigns owners to each unit in `bolts/repo-scaffold.md`.
3. Kick off Wave 1: *"Execute unit dotnet-api-scaffold from bolt repo-scaffold"* and *"Execute unit react-app-scaffold from bolt repo-scaffold"*.
