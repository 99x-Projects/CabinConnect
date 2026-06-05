# AI-DLC — How This Works

AI-DLC is the operating system for building CabinConnect with AI assistance. This file explains what the framework achieves and why each part exists.

---

## The Problem It Solves

AI coding tools are fast but unreliable without structure. They hallucinate APIs, drift from conventions, forget business rules across sessions, and produce code that passes tests but breaks in production. AI-DLC solves this by making the rules, the domain, and the process explicit — loaded into every AI session automatically.

---

## The Quality Loop

```
Intent
  → Mob Elaboration (design session + unit decomposition + AC sign-off)
    → Bolt Planning (execution order + risk assessment)
      → Unit Execution (quality gate + code generation + review)
        → Retro (what went wrong → improvement files)
          → Improvement (rules tightened for next Bolt)
            → next Intent
```

Every failure that is not encoded into a rule will recur. The retro is the compiler for the process.

---

## What Each File Does

### CLAUDE.md (repo root)
Loaded automatically by Claude Code in every session. Contains the behavioral contract: project identity, quality gate routing, code rules, domain language, edge cases, and process configuration. This is the single most important file.

### ai-dlc/rules/
The detailed rule files referenced by CLAUDE.md:
- `prompt-quality-gate.md` — the four-component gate run before every code generation
- `code-standards.md` — extracted conventions and anti-patterns for this stack
- `security.md` — never/always security rules for .NET + Supabase + React
- `architecture.md` — ADRs; every cross-cutting architectural decision
- `engagement.md` — signals of engineer disengagement; when and how to intervene

### ai-dlc/skills/
Interactive protocols invoked by name during sessions:
- `mob-elab-prompts.md` — the elaboration turn structure and facilitation prompts
- `review-checklist.md` — the 8-section checklist run before every output is presented
- `unit-template.md` — how to write a unit file
- `bolt-risk-assessment.md` — risk interrogation run before the first unit in a bolt
- `uat.md` — UAT script generation and sign-off recording
- `compact-docs.md` — archives old operational documents
- `root-cause-analysis.md` — 5-Whys on incidents and improvements
- `design-session.md` — Phase 0 of elaboration; API contracts and data model
- `progress-digest.md` — stakeholder-facing progress summary
- `process-health.md` — quantitative process metrics
- `dependency-audit.md` — third-party dependency security scan
- `knowledge-promotion.md` — promotes improvements to the base AI-DLC repo
- `new-engineer-induction.md` — 30-minute onboarding session for new engineers

### ai-dlc/guidelines/
Domain and process reference files:
- `domain-glossary.md` — canonical business terms; the language shared between humans and AI
- `edge-cases.md` — known failure modes; checked before every code generation
- `acceptance-patterns.md` — rules for writing testable ACs
- `dev-setup.md` — environment setup for new engineers
- `team-rollout.md` — multi-engineer workflows, branching, secrets management
- `forbidden-zones.md` — files the AI must never touch without senior approval
- `entry-points.md` — approved modules for AI Bolts to begin

### ai-dlc/ops/
Operational artifacts that accumulate over time:
- `inception/intents/` — one file per feature intent
- `inception/elaborations/` — one file per elaboration session
- `inception/designs/` — design session outputs (API contracts, data models)
- `inception/dependency-map.md` — cross-intent dependencies and shared interfaces
- `build/backlog.md` — master status of all units
- `build/units/` — one file per unit
- `build/bolts/` — one file per bolt
- `operate/retros/` — one file per completed bolt
- `operate/incidents/` — one file per production issue
- `operate/improvements/` — one file per process change triggered by retro/incident

### ai-dlc/prompts/
One file per feature. Every AI-assisted code session is logged here. This is the audit trail.

---

## Why the Retro Matters

The retro is not a formality. It is the mechanism by which the framework improves. Every finding that is not encoded as a rule, edge case, or anti-pattern will cause the same problem again. A retro that produces no improvement file means the next Bolt starts at the same quality baseline. Run it every time. Run it even when the Bolt went well.
