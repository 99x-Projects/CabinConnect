# Mob Elaboration Prompts

Reference prompts for use during Mob Elaboration sessions. Copy, adapt context, and paste into the AI tool. Log the output in `prompts/YYYY-MM-DD-feature.md`.

---

## 1. Break Down a Feature into Units

```
We are building CabinConnect — a cabin booking platform with a .NET 8 Web API backend,
React + TypeScript frontend, and Supabase (PostgreSQL) as the database.

Feature: <feature name>
Description: <brief description>

Break this feature down into the smallest independent Units of work that can be built,
tested, and deployed separately. For each Unit, output:
- Unit name
- One-sentence purpose
- Key acceptance criteria (Given/When/Then format)
- Dependencies on other Units

Do not include implementation details. Focus on behaviour.
```

---

## 2. Generate Acceptance Criteria

```
Context: CabinConnect — cabin booking platform. .NET 8 API, React/TypeScript frontend, Supabase.
Domain glossary: <paste relevant terms from guidelines/domain-glossary.md>

Unit: <unit name>
Description: <what it does>

Write acceptance criteria for this unit using strict Given/When/Then format.
Each criterion must be:
- Independently testable
- Free of implementation details
- Covering one behaviour per criterion

Also list the top 3 edge cases that acceptance criteria should cover for this unit.
```

---

## 3. Generate API Contract

```
Context: CabinConnect .NET 8 Web API. All endpoints require JWT auth unless marked public.
Follow RESTful conventions. Response envelopes: { data, error }.

Unit: <unit name>
Acceptance criteria: <paste ACs>

Design the API contract for this unit:
- HTTP method and path
- Request body schema (TypeScript types)
- Response body schema (TypeScript types)
- Error codes and when they occur
- Auth requirement

Do not generate implementation code — just the contract.
```

---

## 4. Generate Implementation Scaffold

```
Context: CabinConnect .NET 8 Web API using repository pattern.
- Controllers are thin; business logic lives in services
- EF Core / Dapper for data access (specify which)
- Follow naming conventions in rules/code-standards.md
- Security rules in rules/security.md apply

Unit: <unit name>
API contract: <paste contract>
Acceptance criteria: <paste ACs>

Generate the scaffold for this unit:
1. Domain model / entity changes (if any)
2. Repository interface and stub implementation
3. Service class with method signatures and business logic
4. Controller action wired to the service
5. Unit test stubs (xUnit) covering each AC

Include TODO comments where the implementer must fill in details.
Do not generate migrations.
```

---

## 5. Review AI Output

```
Review the following AI-generated code against these rules:
- Code standards: <paste key rules from rules/code-standards.md>
- Security: <paste key rules from rules/security.md>
- Acceptance criteria: <paste ACs>

Code:
<paste generated code>

Report:
1. Does it meet all acceptance criteria? List any gaps.
2. Does it violate any code standards? List each violation.
3. Does it violate any security rules? List each violation.
4. What would break if this code is wrong? (risk surface)
5. Suggested changes (be specific — file, line, what to change).
```
