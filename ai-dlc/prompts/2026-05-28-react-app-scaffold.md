# Prompt log — react-app-scaffold

**Date:** 2026-05-28
**Unit:** [react-app-scaffold](../ops/build/units/react-app-scaffold.md)
**Bolt:** [repo-scaffold](../ops/build/bolts/repo-scaffold.md)
**Operator:** Hiran (with GitHub Copilot)

---

## Prompt (verbatim)

> Kick off Wave 1

Wave 1 of the `repo-scaffold` bolt comprises two parallel units: `dotnet-api-scaffold` and `react-app-scaffold`. This log covers the React half.

## Quality Gate

- **Context:** scaffold `src/frontend/` per [react-app-scaffold](../ops/build/units/react-app-scaffold.md) AC1–AC12 in an empty repo. No code in `src/frontend/` yet.
- **Constraints:** CLAUDE.md §3 (kebab-case files, no `any` without comment, functional components only, no Supabase JS yet, env vars only — no secrets). Out-of-scope: Supabase client, feature flags, TanStack Query, Zustand, Tailwind, Playwright.
- **Acceptance Criteria:** the 12 ACs in the unit file (build clean; strict TS with `noUncheckedIndexedAccess` + `noImplicitOverride`; `<App />` in `<React.StrictMode>`; ESLint bans class components; lint + format:check pass with zero warnings; `HealthPage` renders + calls `getHealth()`; `VITE_API_BASE_URL` typed; `src/api/client.ts` exposes `getHealth(): Promise<{ status: string }>` and throws typed `ApiError`; Vitest smoke test mocks `getHealth`; no `@supabase/supabase-js`; `.gitignore`/`.editorconfig`/`.nvmrc` committed; kebab-case files).
- **Output Format:** Vite + React 18 + TypeScript files at `src/frontend/`.

## Generated artifacts

Created at [src/frontend](../../src/frontend):

- Tooling: [package.json](../../src/frontend/package.json), [tsconfig.json](../../src/frontend/tsconfig.json), [tsconfig.node.json](../../src/frontend/tsconfig.node.json), [vite.config.ts](../../src/frontend/vite.config.ts), [eslint.config.js](../../src/frontend/eslint.config.js), [.prettierrc.json](../../src/frontend/.prettierrc.json), [.prettierignore](../../src/frontend/.prettierignore)
- Repo hygiene: [.gitignore](../../src/frontend/.gitignore), [.editorconfig](../../src/frontend/.editorconfig), [.nvmrc](../../src/frontend/.nvmrc), [.npmrc](../../src/frontend/.npmrc), [.env.example](../../src/frontend/.env.example), [.env.development](../../src/frontend/.env.development)
- Source: [index.html](../../src/frontend/index.html), [src/main.tsx](../../src/frontend/src/main.tsx), [src/app.tsx](../../src/frontend/src/app.tsx), [src/vite-env.d.ts](../../src/frontend/src/vite-env.d.ts), [src/api/client.ts](../../src/frontend/src/api/client.ts), [src/pages/health-page.tsx](../../src/frontend/src/pages/health-page.tsx), [src/pages/health-page.test.tsx](../../src/frontend/src/pages/health-page.test.tsx), [src/test-setup.ts](../../src/frontend/src/test-setup.ts)

## Acceptance verification

| AC | Result |
|---|---|
| AC1 — `npm ci && npm run build` clean | ✅ Build OK — 35 modules transformed in 1.17s, no warnings |
| AC2 — Vite + React 18 + TS strict | ✅ `strict: true`, `noUncheckedIndexedAccess: true`, `noImplicitOverride: true` in tsconfig.json |
| AC3 — `<App />` wrapped in `<React.StrictMode>` | ✅ main.tsx |
| AC4 — ESLint bans class components | ✅ `no-restricted-syntax` rule targets `ClassDeclaration[superClass.name=Component/PureComponent]` and `React.Component` |
| AC5 — `npm run lint` + `format:check` zero warnings | ✅ Both clean after one Prettier autoformat pass |
| AC6 — HealthPage on `/health` route, calls `getHealth()`, shows status or error | ✅ `app.tsx` routes `/health` → `HealthPage`; component shows "API: ok" or `role="alert"` error |
| AC7 — `VITE_API_BASE_URL` typed via `vite-env.d.ts` | ✅ `ImportMetaEnv` augmented |
| AC8 — `src/api/client.ts` exports `getHealth()` returning `Promise<{ status: string }>`, throws `ApiError` | ✅ `ApiError` class with `status: number`; `getHealth` returns typed promise |
| AC9 — Vitest test mocks `getHealth` and asserts success render | ✅ `health-page.test.tsx` passes (1 passed) |
| AC10 — `@supabase/supabase-js` NOT a dep | ✅ Not in package.json |
| AC11 — `.gitignore`, `.editorconfig`, `.nvmrc` committed | ✅ All present; `.nvmrc` pins Node 20; `.npmrc` enforces engine-strict |
| AC12 — Kebab-case filenames | ✅ Enforced via `unicorn/filename-case` (kebabCase); all source files comply |

Build/test transcript:
- `npm install` → 423 packages added (note: 5 moderate audit advisories from transitive deps; flagged for follow-up, no production code paths affected)
- `npm run lint` → exit 0, no output
- `npm run format:check` → ✅ after autoformat
- `npm run build` → built in 1.17s
- `npm test` → 1 passed (1)

## Deviations / decisions

- **Node version on dev box is v24, not 20 LTS.** `.nvmrc` still pins 20 (LTS = required floor). `engines.node: ">=20"` + `engine-strict=true` in `.npmrc` keeps the contract intact. Newer Node satisfies the constraint.
- **`tsconfig.json` initially included `vite.config.ts`** — caused TS6305 due to overlap with `composite: true` in `tsconfig.node.json`. Removed `vite.config.ts` from the root `include` so it lives solely in the Node project.
- **Prettier formatted `eslint.config.js` and `src/test-setup.ts`** on first pass; both were committed in their formatted form. Going forward, contributors should run `npm run format` before commit (pre-commit hook is out of scope for this unit; tracked separately).
- **5 moderate npm audit advisories** in transitive deps (likely `whatwg-encoding` deprecation chain). Not blocking. Suggested follow-up: schedule a dep-bump unit during a maintenance window.
- **No Husky / lint-staged.** Pre-commit enforcement is intentionally deferred — out of scope for this unit.

## Follow-ups / suggested improvements

- Add a pre-commit hook (Husky + lint-staged) to enforce `lint` + `format:check` locally. New unit candidate.
- Address npm audit advisories in a dedicated maintenance bolt.
- Add Playwright smoke for `/health` once a real API is reachable from CI.
