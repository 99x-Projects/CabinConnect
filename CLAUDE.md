# CabinConnect — AI-DLC Operating Rules

This file governs how Claude Code operates in this project. All rules apply to every session.

---

## 1. Project Identity

**CabinConnect** is a cabin booking and management platform for hosts and guests.
- Backend: C# / .NET 10 Web API (Clean Architecture — Api → Domain ← Infrastructure; repository pattern; async/await throughout)
- Frontend: React 19 + TypeScript strict mode (functional components; Tanstack React Query for server state; react-hook-form + Zod for forms; Tailwind CSS v4 + Radix UI)
- Database: PostgreSQL via Supabase (RLS enabled and enforced on all application tables)
- Auth: Supabase Auth — JWT; `OnTokenValidated` extracts `app_metadata.role` as `app_role` claim

**System boundaries:**
- React app calls the .NET API only — never Supabase directly for data mutations or business queries
- Supabase JS client is used for auth session management only (`supabase.auth.*`)
- All business rules live in the .NET service layer (`CabinConnect.Api/Services`)
- Supabase Admin API is called only from `InvitationService` via `ISupabaseAdminClient`
- Ownership checks live at the **controller level** — services receive pre-validated host IDs
- Feature flags use environment variables (`VITE_FF_*` on frontend; `FeatureFlags:*` config key on backend)

---

## 2. Prompt Quality Gate — Run This Before Every Code Response

Before writing, generating, or modifying any code, check that the request contains all four components:

| Component | What it requires |
|---|---|
| **Context** | Who is asking, what system or feature this touches |
| **Constraints** | What must not be done; which rules apply |
| **Acceptance Criteria** | A testable pass/fail condition (Given/When/Then) |
| **Output Format** | What the response should look like |

**If any component is missing:** do not generate code. Ask one question at a time, starting with the most critical gap in this order: Acceptance Criteria → Context → Constraints → Output Format.

**When all four are present:** generate the output and open the response with:
```
**Context:** <one line>
**Constraints:** <one line>
**Acceptance Criteria:** <one line>
**Output Format:** <one line>
```

Full gate definition: [ai-dlc/rules/prompt-quality-gate.md](ai-dlc/rules/prompt-quality-gate.md)

---

## 3. Code Rules — Always Enforce

### Hard stops — memorise, never look up
- Never commit secrets, API keys, or connection strings — use environment variables
- Never trust client-supplied IDs without server-side ownership verification at the controller level
- Never expose internal stack traces or error detail to the client
- Never use `.Result` or `.Wait()` in async .NET code — always `await`
- Never use `any` in TypeScript without an explanatory comment

### Full rules (read before writing any code)
- Conventions and patterns: [ai-dlc/rules/code-standards.md](ai-dlc/rules/code-standards.md)
- Security rules: [ai-dlc/rules/security.md](ai-dlc/rules/security.md)
- Architecture decisions: [ai-dlc/rules/architecture.md](ai-dlc/rules/architecture.md)
- Forbidden zones: [ai-dlc/guidelines/forbidden-zones.md](ai-dlc/guidelines/forbidden-zones.md)

---

## 4. Domain Language — Use These Terms Exactly

Read [ai-dlc/guidelines/domain-glossary.md](ai-dlc/guidelines/domain-glossary.md) before every elaboration session and before generating any business logic. Use only the terms defined there — do not substitute synonyms.

**Critical terms (load immediately):**
- **Cabin:** A rentable accommodation unit managed by a Host
- **Booking:** A confirmed reservation of a Cabin by a Guest for a date range; Total Price frozen at confirmation — never recalculated
- **Hold:** A temporary uncommitted reservation during checkout; expires after 15 minutes

---

## 5. Known Edge Cases — Check Before Generating Code

Read [ai-dlc/guidelines/edge-cases.md](ai-dlc/guidelines/edge-cases.md) before generating code for any unit. Do not skip this step — new edge cases are added after every retro.

---

## 6. AI-DLC Workflow — How Work Is Structured

**Session start check:** At the beginning of every session, read the `Next dependency audit` date from Section 9. If today is on or after that date, prompt the engineer before any other work:
> "A dependency and security audit is scheduled. Would you like to run it now, or set a new date?"
If the engineer defers, ask for the new date and update Section 9 before continuing.

**Elaboration turn structure (strictly one unit per turn):**
1. Propose one unit — name and one-sentence purpose only. Stop.
2. Propose ACs as a numbered list. Stop.
3. Surface edge cases and open questions. Stop.
4. Ask the three observability questions: what confirms this is working in production? What log entry signals failure? What alert threshold makes sense? If the answer represents code behavior, add it as an AC. If not applicable, record "Not applicable" and move on. Stop.
5. Move to next unit. Repeat.
6. After all units agreed, present summary table and ask for sign-off before writing any files.

**Remediation and defect work is not exempt from Inception.** Before any code is generated for a defect, P0 fix, or remediation bolt, an intent file must exist and at minimum one elaboration turn must have been completed to confirm ACs and identify contract changes. The quality gate alone is not a substitute for the elaboration turn structure.

**Feature flags:** All new behaviour introduced into existing modules must be wrapped in an environment variable flag. Frontend: `VITE_FF_<FEATURE>=true`. Backend: `FeatureFlags:<Feature>` config key read via `IConfiguration`. This limits blast radius and enables rollback without redeployment.

