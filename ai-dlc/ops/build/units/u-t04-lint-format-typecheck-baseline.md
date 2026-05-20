# Unit: U-T04 — Lint / format / typecheck baseline + pre-commit hooks

**Owning artifact:** [TFD §6 Tooling Baseline](../../inception/tfd/TFD.md)
**Status:** Done — 2026-05-19 (1 AC deferred to CI integration: combined lint+typecheck < 60s — measured by U-T02)
**Bolt:** Bolt 1 — UI Foundation *(re-scoped 2026-05-20 from Bolt 0)*
**Dependencies:** U-T01
**Prompt log:** [2026-05-19-u-t04-tooling-baseline.md](../../../prompts/2026-05-19-u-t04-tooling-baseline.md)
**Files delivered:** `.editorconfig` (repo root), `platform/eslint.config.js`, `platform/.prettierrc.json`, `platform/.husky/pre-commit`, `platform/lint-staged.config.js`, updates to `platform/package.json` (devDeps + scripts + prepare hook), updates to `platform/frontend/package.json` (real lint/format scripts).
**Out of scope (deferred to Bolt 2):** .NET tooling — `dotnet format`, StyleCop, `Directory.Build.props`, `global.json`. These were initially scoped in but the 2026-05-20 restructure moved them to Bolt 2 (where the backend lands).

---

## Context

The cheap-to-run checks that catch the highest-volume errors at the developer's keyboard (and at PR time) — typos, formatting, type errors, missing imports. Strictness is non-negotiable per CLAUDE.md §7 (TypeScript strict mode; no `any` without justification).

## Acceptance Criteria

- Given the repo is freshly set up, when `pnpm lint` runs from `platform/`, then ESLint reports zero errors on the scaffolded code across all workspaces.
- Given `pnpm typecheck` runs from `platform/`, then TypeScript reports zero errors with `strict: true` active across all workspaces.
- Given `dotnet format --verify-no-changes` runs in `platform/backend/`, then exit code is 0.
- Given a developer attempts to commit code that violates lint or format rules, when the pre-commit hook fires, then the commit is blocked with a clear, actionable error message.
- Given the pre-commit hook runs, when invoked, then it executes ONLY against staged files (lint-staged), not the whole repo — the developer experience is fast (< 5 seconds for a typical small commit).
- Given the CI pipeline runs the `lint` and `typecheck` jobs, when invoked, then both pass on the scaffolded code in under 60 seconds combined.
- Given a developer adds an `any` type without a `// eslint-disable-next-line` comment with explanation, when the lint runs, then the build fails.

## Scope

**In scope:**
- ESLint configuration at `platform/` with `@typescript-eslint/strict` preset
- Prettier configuration at `platform/` (single source of truth for formatting; ESLint defers to Prettier)
- `tsconfig.json` files in each TS workspace with `strict: true` and no opt-outs (`platform/frontend/`, `platform/shared/`)
- `.editorconfig` at repo root (applies to both process and product files)
- .NET formatting config + StyleCop ruleset at `platform/backend/` matching CLAUDE.md §7
- Husky + lint-staged setup at `platform/` for pre-commit
- CI integration of the lint and typecheck jobs (the job definitions; the workflow file is U-T02's territory)
- A rule that flags `any` without explanation

**Out of scope:**
- Custom lint rules that emerge from feature work
- Test framework configuration (covered separately when first tests land in Foundation Bolt)
- Code formatting on commit (out — we block, we don't auto-format on commit; developers run `--fix` explicitly)

## Definition of Done

- [ ] All ACs verified
- [ ] Pre-commit hook timing measured and confirmed < 5s for a small commit
- [ ] Prompt quality gate passed
- [ ] Code review complete
- [ ] No new lint or type errors
