# Units

Instances of Units extracted from Mob Elaboration sessions. One file per Unit.

## File Naming

```
u-NNN-<short-slug>.md
```

Example: `u-001-tenant-data-model.md`

`U-NNN` is the globally unique Unit ID; the slug is a short kebab-case description.

## Creating a New Unit

1. Copy [`../../../skills/unit-template.md`](../../../skills/unit-template.md) into this folder under the naming convention above
2. Fill in: Context, Acceptance Criteria (Given/When/Then), Scope (In/Out), Dependencies, Definition of Done
3. Tag the Unit with its **Owning Intent** (the CI it primarily belongs to)
4. Add the Unit to [`../backlog.md`](../backlog.md) with status `Open`
5. Update the source Intent's *Extracted Units* table to link the new Unit file

## Don't

- Don't duplicate the Unit template into this folder. The skills folder is the canonical template; this folder holds instances only.
- Don't create Unit files for work that hasn't been through a Mob Elaboration session. ACs must originate from elaboration, not from a single engineer's interpretation.