**Default AC for existing-code Bolts (non-negotiable — cannot be removed during elaboration):**
- Standard form (Enhancement Bolts): *"All integration tests for [affected module] pass without modification."*
- Contract-change form (Migration and Remediation Bolts that change API shapes, data schemas, or inter-module interfaces): *"All integration tests for [affected module] pass without modification, except for tests covering the contract boundaries listed as breaking changes below. Each breaking change must be detailed and approved in the elaboration session before any code is generated."* When the contract-change form applies, the elaboration session must produce a Breaking Changes Register in the unit file.

**Full elaboration protocol:** read [ai-dlc/skills/mob-elab-prompts.md](ai-dlc/skills/mob-elab-prompts.md) before every elaboration session. The design session runs as Phase 0 of elaboration.
**Bolt risk assessment:** read [ai-dlc/skills/bolt-risk-assessment.md](ai-dlc/skills/bolt-risk-assessment.md) after elaboration sign-off and before the first unit in a bolt executes. No unit may begin execution without a signed-off risk assessment in the bolt file.
**UAT skill:** read [ai-dlc/skills/uat.md](ai-dlc/skills/uat.md) when all units under an intent are marked Done, or when the engineer invokes it directly. Prompt the engineer to run UAT before setting intent status to Implemented.
**Progress digest skill:** read [ai-dlc/skills/progress-digest.md](ai-dlc/skills/progress-digest.md) when the engineer asks for a stakeholder update, progress summary, or digest for an intent.
**Process health skill:** read [ai-dlc/skills/process-health.md](ai-dlc/skills/process-health.md) when the engineer invokes it to audit how well the AI-DLC process is functioning.
**New engineer induction skill:** read [ai-dlc/skills/new-engineer-induction.md](ai-dlc/skills/new-engineer-induction.md) when an engineer says they are new to the project or invokes it directly.
**Knowledge promotion skill:** read [ai-dlc/skills/knowledge-promotion.md](ai-dlc/skills/knowledge-promotion.md) as Step 5 of the Post-Retro Improvement Workflow after all improvements are applied. A retro is not closed until every Applied improvement has a Knowledge Promotion status.
**Dependency audit skill:** read [ai-dlc/skills/dependency-audit.md](ai-dlc/skills/dependency-audit.md) when the engineer invokes it, or when the `Next dependency audit` date in Section 9 has been reached.
**Compact-docs skill:** read [ai-dlc/skills/compact-docs.md](ai-dlc/skills/compact-docs.md) when the engineer invokes it.
**Root-cause-analysis skill:** read [ai-dlc/skills/root-cause-analysis.md](ai-dlc/skills/root-cause-analysis.md) when the engineer invokes it, or when an incident is marked Resolved and no RCA has been run on it.
**Engagement monitoring:** read and apply [ai-dlc/rules/engagement.md](ai-dlc/rules/engagement.md) throughout all ceremonies.

---

## 7. Review Behaviour — Verify Before Presenting Output

Before presenting any output, run every item in [ai-dlc/skills/review-checklist.md](ai-dlc/skills/review-checklist.md). Do not present output that has not passed this checklist.

---

## 8. Reference Map

| Need | File |
|---|---|
| Run a mob elaboration session | [ai-dlc/skills/mob-elab-prompts.md](ai-dlc/skills/mob-elab-prompts.md) |
| Write a unit | [ai-dlc/ops/build/units/_template.md](ai-dlc/ops/build/units/_template.md) |
| Plan a bolt | [ai-dlc/ops/build/bolts/_template.md](ai-dlc/ops/build/bolts/_template.md) |
| Write an intent | [ai-dlc/ops/inception/intents/_template.md](ai-dlc/ops/inception/intents/_template.md) |
| Write an elaboration session | [ai-dlc/ops/inception/elaborations/_template.md](ai-dlc/ops/inception/elaborations/_template.md) |
| Write a retro | [ai-dlc/ops/operate/retros/_template.md](ai-dlc/ops/operate/retros/_template.md) |
| Write an incident | [ai-dlc/ops/operate/incidents/_template.md](ai-dlc/ops/operate/incidents/_template.md) |
| Check acceptance criteria patterns | [ai-dlc/guidelines/acceptance-patterns.md](ai-dlc/guidelines/acceptance-patterns.md) |
| See all unit status | [ai-dlc/ops/build/backlog.md](ai-dlc/ops/build/backlog.md) |
| Forbidden zones | [ai-dlc/guidelines/forbidden-zones.md](ai-dlc/guidelines/forbidden-zones.md) |
| Entry points | [ai-dlc/guidelines/entry-points.md](ai-dlc/guidelines/entry-points.md) |
| Domain glossary | [ai-dlc/guidelines/domain-glossary.md](ai-dlc/guidelines/domain-glossary.md) |
| Known edge cases | [ai-dlc/guidelines/edge-cases.md](ai-dlc/guidelines/edge-cases.md) |
| Dev environment setup | [ai-dlc/guidelines/dev-setup.md](ai-dlc/guidelines/dev-setup.md) |

---

## 9. Process Configuration

| Setting | Value | Notes |
|---|---|---|
| **Archive threshold** | 6 months | Documents older than this qualify for archiving via the compact-docs skill |
| **Last dependency audit** | — | Updated automatically each time the dependency-audit skill runs |
| **Next dependency audit** | 2026-07-05 | AI prompts at session start on or after this date; default interval 30 days |
