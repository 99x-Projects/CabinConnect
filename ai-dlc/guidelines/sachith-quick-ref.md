# AI-DLC Quick Reference — Sachith
Generated: 2026-06-05

---

## The Process Loop

Inception → Build → Operate → Improvements → (repeat)

- **Inception:** Write an intent file. Run mob elaboration to break it into units with ACs.
- **Build:** Execute units one at a time. Review each output before moving on. Log every prompt.
- **Operate:** Run retro after every bolt. Improvements are applied to the rules immediately.

---

## How to Invoke Each Ceremony

| What you want to do | What to say |
|---|---|
| Start a new feature | "New intent: [name]. Let's elaborate." |
| Run mob elaboration | "Run a mob elaboration for the [intent name] intent." |
| Execute a unit | "Execute unit [name] from bolt [name]." |
| Plan a batch of work | "Plan a bolt from the open units in the backlog." |
| Run a retro | "Run a retro for bolt [name]." |
| File an incident | "File an incident: [description]." |
| Run RCA on incident | "Run a root cause analysis on [file]." |
| Check process health | "Run process health." |
| Get a stakeholder update | "Generate a progress digest for [intent]." |
| Run UAT | "Run UAT for [intent]." |
| Audit dependencies | "Run dependency audit." |
| Archive old docs | "Run compact-docs." |

---

## The Quality Gate — Four Components Required

Every prompt must have all four or I will stop and ask:

1. **Context** — who needs this, what it touches, which layer(s)
2. **Constraints** — which rules apply (read `ai-dlc/rules/code-standards.md` first)
3. **Acceptance Criteria** — testable Given/When/Then; at least one unhappy path
4. **Output Format** — which files, new or update existing

---

## What You Own (I Never Do These For You)

- Confirming ACs are correct before elaboration sign-off
- Reading the diff and deciding it's good enough to merge
- Running the tests and verifying the feature works in the app
- Deciding whether a retro finding becomes a rule change

---

## Key Domain Terms

- **Cabin:** A rentable accommodation unit managed by a Host
- **Booking:** A confirmed reservation; Total Price is frozen at confirmation — never recalculated
- **Hold:** Temporary 15-minute reservation during checkout; if it expires during payment, Booking is rejected
- **Availability:** Cabin is available only when Bookings, Holds, AND Blackout Dates are all clear
- **Total Price:** Sum of nightly rates at confirmation; rate changes after confirmation don't affect it

Full glossary: `ai-dlc/guidelines/domain-glossary.md`

---

## System Boundaries — Never Break These

- React calls the .NET API only — never Supabase directly for data
- Supabase JS client is for `supabase.auth.*` only
- Ownership checks at the controller level — not in services
- `supabase/migrations/` is a forbidden zone — AI never writes migration files

---

## Feature Flags

Any new behaviour in an existing module needs a flag:
- Frontend: `VITE_FF_<FEATURE>=true` in `.env.local`
- Backend: `FeatureFlags:<Feature>: true` in `appsettings.Development.json`
Document the flag name and removal condition in the unit file.

---

## Key Files

| File | Purpose |
|---|---|
| `CLAUDE.md` | Master rule file — governs every session |
| `ai-dlc/ops/build/backlog.md` | All units by status |
| `ai-dlc/rules/prompt-quality-gate.md` | Quality gate — full definition with examples |
| `ai-dlc/rules/code-standards.md` | C# and React conventions for this project |
| `ai-dlc/rules/architecture.md` | 11 ADRs — why things are built the way they are |
| `ai-dlc/guidelines/domain-glossary.md` | All business term definitions |
| `ai-dlc/guidelines/edge-cases.md` | EC-001–EC-015 — check before generating code |
| `ai-dlc/guidelines/forbidden-zones.md` | Files AI must never touch |
| `ai-dlc/guidelines/entry-points.md` | Approved modules to start Bolts in |
| `ai-dlc/Instructions2FDE.md` | Full engineer guide |

---

## Common Mistakes

| Mistake | What happens | Fix |
|---|---|---|
| Sending an incomplete prompt | I stop and ask for the missing component | Include all four gate components |
| Accepting output without reviewing the diff | Bugs reach the codebase | Run `ai-dlc/skills/review-checklist.md` before merging |
| Skipping the retro | Mistakes recur in the next bolt | Run the retro after every bolt, even clean ones |
| Modifying `supabase/migrations/` via AI | Risk of irreversible schema damage | Describe the migration; write it manually |
| Not logging the prompt | No audit trail | Write to `ai-dlc/prompts/YYYY-MM-DD-<feature>.md` after every session |
