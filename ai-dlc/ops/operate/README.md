# Operate Phase

Operate begins when a Bolt is complete and code is running. Its purpose is to learn from what was built and feed that learning back into Inception and Build.

## Steps

```
1. Hold a Retrospective after each Bolt
      ↓
2. Record Incidents when production issues occur
      ↓
3. File Improvements — updates to rules, guidelines, or skills
      ↓
4. Apply improvements — edit the relevant files in rules/ guidelines/ skills/
      ↓
5. New insights may trigger new Intents → back to Inception
```

## Folder Structure

```
operate/
  retros/         ← one file per bolt retrospective
  incidents/      ← one file per production incident
  improvements/   ← one file per rule/guideline/skill update
```

## The Feedback Loop

The Operate phase is not just housekeeping. Every incident or retrospective finding that isn't recorded as an Improvement is a lesson the team will re-learn the hard way.

| Finding type | Where it goes |
|---|---|
| AI got something consistently wrong | `improvements/` → update `rules/prompt-quality-gate.md` or `skills/mob-elab-prompts.md` |
| Production bug from an edge case | `incidents/` → update `guidelines/edge-cases.md` |
| Architecture decision revisited | `improvements/` → update `rules/architecture.md` |
| New domain term discovered | `improvements/` → update `guidelines/domain-glossary.md` |
| New feature need discovered | New Intent in `inception/intents/` |

## Cadence

- **Retrospective:** after every Bolt (required)
- **Incident records:** as incidents occur (required — do not batch)
- **Improvements:** as retrospectives and incidents generate them (required before closing the retro)
