# Forbidden Zones

Files, modules, and patterns that the AI must **not** modify without explicit senior engineer approval. This file is checked during the review checklist before any code is presented.

---

| Zone | Path / Pattern | Reason | Approval required from |
|---|---|---|---|
| Supabase Migrations | `supabase/migrations/**` | Schema changes have irreversible production impact. A bad migration can corrupt data, drop constraints, or invalidate RLS policies across all environments. | Senior engineer — manual review and test in a staging environment required before merge |

---

## What "Approval Required" Means

The AI must not generate content for a forbidden zone file during a coding session, even if the unit's acceptance criteria seem to require it. Instead:

1. **Flag it** — note in the response that a migration change would be needed
2. **Describe it** — write what the migration should do in plain language (table name, column, constraint, RLS policy)
3. **Stop** — do not write the SQL. The engineer writes or reviews the migration manually.

If a unit cannot be completed without a migration change, the unit's Definition of Done must include a manual step: "Engineer writes and reviews the migration file."

---

## Adding New Forbidden Zones

When a retro or incident reveals that a file or pattern caused unintended side effects from AI modification, add it here. Format:

```
| [Zone name] | [path or glob] | [why it must be protected] | [who must approve] |
```

Update this file as part of the Post-Retro Improvement Workflow.
