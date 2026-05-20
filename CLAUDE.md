# CabinConnect — AI-DLC Operating Rules

This file governs how Claude operates in this project. All rules apply to every session.

CabinConnect is being built using 99x's adoption of the AI-Driven Development Lifecycle (AI-DLC). Read this file before generating, modifying, or reviewing any artifact — code, intent, unit, retro, or otherwise.

---

## 1. Project Identity

**CabinConnect** is a digital community platform for cabin owners, local businesses, and neighbours in Norwegian mountain resorts. The MVP is four modules:

| Module | Purpose |
|---|---|
| **MyCabin** | Cabin owners store, track, and share cabin info — maintenance, costs, visitor instructions |
| **Events** | Administrators and residents publish and manage local community events |
| **Groceries** | Cabin owners order groceries for pickup or volunteer-delivered doorstep delivery |
| **ToolShare** | Community sharing economy for tools and equipment — lend, borrow, or rent locally |

Source of truth for product scope: [docs/solution/Requirements.md](docs/solution/Requirements.md).

**Tech stack:**
- Backend: C# / .NET 8 Web API (repository pattern, async/await throughout)
- Frontend: React 18 + TypeScript (strict mode, functional components only)
- Database: PostgreSQL via Supabase (RLS enforced on all tables)
- Auth: Supabase Auth — do not implement custom auth

**System boundaries:**
- React calls the .NET API only — never Supabase directly for data mutations
- Supabase client on the frontend is for auth tokens and real-time subscriptions only
- All business rules live in the .NET domain layer
- Each Community (resort) is data-isolated — users only see records belonging to their Community

---

## 2. The Mental Model — How Humans and AI Work Together

AI-DLC is *not* "use AI whenever convenient." It is a discipline built around two failure modes we explicitly avoid:

| Failure mode | What it looks like | Result |
|---|---|---|
| **The Blind Engineer** | Delegates everything to AI; loses mental model of the system | Can't respond to precise change requests; product owners outrun the engineer |
| **The Frustrated Engineer** | Refuses AI for anything non-trivial; clings to micro-validation | Productivity left on the table; team falls behind |

**The middle path — the Pilot model:**

```
1. AI Plans      — takes business intent, creates a detailed work plan
2. AI Clarifies  — actively asks questions to fill knowledge gaps
3. Human Validates — pilot approves plans and makes critical decisions
4. AI Executes   — implements only after human approval
```

Every Unit is owned by a **Human + AI pair**. The human is always accountable for the outcome regardless of how much AI contributed.

---

## 3. AI-DLC Vocabulary — Use These Terms Exactly

| Term | Meaning |
|---|---|
| **Intent** | A one-page outcome statement of a capability we want the system to have. Outcome-oriented, not solution-oriented. |
| **Mob Elaboration** | Inception ritual — turn-by-turn session where AI + team break an Intent into Units, with ACs in Given/When/Then form. Replaces traditional story refinement. |
| **Unit** | The atomic deliverable. Independently testable, deployable, owned by one Human+AI pair. Replaces Story / Task. |
| **Bolt** | A short, intense build cycle (hours/days, not weeks) containing 3–8 related Units. Replaces Sprint. The control mechanism that keeps AI-speed work reviewable. |
| **Mob Construction** | Construction ritual — AI proposes architecture and code; team clarifies and validates in real time. |
| **Prompt Log** | The audit record of every AI-assisted generation, with the quality-gate result. Lives in `ai-dlc/prompts/`. |
| **Retro** | Per-Bolt review that turns failures *and* successes into rule changes. |
| **Improvement** | A targeted update to a rule, guideline, or skill triggered by a retro or incident. |
| **Persistent Memory** | The project repo is the long-term memory — every artifact is checked in so AI never forgets goals across phases. |
| **FDE — Forward Deployable Engineer** | The trained lead adopter who guides AI-DLC rollout on a project. See [`ai-dlc/Instructions2FDE.md`](ai-dlc/Instructions2FDE.md). |
| **Project Champion** | Per-project driver of contextual process innovations specific to the team. |
| **AI-Maestro skills** | Career-defining skill set: prompt engineering & context design, unit design & decomposition, agent/plugin development (Xianix), AI code review & validation. |
| **Xianix** | 99x's open-source agent platform — routing, fallback chains, persistent memory, data boundaries. Sits at Layer L2 in the abstraction model (below AI-DLC, above model adapters). |

---

## 4. Prompt Quality Gate — Run This Before Every Code Response

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

## 5. The Three Phases — Workflow

```
INCEPTION  →  CONSTRUCTION  →  OPERATIONS
    ↑                              |
    └────── Improvements ──────────┘
```

### 5.1 Inception — *what* to build

