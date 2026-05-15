# Inception Phase

Inception is where you capture what to build and collaboratively define it well enough to extract testable units.

## Steps

```
1. Write an Intent
      ↓
2. Run one or more Mob Elaboration sessions on that Intent
      ↓
3. Extract Units — add them to build/backlog.md with status Open
```

## Folder Structure

```
inception/
  intents/          ← one .md file per feature intent
  elaborations/     ← one .md file per mob elaboration session
```

## When Is Inception Done?

An intent is complete when:
- Every significant behaviour has a unit with acceptance criteria
- All units are recorded in [`build/backlog.md`](../build/backlog.md)
- Open questions from the elaboration are resolved or deferred to a future intent
- The intent file is marked `Status: Elaborated`

## Tips for Good Inception Sessions

- An intent should be outcome-oriented, not solution-oriented ("guests can find available cabins" not "build a search endpoint")
- Mob elaboration works best with 2-4 people and an AI facilitator using the prompts in [`skills/mob-elab-prompts.md`](../../skills/mob-elab-prompts.md)
- If a session produces more than 8 units, the intent is probably too broad — split it
- Edge cases should be recorded in [`guidelines/edge-cases.md`](../../guidelines/edge-cases.md) when discovered, not just in the elaboration notes
