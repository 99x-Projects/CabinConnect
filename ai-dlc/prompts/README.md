# Prompt Audit Trail

This folder contains the prompt log for every AI-assisted feature. Each file is the audit record for one feature or session.

## Naming Convention

```
YYYY-MM-DD-<feature-slug>.md
```

Examples:
- `2025-07-01-cabin-availability-check.md`
- `2025-07-03-booking-creation.md`
- `2025-07-05-guest-auth-flow.md`

One file per feature (not per session). Append to the same file if you return to a feature across multiple sessions.

---

## File Template

```markdown
# Prompt Log: <Feature Name>

**Unit:** <link to unit definition>
**Date started:** YYYY-MM-DD
**Contributors:** <names or initials>

---

## Session YYYY-MM-DD

### Prompt
<paste the exact prompt used>

### Output Summary
<1-3 sentences on what the AI produced>

### Quality Gate Result
- Context: Pass / Fail
- Instruction: Pass / Fail
- Output: Pass / Fail
- Risk: Pass / Fail

### Changes Made to Output
<list any edits made to the AI output before accepting it, and why>

### Decision Notes
<anything surprising, a trade-off made, or a prompt that didn't work and why>
```

---

## Why This Exists

The prompt log is the audit trail for AI-DLC. It answers:
- What did we ask the AI to do?
- Did the output pass the quality gate?
- What did a human change before merging?
- Why did we make the decisions we made?

Do not skip this step. The log is reviewed during retrospectives to improve prompts and catch recurring AI failure modes.