```
Write Intent (Draft)
   → Mark Intent Ready
      → Run Mob Elaboration session(s)        ← 1..N sessions per Intent
         → Extract Units (with ACs, scope, deps)
            → Enter Units into Backlog (Open)
               → Mark Intent Elaborated
```

**Intent lifecycle:** `Draft` → `Ready` → `Elaborated` → `Deferred`.
- `Draft` → `Ready` once What, Why, Success Looks Like, Assumptions, Open Questions, and Out-of-Scope are filled in.
- `Ready` → `Elaborated` only when every significant behaviour has a Unit with ACs and all Units are in `build/backlog.md`.

**Multiple sessions per Intent are normal.** Each Mob Elaboration session has a *specific* goal ("define all Units for the grocery pickup flow"), not "elaborate the intent." If one session produces more than 8 Units, the Intent is too broad — split it.

**Greenfield clustering — one session can span multiple Intents.** Tightly-coupled Intents — typically the cross-cutting foundationals at the start of a new project (community boundary, auth, offline strategy, localization) — should be elaborated in a single shared session, not one-at-a-time. The default of "one Intent → one session" assumes the platform already exists; in greenfield, foundational Intents are bidirectional and isolating their sessions creates premature decisions. Mechanics: keep Intent files singular (one per CI), but place the shared session under a *cluster slug* (e.g. `elaborations/foundation/YYYY-MM-DD-session-N.md`), and link from each Intent's *Elaboration Sessions* table to that shared session. The Units extracted form the **Foundation Bolt** — the first Bolt, which ships before any user-facing feature work. Move back to one-Intent-per-session once the platform is in place. Treat any later cross-cutting concern (retrofitting multi-tenancy, a new compliance regime) as a mini-greenfield and cluster again. See [`project-review/notes.md`](project-review/notes.md) for the broader principle.

**Before any elaboration session, load context explicitly.** The session file's *Context Loaded* checklist must be ticked before prompts fire:
- Relevant domain glossary terms
- Applicable rules from `ai-dlc/rules/`
- Known edge cases from `ai-dlc/guidelines/edge-cases.md`

**Edge cases are captured DURING elaboration, not after coding.** When a new edge case surfaces in a session, it is written into [`ai-dlc/guidelines/edge-cases.md`](ai-dlc/guidelines/edge-cases.md) *before* the Unit is finalized.

**Definition of Done for Inception (per Intent):**
- Every significant behaviour has a Unit with acceptance criteria
- All Units are recorded in [`ai-dlc/ops/build/backlog.md`](ai-dlc/ops/build/backlog.md)
- Open questions are resolved or explicitly deferred
- Intent status is `Elaborated`

### 5.2 Construction — *how* to build

For each Unit, work in this order:

1. API contract (skill prompt 3 in `mob-elab-prompts.md`)
2. Implementation scaffold (skill prompt 4)
3. Fill in TODOs
4. Tests — minimum one per AC
5. Self-review against `skills/review-checklist.md` (skill prompt 5)

**Bolts package 3–8 related Units.** Each Bolt ends with a human-led review gate before the next begins. AI cannot move past a gate on its own.

**Greenfield foundation = two outcome-scoped Bolts.** **Bolt 1 — UI Foundation** ships a working PWA shell with the design system, locale switcher, and a demonstrable screen rendered against typed mocks. Mocks are typed against the contracts in `platform/shared/` — the handoff surface — which are committed *during* Bolt 1 even though Bolt 2 builds the real handlers. **Bolt 2 — Backend Foundation** makes those mocks real: persistence, auth, Community isolation. Both Bolts honour the 3–8 Unit cap. **Feature Bolts begin at Bolt 3.** See [`project-review/notes.md`](project-review/notes.md) Principle 3.

**Sub-principle — plan Bolt 2 just enough to make Bolt 1 honest.** Bolt 2's Unit files exist with Plan-quality content (Context, Scope, Dependencies, shared contracts) but **not** full Given/When/Then ACs before Bolt 1 executes. **The Bolt 1 retro IS Bolt 2's elaboration session** — that's the AI-DLC improvements loop in action (`Operations → Inception`). Over-planning Bolt 2 ahead of Bolt 1's retro is wasted effort the retro would have invalidated.

### 5.3 Operations — deploy, monitor, learn

- AI manages IaC, deployment, and telemetry anomaly detection
- Humans review alerts and make judgment calls on incidents
- After every Bolt: **Retrospective → Improvement(s) → updated rules → next Bolt is better**
- Incidents update [`ai-dlc/guidelines/edge-cases.md`](ai-dlc/guidelines/edge-cases.md)

---

## 6. Artifact Map

