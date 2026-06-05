# Review Checklist

Run every item below before presenting any code output. Do not present output that has not passed this checklist.

---

## 1. Functional Correctness

- [ ] Every acceptance criterion is traceable to at least one code path in the diff
- [ ] All unhappy-path ACs have a corresponding error branch in the implementation
- [ ] Edge cases listed in the unit file are handled or explicitly noted as out of scope with a reason
- [ ] `ai-dlc/guidelines/edge-cases.md` was checked — relevant edge cases are handled
- [ ] Date handling uses UTC; date-only fields use `DateOnly` in C# — no `DateTime` for check-in/check-out

---

## 2. Code Quality

- [ ] No hallucinated API methods, library names, or type signatures — every method called exists in the codebase or documented API
- [ ] No over-engineering: nothing in the diff beyond what the ACs required
- [ ] No half-finished implementations (no `TODO: implement this`, no empty catch blocks)
- [ ] Naming follows conventions in `ai-dlc/rules/code-standards.md`
- [ ] No magic strings for claims, status values, or role names — constants classes used

---

## 3. Security

- [ ] No secrets, credentials, or hardcoded environment values
- [ ] Auth is verified on every new .NET endpoint (`[Authorize]` present or `[AllowAnonymous]` with documented reason)
- [ ] Ownership check at controller level for any endpoint touching user-owned resources
- [ ] All string inputs have `[MaxLength]` validation on request DTOs
- [ ] No `dangerouslySetInnerHTML` in React components
- [ ] No Supabase direct query calls from the frontend (only `supabase.auth.*`)
- [ ] Supabase service role key not referenced in any client-side code

---

## 4. Architecture

- [ ] Diff respects layer boundaries (ADR-001): no EF Core in Api layer, no HTTP concerns in Domain
- [ ] DTOs are `record` types (ADR-005)
- [ ] Repository methods call `SaveChangesAsync()` internally — service does not (ADR-003)
- [ ] Ownership checks are in controllers, not services (ADR-008)
- [ ] New server state in React uses `useQuery`/`useMutation` from React Query, not `useState` + `useEffect` (ADR-010)
- [ ] Query keys use `queryKeys` factory, not inline strings (code-standards)
- [ ] If this unit modifies an existing module, a feature flag is present (ADR-009)
- [ ] No new `ISupabaseAdminClient` injections outside `InvitationService` (ADR-011)

---

## 5. Tests

- [ ] At least one test per acceptance criterion
- [ ] Tests assert behavior, not implementation details (no asserting which private methods were called)
- [ ] Exception translation paths (DbUpdateException → domain exception) have tests
- [ ] Test naming: `{MethodName}_{Scenario}_{ExpectedOutcome}`
- [ ] No tests left in a placeholder/stub state (`[Fact] public void Test1() { }`)

---

## 6. AI-Specific Checks

- [ ] No library methods referenced that do not exist in the installed versions (check `Directory.Packages.props` for .NET; `package.json` for frontend)
- [ ] No invented EF Core methods or Linq extension methods
- [ ] Scope not exceeded — no changes to files outside the unit's stated scope
- [ ] Forbidden zones not touched: `supabase/migrations/` must not be modified
- [ ] Prompt log reminder: remind the engineer to log this session in `ai-dlc/prompts/YYYY-MM-DD-<feature>.md`

---

## 7. Observability

- [ ] The unit file's observability section is complete (success signal, failure signal, alert threshold recorded)
- [ ] Any observability item that represents code behavior is expressed as an AC and implemented in the diff
- [ ] Errors are logged server-side before returning generic messages to the client
- [ ] Privileged operations (invite user, reveal key info, delete resource) have an audit log write

---

## 8. Deployment Readiness

- [ ] No breaking changes to existing API contracts without a documented Breaking Changes Register in the unit file
- [ ] No new Supabase tables introduced without RLS policies defined (migration not written, but policies must be planned and noted)
- [ ] If a new configuration key was added, `.env.example` is updated
- [ ] Feature flag documented with removal condition if used
