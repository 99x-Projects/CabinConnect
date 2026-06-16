# Review Checklist

Use this before approving any AI-assisted output (code, tests, API contracts, ACs).

---

## Functional Correctness
- [ ] Output matches all acceptance criteria — every Given/When/Then is traceable to the code
- [ ] Edge cases from `guidelines/edge-cases.md` are handled or explicitly excluded with a comment
- [ ] No business logic bypassed or silently skipped
- [ ] Feature verified in a real environment (browser smoke test or manual API call) — tests passing is not sufficient on its own

## Code Quality
- [ ] Follows naming conventions from `rules/code-standards.md`
- [ ] No `any` types in TypeScript without justification
- [ ] No blocking `.Result` / `.Wait()` calls in async .NET code
- [ ] No dead code, commented-out blocks, or debug statements left in
- [ ] Methods/functions do one thing; no hidden side effects
- [ ] Nothing in the diff goes beyond what the unit's acceptance criteria required — no extra abstractions, helper methods, interfaces, or "future-proofing" that no current AC calls for

## Security
- [ ] No secrets, keys, or credentials in code or comments
- [ ] All inputs validated at the API boundary
- [ ] Supabase RLS policies updated if new tables or access patterns introduced
- [ ] No SQL concatenation — parameterized queries or ORM only
- [ ] Auth checked on every new endpoint

## Architecture
- [ ] Diff respects the system boundaries in `rules/architecture.md`: React calls the .NET API only — no direct Supabase data mutations from the frontend; all business logic in the .NET domain layer
- [ ] No new cross-boundary pattern introduced without a corresponding ADR entry in `rules/architecture.md`

## Tests
- [ ] At least one test per acceptance criterion
- [ ] Tests assert behaviour, not implementation details
- [ ] Tests are independent — no shared mutable state between tests
- [ ] Coverage does not drop below the threshold for the domain layer

## AI-Specific Checks
- [ ] No hallucinated library names, method signatures, or APIs — verify by compiling/running the code, not just reading it; TypeScript strict mode and `dotnet build` catch most but not runtime-only misuse
- [ ] Prompt quality gate (`rules/prompt-quality-gate.md`) completed and passed
- [ ] Prompt and output logged in `prompts/YYYY-MM-DD-feature.md`
- [ ] Reviewer has read the full diff — not just the AI summary
- [ ] If the unit introduces a layout wrapper, shell, or shared component: existing pages were grepped for patterns it will duplicate (e.g. `<header`, `signOut`, `min-h-screen`) before generation — not after browser review
- [ ] Behavioral trade-offs (e.g. null semantics, field-clearing rules, fallback behavior) were explicitly confirmed with the engineer before the output was accepted

## Deployment Readiness
- [ ] No breaking changes to existing API contracts without a versioning strategy
- [ ] Environment-specific config uses env vars — no hardcoded URLs or credentials
- [ ] Migration scripts (if any) are reversible or have a rollback plan
- [ ] Feature is behind a flag if not yet accepted by stakeholders

---

**Approve only when all checked. Document any deliberate skips with a reason.**