| Artifact | Where it lives | Lifecycle field to maintain |
|---|---|---|
| Intent | `ai-dlc/ops/inception/intents/YYYY-MM-DD-<slug>.md` | Status (Draft / Ready / Elaborated / Deferred) |
| Mob Elaboration session | `ai-dlc/ops/inception/elaborations/<intent-slug>/YYYY-MM-DD-session-N.md` | Session N of N |
| Unit | `ai-dlc/ops/build/units/<unit-slug>.md` | Status in backlog |
| Backlog | `ai-dlc/ops/build/backlog.md` | Open / Planned / In Progress / Done |
| Bolt | `ai-dlc/ops/build/bolts/bolt-NN-<slug>.md` | Planned / Active / Complete |
| Prompt log | `ai-dlc/prompts/YYYY-MM-DD-<feature>.md` | One file per feature; appended per session |
| Retro | `ai-dlc/ops/operate/retros/bolt-NN.md` | One per Bolt |
| Incident | `ai-dlc/ops/operate/incidents/YYYY-MM-DD-<slug>.md` | One per production issue |
| Improvement | `ai-dlc/ops/operate/improvements/YYYY-MM-DD-<slug>.md` | Pending / Applied |

> Note: `ai-dlc/ops/build/` and its `backlog.md`, `units/`, `bolts/` are not yet created in the repo. They are created when the first Intent reaches `Ready` and a Mob Elaboration session begins extracting Units.

**Before starting any Unit:** confirm it exists in `ops/build/units/` with acceptance criteria. If it doesn't, create it from `ai-dlc/skills/unit-template.md` first.

**After generating code for a Unit:** log the prompt in `ai-dlc/prompts/YYYY-MM-DD-<feature>.md`. No log entry = no audit trail = the work is not done.

---

## 7. Code Rules — Always Enforce

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
- Scope every read/write to the requesting user's Community — cross-Community data leakage is a P0 bug
- Store and compare all dates as UTC; format to local only for display
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

## 8. Domain Language — Use These Terms Exactly

Derived from [docs/solution/Requirements.md](docs/solution/Requirements.md). Extend this glossary as Mob Elaboration introduces new entities — do not invent new terms ad hoc.

| Term | Meaning |
|---|---|
| **Community (Resort)** | The data-isolation boundary — a Norwegian mountain resort. Every record belongs to exactly one Community. |
| **Cabin Owner** | A user who owns one or more Cabins and uses CabinConnect to manage them |
| **Resident** | A community member (Cabin Owner or local) who participates in Events and ToolShare |
| **Administrator** | A community member with permissions to publish and edit Events for their Community |
| **Cabin** | A registered cabin profile with location, capacity, amenities, and key info |
| **Maintenance Task** | A scheduled or logged piece of cabin upkeep with status and history |
| **Visitor Instructions** | A shareable document of access codes, rules, and emergency contacts; accessible by invited guests without a full account |
| **Event** | A community gathering with date, category, attendee list, and updates |
| **Event Registration** | A Resident's declared interest or confirmed attendance for an Event |
| **Supplier** | An external grocery supplier (initial partner: RIMA) |
| **Grocery Order** | A Cabin Owner's order with line items, fulfillment mode (Pickup / Delivery), and status |
| **Order Status** | `Placed` / `Ready` / `InTransit` / `Delivered` / `Cancelled` |
| **Carrier** | A volunteer who accepts and delivers Grocery Orders for doorstep delivery |
| **Tool Listing** | A listed tool or piece of equipment available for borrowing or rental |
| **Tool Status** | `Available` / `Reserved` / `OnLoan` |
| **Loan Request** | A Resident's request to borrow a Tool Listing for a specified period |
| **Loan Record** | The historical record of a completed or in-progress loan — used for accountability |

Full glossary: [ai-dlc/guidelines/domain-glossary.md](ai-dlc/guidelines/domain-glossary.md) _(currently carries booking-domain content — to be rewritten in a follow-up pass)_

---

## 9. Known Edge Cases — Check Before Generating Code

This list is intentionally small at the start of the project. It grows as Mob Elaboration and Operations surface new cases. Always check whether the code being generated handles the relevant items.

| ID | Scenario | Required behaviour |
|---|---|---|
| EC-001 | Cross-Community data access | Server-side filter by Community ID on every read/write; never trust client-supplied Community ID |
| EC-002 | Unauthenticated access to a data-mutating action | All mutations require Supabase JWT; public routes explicitly marked |
| EC-003 | Expired JWT on a long mobile session | API returns 401; frontend uses `onAuthStateChange` to refresh proactively |
| EC-004 | Visitor accessing Visitor Instructions without an account | Allow read via signed time-limited link only; no write access |
| EC-005 | Timezone-naive date comparison | Dates stored and compared as UTC; UI converts to local for display only |
| EC-006 | Order Status race (two updates at once) | Database-level optimistic concurrency or explicit status-transition guard |
| EC-007 | Loan Request collision (two requests for the same Tool) | First confirmed request wins; others receive a clear "no longer available" error |
| EC-008 | Multi-Community user switches active Community mid-session; an in-flight request issued under the old JWT must not write data into the new Community | Handled at U-003 — request's `active_community_id` is bound at request-start; writes always land in the original Community |
| EC-009 | User signs out on a shared device that has cached critical reads; the next user signing in must see only their own Community's data | Critical-read cache is keyed by `user_id`; sign-out triggers synchronous purge before the session ends (U-008) |
| EC-010 | Push notification queued at time T1 with user's locale; user changes locale at T2; notification dispatched at T3 > T2 | Notification locale is resolved at delivery time, not queue time (U-010) |

