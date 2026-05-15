# CabinConnect — AI-DLC Operating Rules

This file governs how Claude operates in this project. All rules apply to every session.

---

## 1. Project Identity

**CabinConnect** is a cabin booking platform.
- Backend: C# / .NET 8 Web API (repository pattern, async/await throughout)
- Frontend: React 18 + TypeScript (strict mode, functional components only)
- Database: PostgreSQL via Supabase (RLS enforced on all tables)
- Auth: Supabase Auth — do not implement custom auth

**System boundaries:**
- React app calls the .NET API only — never Supabase directly for data mutations
- Supabase client on the frontend is for auth tokens and real-time subscriptions only
- All business rules live in the .NET domain layer

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

### Never do these
- Commit secrets, API keys, or connection strings — use environment variables
- Trust client-supplied IDs without server-side ownership verification
- Expose internal stack traces or error detail to the client
- Use raw SQL string concatenation — parameterized queries or ORM only
- Use `.Result` or `.Wait()` in async .NET code
- Use `any` in TypeScript without an explanatory comment
- Disable CORS wildcard (`*`) or CSRF protection in production
- Call Supabase directly from React for data mutations

### Always do these
- Validate and sanitize all input at the API boundary
- Authenticate every endpoint — explicitly mark public routes
- Use RLS on every Supabase table; update policies when adding tables
- Store total booking price on the Booking record at confirmation — never recalculate from current rates
- Store and compare all dates as UTC; check-in/check-out are date-only (no time component)
- Use DTOs at API boundaries; keep domain models internal to the .NET layer

### Naming conventions
- C#: PascalCase types/methods, camelCase locals/params, `_camelCase` private fields
- TypeScript/React: PascalCase components, camelCase functions/variables, UPPER_SNAKE_CASE constants
- Files: `cabin-card.tsx` (React, kebab-case), `CabinService.cs` (.NET, PascalCase)
- Database: snake_case tables and columns

Full standards: [ai-dlc/rules/code-standards.md](ai-dlc/rules/code-standards.md)
Full security rules: [ai-dlc/rules/security.md](ai-dlc/rules/security.md)
Architecture decisions: [ai-dlc/rules/architecture.md](ai-dlc/rules/architecture.md)

---

## 4. Domain Language — Use These Terms Exactly

| Term | Meaning |
|---|---|
| **Cabin** | A rentable accommodation unit |
| **Booking** | A reservation of a Cabin by a Guest for a date range |
| **Booking Status** | `Pending` / `Confirmed` / `Cancelled` / `Completed` / `NoShow` |
| **Guest** | A user who makes bookings (authenticated via Supabase Auth) |
| **Host** | The operator managing cabins and listings |
| **Availability** | A Cabin is available if no Confirmed or Pending booking overlaps the requested dates |
| **Date Range** | Inclusive check-in, exclusive check-out (e.g. Jun 1–5 = 4 nights) |
| **Hold** | Temporary uncommitted reservation during checkout; expires after 15 minutes |
| **Blackout Date** | Date range blocking a Cabin regardless of bookings |
| **Base Rate** | Nightly price set by the Host |
| **Seasonal Rate** | Override to Base Rate for a specific date range |
| **Total Price** | Sum of nightly rates at booking confirmation; never retroactively recalculated |

Full glossary: [ai-dlc/guidelines/domain-glossary.md](ai-dlc/guidelines/domain-glossary.md)

---

## 5. Known Edge Cases — Check Before Generating Code

Always check whether the code being generated handles these:

| ID | Scenario | Required behaviour |
|---|---|---|
| EC-001 | Concurrent booking on same cabin/dates | Database-level lock or unique constraint; Hold provides soft buffer |
| EC-002 | Hold expires during payment | Validate Hold is still active at payment confirmation; return clear error if not |
| EC-003 | Timezone-naive date comparison | Dates stored as UTC; date-only (no time); UI converts to local for display only |
| EC-004 | Blackout dates not checked at booking | Availability query must always filter blackout dates |
| EC-005 | Overlapping seasonal rates | Most specific date range wins; tie goes to higher rate |
| EC-006 | Rate change after confirmation | Total price frozen at confirmation; never recalculated |
| EC-007 | Guest accessing another Guest's booking | RLS restricts reads/writes to owner; server also validates ownership |
| EC-008 | Expired JWT on long session | API returns 401; frontend uses `onAuthStateChange` to refresh proactively |
| EC-009 | Check-out before check-in | Server validates before any DB query; frontend validates too but server is authoritative |
| EC-010 | Zero-night booking (same-day in/out) | Minimum 1 night enforced in validation |

Full list: [ai-dlc/guidelines/edge-cases.md](ai-dlc/guidelines/edge-cases.md)

---

## 6. AI-DLC Workflow — How Work Is Structured

This project uses AI-DLC. Understand the artifact hierarchy before acting:

```
Intent → Mob Elaboration → Unit → Bolt → Code → Retro → Improvement
```

| Artifact | Where it lives | When to create/update |
|---|---|---|
| Intent | `ai-dlc/ops/inception/intents/` | When a new feature need is identified |
| Elaboration session | `ai-dlc/ops/inception/elaborations/<intent-slug>/` | After each mob session |
| Unit | `ai-dlc/ops/build/units/` | After elaboration; one file per atomic behaviour |
| Backlog | `ai-dlc/ops/build/backlog.md` | Update whenever a unit's status changes |
| Bolt | `ai-dlc/ops/build/bolts/` | When planning a batch of units |
| Prompt log | `ai-dlc/prompts/` | After every AI-assisted code generation |
| Retro | `ai-dlc/ops/operate/retros/` | After every Bolt completes |
| Incident | `ai-dlc/ops/operate/incidents/` | When a production issue occurs |
| Improvement | `ai-dlc/ops/operate/improvements/` | When a retro or incident triggers a rule change |

**Before starting any unit:** confirm it exists in `build/units/` with acceptance criteria. If it doesn't, prompt the engineer to create it from the template first.

**After generating code for a unit:** remind the engineer to log the prompt in `ai-dlc/prompts/YYYY-MM-DD-<feature>.md`.

---

## 7. Review Behaviour — Verify Before Presenting Output

Before presenting any code as complete, verify:

- [ ] Every acceptance criterion is traceable to the code
- [ ] No hallucinated API methods, library names, or type signatures
- [ ] EC-001 through EC-010 checked — relevant ones are handled or explicitly noted as out of scope
- [ ] No secrets, credentials, or hardcoded environment values
- [ ] Auth is checked on every new endpoint
- [ ] RLS policies are mentioned if new Supabase tables or access patterns are introduced
- [ ] Tests exist for each acceptance criterion

Full checklist: [ai-dlc/skills/review-checklist.md](ai-dlc/skills/review-checklist.md)

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
