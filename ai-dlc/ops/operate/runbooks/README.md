# Runbooks

Operational runbooks — step-by-step procedures for production-affecting tasks. Each runbook is written so a tired engineer can follow it at 2am after an incident.

## File naming

```
<verb>-<noun>.md
```

Examples: `rotate-supabase-key.md`, `restore-from-backup.md`, `revoke-visitor-link.md`.

## Runbook structure (template)

Each runbook follows the same shape:

1. **When to run** — triggering conditions
2. **Pre-flight checklist** — what must be true before starting
3. **Steps** — the actual procedure
4. **Post-flight verification** — how to confirm success
5. **Rollback** — what to do if it goes wrong
6. **Time budget** — how long this should take in practice

## Index

| Runbook | Trigger | Time budget |
|---|---|---|
| [rotate-supabase-key.md](rotate-supabase-key.md) | Suspected leak, 90-day cadence, departure of someone with access | ≤ 30 minutes |
