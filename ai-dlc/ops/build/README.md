# Build Phase

The Build phase takes Units extracted during Inception and ships them as working, tested code. It is structured around three artifacts:

```
build/
  backlog.md         ← single live index of all Units, statuses, Bolt assignments
  units/             ← one canonical file per Unit (instance), drafted from skills/unit-template.md
  bolts/             ← one file per Bolt — a batch of related Units shipped together
```

## How Build Maps to AI-DLC

| Step | Output |
|---|---|
| 1. Triage | New Units enter `backlog.md` with status `Open` |
| 2. Plan a Bolt | Select 3–8 related Units from the backlog; create a Bolt file; flip those Units to `Planned` |
| 3. Execute the Bolt (Mob Construction ritual) | For each Unit: API contract → scaffold → fill TODOs → tests → self-review. Unit status: `In Progress` → `Done`. |
| 4. Close the Bolt | All Units `Done`; trigger Retro in `ai-dlc/ops/operate/retros/bolt-NN.md`; flip Bolt status to `Complete` |

## Greenfield Bolt Order (Bolt 0 → Bolt 1 → Bolt N)

In a greenfield project, the first two Bolts have **special character** that should be recognised explicitly — see [`project-review/notes.md`](../../../project-review/notes.md) for the underlying principle:

| Bolt | Type | Drawn from | Ritual | Units |
|---|---|---|---|---|
| **Bolt 0 — Technical Scaffolding** | Scaffolding variant (`_template-scaffolding.md`) | [TFD](../inception/tfd/TFD.md) | Technical Foundation Review (TFR) | Checklist-style technical-verification ACs |
| **Bolt 1 — Foundation Bolt** | Feature-foundational | [Foundation Cluster Intents](../inception/elaborations/foundation/2026-05-19-session-1.md) | Mob Elaboration (multi-Intent cluster session) | Given/When/Then ACs; may exceed 3–8 Unit cap |
| **Bolt 2..N — Feature Bolts** | Feature (default `_template.md`) | One Intent per Bolt | Mob Elaboration (one session per Intent) | Standard Given/When/Then ACs |

This ordering is *not* canonical AI-DLC — it is a 99x convention specifically for greenfield. In brownfield / continued-development engagements, projects skip straight to Bolt N-style Bolts.

## Status Legend

| Status | Meaning |
|---|---|
| `Open` | In the backlog, not yet selected for a Bolt |
| `Planned` | Selected for a Bolt, not yet started |
| `In Progress` | Active in a Bolt |
| `Done` | Code merged; ACs verified; review checklist passed |
| `Deferred` | Pulled from a Bolt or backlog — see notes for reason |

## Templates

- **Unit template:** [`ai-dlc/skills/unit-template.md`](../../skills/unit-template.md) — canonical template for new Unit files
- **Bolt template:** [`bolts/_template.md`](bolts/_template.md) — for planning a new Bolt