Full list: [ai-dlc/guidelines/edge-cases.md](ai-dlc/guidelines/edge-cases.md) _(currently carries booking-domain edge cases — to be rewritten in a follow-up pass)_. New cases discovered during elaboration must be added there before the Unit is finalized.

---

## 10. 99x Guardrails — Non-Negotiable

From the 99x AI-DLC adoption playbook. These are not optional regardless of time pressure.

### Process

- **Human validation is mandatory.** No Unit closes until a human has reviewed and approved the output. AI cannot self-certify completion.
- **Mob Elaboration sign-off.** AI-generated requirements and stories must be validated by the team before becoming committed scope.
- **Scope is human-controlled.** AI cannot expand a Unit's scope. Any scope change requires a human decision and a new Unit definition.
- **Bolt review gates.** Each Bolt ends with a human-led review before the next begins. Pace is set by the team, not the AI.

### Technical

- **CI/CD gates are non-negotiable.** All AI-generated code passes automated tests, security scanning, and linting before merge. No exceptions.
- **Data & credential boundaries.** PII, credentials, and client data never enter prompts.
- **Full audit trail.** Every AI action within a Unit is logged in `ai-dlc/prompts/`. Output is attributable to the Human+AI pair that owns the Unit.
- **Critical path dual validation.** High-risk outputs (security, payments, data pipelines) require both automated checks and explicit human sign-off.

### Governance

- **Architecture requires human sign-off.** AI proposes, humans decide. No architectural decision is ratified without an ADR entry in [`ai-dlc/rules/architecture.md`](ai-dlc/rules/architecture.md).
- **Mandatory human-in-the-loop zones.** Security design, compliance, data privacy, and client-facing contracts are always human decisions — AI advises only.
- **Human accountability is non-negotiable.** The human owner of a Unit is always accountable for its output, regardless of how much AI contributed.

---

## 11. Review Behaviour — Verify Before Presenting Output

Before presenting any code as complete, verify:

- [ ] Every acceptance criterion is traceable to the code
- [ ] No hallucinated API methods, library names, or type signatures
- [ ] Relevant edge cases from `guidelines/edge-cases.md` are handled or explicitly noted as out of scope
- [ ] No secrets, credentials, or hardcoded environment values
- [ ] Auth is checked on every new endpoint
- [ ] Community-scoping filter applied on every new read/write
- [ ] RLS policies are mentioned if new Supabase tables or access patterns are introduced
- [ ] Tests exist for each acceptance criterion

Full checklist: [ai-dlc/skills/review-checklist.md](ai-dlc/skills/review-checklist.md)

---

## 12. Reference Map

| Need | File |
|---|---|
| FDE onboarding (start here if new) | [ai-dlc/Instructions2FDE.md](ai-dlc/Instructions2FDE.md) |
| Run a Mob Elaboration session | [ai-dlc/skills/mob-elab-prompts.md](ai-dlc/skills/mob-elab-prompts.md) |
| Inception phase definition + DoD | [ai-dlc/ops/inception/README.md](ai-dlc/ops/inception/README.md) |
| Write an Intent | [ai-dlc/ops/inception/intents/_template.md](ai-dlc/ops/inception/intents/_template.md) |
| Document an Elaboration session | [ai-dlc/ops/inception/elaborations/_template.md](ai-dlc/ops/inception/elaborations/_template.md) |
| Write a Unit | [ai-dlc/skills/unit-template.md](ai-dlc/skills/unit-template.md) |
| Acceptance criteria patterns | [ai-dlc/guidelines/acceptance-patterns.md](ai-dlc/guidelines/acceptance-patterns.md) |
| Write a Retro | [ai-dlc/ops/operate/retros/_template.md](ai-dlc/ops/operate/retros/_template.md) |
| Write an Incident | [ai-dlc/ops/operate/incidents/_template.md](ai-dlc/ops/operate/incidents/_template.md) |
| File an Improvement | [ai-dlc/ops/operate/improvements/_template.md](ai-dlc/ops/operate/improvements/_template.md) |
| Multi-engineer team rollout | [ai-dlc/guidelines/team-rollout.md](ai-dlc/guidelines/team-rollout.md) |
| Live Unit status | `ai-dlc/ops/build/backlog.md` _(created at first elaboration)_ |
