// CabinConnect lint-staged. Delivered by U-T04.
//
// Order matters: Prettier first (formats), then ESLint (rules check).
// This avoids ESLint rules fighting Prettier's reformat.
//
// Note: .NET (StyleCop, dotnet format) tooling is scoped to Bolt 2 — the
// `backend/**/*.cs` rule lands here when the backend solution arrives.

export default {
  // TypeScript and JSX: format then lint
  '**/*.{ts,tsx}': ['prettier --write', 'eslint --fix --max-warnings=0'],

  // JSON, Markdown, YAML: format only
  '**/*.{json,md,yml,yaml}': ['prettier --write'],
};
