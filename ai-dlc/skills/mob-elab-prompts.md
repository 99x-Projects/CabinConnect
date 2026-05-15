# Mob Elaboration Prompts

Reference prompts and the mandatory interactive protocol for Mob Elaboration sessions.

---

## Interactive Protocol — MANDATORY

A mob elaboration session is a conversation between the AI facilitator and the engineer. The AI must never decompose an entire feature in one response.

### Turn structure (strictly one unit per turn)

| Turn | AI does | AI stops and waits for |
|---|---|---|
| 1 | Proposes one candidate unit: name + one-sentence purpose | Human confirms, renames, or rejects the unit |
| 2 | Proposes acceptance criteria for that unit as a numbered list | Human adds, removes, or rewords ACs |
| 3 | Surfaces edge cases and open questions for that unit only | Human resolves or defers each item |
| 4 | Moves to next unit — repeats from Turn 1 | — |
| Final | Presents complete summary table of all agreed units | Human gives sign-off before any files are written |

### Rules the AI must never break

- Do not propose more than one unit per turn
- Do not write ACs before the human confirms the unit name
- Do not create files (unit files, elaboration record, backlog entries) until the human gives final sign-off
- Do not decide scope, edge cases, or AC wording unilaterally — surface as questions
- Do not move to the next unit until the human explicitly approves the current one

---

## Facilitation Prompts

### 1. Opening — Seed the session

Use this to brief the AI at the start of a session:

```
We are running a Mob Elaboration session for the following intent:

Intent: <intent name>
What: <paste the What section>
Success Looks Like: <paste the Success Looks Like section>
Assumptions: <paste the Assumptions section>
Out of Scope: <paste the Out of Scope section>

Follow the interactive protocol:
- Propose units one at a time. Do not list all units upfront.
- For each unit: propose name + purpose, wait for my confirmation,
  then propose ACs, wait for my approval, then surface edge cases.
- Do not create any files until I give final sign-off on all units.

Start by proposing the first unit.
```

---

### 2. Acceptance Criteria — per unit

After the human confirms a unit name, use this pattern:

```
Unit confirmed: <unit name>

Now propose the acceptance criteria in Given/When/Then format.
Rules:
- One behavior per criterion
- No implementation details
- Cover at least one unhappy path
- State the actor explicitly in every Given

List them numbered. I will approve, reword, or remove each one.
```

---

### 3. Edge Case Check — per unit

After ACs are agreed:

```
For the unit "<unit name>" with these ACs:
<paste agreed ACs>

What edge cases from guidelines/edge-cases.md apply?
Also, are there any new edge cases specific to this unit
that are not yet in that list?

Surface each as a question — do not add them to the unit
until I confirm they should be included.
```

---

### 4. Generate API Contract — after unit is fully agreed

```
Context: CabinConnect .NET Web API. All endpoints require JWT auth
unless explicitly marked public. Response shape: { data, error }.

Unit: <unit name>
Acceptance criteria:
<paste agreed ACs>

Design the API contract:
- HTTP method and path
- Request body schema (TypeScript types)
- Response body schema (TypeScript types)
- Error codes and when they occur
- Auth requirement

Do not generate implementation code — contract only.
```

---

### 5. Generate Implementation Scaffold — when ready to build

```
Context: CabinConnect .NET Web API — repository pattern, EF Core + Npgsql,
controllers are thin, business logic in services.
Naming conventions: rules/code-standards.md.
Security rules: rules/security.md.

Unit: <unit name>
API contract: <paste contract>
Acceptance criteria: <paste agreed ACs>

Generate the scaffold:
1. Domain model / entity changes (if any)
2. Repository interface method(s) and stub implementation
3. Service class with method signatures and business logic outline
4. Controller action wired to the service
5. xUnit test stubs — one per AC, named after the behavior

Include TODO comments where the implementer must fill in details.
Do not generate migrations.
```

---

### 6. Review AI Output

```
Review the following AI-generated code against:
- Code standards: <paste key rules from rules/code-standards.md>
- Security: <paste key rules from rules/security.md>
- Acceptance criteria: <paste agreed ACs>

Code:
<paste generated code>

Report:
1. Does it meet every acceptance criterion? List any gaps.
2. Does it violate any code standards? List each violation.
3. Does it violate any security rules? List each violation.
4. What would break if this code is wrong? (risk surface)
5. Specific changes needed — file, location, what to change.
```
