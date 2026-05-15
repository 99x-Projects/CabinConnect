# Mob Elaborations

A **Mob Elaboration** is a structured session where the team (with AI) breaks down an Intent into Units. It is the primary knowledge-generation activity of the Inception phase.

## Folder Structure

Each intent gets its own subfolder. Sessions for that intent are files within it:

```
elaborations/
  <intent-slug>/
    YYYY-MM-DD-session-1.md
    YYYY-MM-DD-session-2.md   ← if the intent needs more than one session
```

## How to Run a Mob Elaboration

### Before the Session
- Intent is in `Ready` status
- Participants have read the intent
- Facilitator has the prompts from [`skills/mob-elab-prompts.md`](../../../skills/mob-elab-prompts.md) open

### During the Session (45-90 min)
1. Read the intent aloud — agree on what success looks like
2. Use **Prompt 1** (break down a feature into units) from mob-elab-prompts.md
3. For each candidate unit, challenge it: Is it independently testable? Is it the right size?
4. Use **Prompt 2** (generate acceptance criteria) for each surviving unit
5. Record all outputs and decisions in the session file
6. Note any edge cases discovered — add them to [`guidelines/edge-cases.md`](../../../guidelines/edge-cases.md)

### After the Session
- Create unit files in `build/units/` for each extracted unit
- Add units to `build/backlog.md` with status `Open`
- Update the Intent file's Elaboration Sessions and Extracted Units tables
- If the intent is fully elaborated, set its status to `Elaborated`

## Tips
- One unit = one independently deployable behaviour. If you can't deploy it alone, split it further.
- Disagreement during elaboration is valuable — it surfaces ambiguity before coding starts
- If a session runs over 90 minutes, the intent is too large. Split it.
