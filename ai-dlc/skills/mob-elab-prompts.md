# Mob Elaboration — Interactive Protocol

Read this file before every elaboration session. The design session (Phase 0) runs first, then unit decomposition. Do not skip Phase 0 even for small intents — it may conclude quickly if there is nothing new to design.

---

## Phase 0 — Design Session

Read `ai-dlc/skills/design-session.md` and run it at the opening of every elaboration session before proposing any units.

The design session scopes the intent's API contracts, data model, and architectural pattern decisions. It produces binding constraints that govern every unit and AC in the session. Output is written to `ai-dlc/ops/inception/designs/YYYY-MM-DD-[slug]-design.md` and linked back to the intent file. Any new architectural patterns agreed during the session are written to `ai-dlc/rules/architecture.md` as ADRs immediately.

---

## Mandatory Interactive Protocol

### Turn structure — strictly one unit per turn

1. **Propose one unit** — name and one-sentence purpose only. Stop and wait for human confirmation.
2. **Once confirmed**, propose the acceptance criteria as a numbered list. Stop and wait. The human may add, remove, or reword ACs.
3. **Once ACs are agreed**, surface edge cases and open questions for that unit only. Stop and wait.
4. **Ask the three observability questions:**
   - What confirms this unit is working correctly in production?
   - What log entry signals a failure for this unit?
   - What alert threshold makes sense for this unit?
   If an answer represents code behavior, add it as an AC. If not applicable, record "Not applicable" and move on. Stop and wait.
5. **Move to the next unit.** Repeat from step 1.
6. **After all units are agreed**, present the full summary table and ask for final sign-off before writing any files.

### Never do these during elaboration
- Do not decompose all units in a single response
- Do not write ACs before the human confirms the unit exists
- Do not create unit files, elaboration files, or update the backlog until the human gives final sign-off on the complete unit list
- Do not make scope or edge-case decisions unilaterally — surface them as questions
- Do not skip the observability questions

---

## Facilitation Prompts

### Proposing a unit
> "Next unit: **[Unit Name]** — [one sentence: what it does for the user or system].
> Does this unit belong in this intent, or should it be scoped differently?"

### Proposing ACs
> "Here are the proposed acceptance criteria for [Unit Name]:
> 1. Given [actor], when [action], then [outcome].
> 2. Given [actor], when [invalid/edge action], then [failure outcome].
> [etc.]
>
> Any additions, removals, or rewordings before we continue?"

### Surfacing edge cases
> "Edge cases to consider for [Unit Name]:
> - [EC-XXX or new scenario]: [brief description]
> - [...]
>
> Any others? Do any of these need to become ACs?"

### Observability questions
> "For [Unit Name]:
> - **Success signal:** What confirms this is working in production? (e.g., HTTP 201 logged, record visible in DB)
> - **Failure signal:** What log entry or error would indicate a failure?
> - **Alert threshold:** Should any metric alert on this? (e.g., >5 failures/min)
>
> Any of these that represent code behavior should be added as an AC."

### Generating implementation scaffold
After sign-off, when the engineer asks for the implementation:
> "I'll now generate the implementation for [Unit Name]. Reading `ai-dlc/rules/code-standards.md`, `ai-dlc/rules/security.md`, and `ai-dlc/guidelines/edge-cases.md` before proceeding.
>
> **Context:** [one line]
> **Constraints:** [one line]
> **Acceptance Criteria:** [count] ACs, including [count] failure paths
> **Output Format:** [what will be produced]"

### Reviewing output
After presenting code:
> "Before accepting: please verify each AC is traceable in the diff. Run the tests. Check that no files outside the unit's scope were modified. If anything looks wrong, tell me which AC is failing and I'll correct it."

---

## Post Sign-off — Dependency Map Update

After the engineer confirms sign-off on the unit summary table and **before writing any files**:

1. Read `ai-dlc/ops/inception/dependency-map.md`
2. Check whether this intent has:
   - **Prerequisites** — does it depend on another intent being Implemented first?
   - **Shared interfaces** — does it introduce or modify API contracts, data entities, or services shared with other intents?
3. Update the dependency map: add a row for this intent, record prerequisites and shared interfaces
4. Add a row to the Update Log in the map file
5. If a dependency on an incomplete intent is found, flag it to the engineer:
   > "This intent depends on [Intent Name] which is currently [status]. Do you want to proceed, or resolve the dependency first?"

Only after the dependency map is updated should you proceed to write unit files, update the backlog, and link the elaboration session.

---

## Summary Table Format

Present this after all units are agreed and before asking for sign-off:

```
| # | Unit Name | Purpose | ACs | Edge Cases | Observability |
|---|---|---|---|---|---|
| 1 | [name] | [one line] | AC1, AC2, AC3 | EC-001, EC-003 | Success: ...; Failure: ... |
| 2 | [name] | [one line] | AC1, AC2 | None new | Not applicable |
```

Then ask:
> "That's the full unit list for [Intent Name]. Any changes before I write the files?"
