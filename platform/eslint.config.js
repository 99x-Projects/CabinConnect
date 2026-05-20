// CabinConnect ESLint flat config (ESLint 9.x).
// Delivered by U-T04. See TFD §6 and CLAUDE.md §7.

import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import prettierConfig from 'eslint-config-prettier';

export default [
  // Global ignores
  {
    ignores: [
      '**/dist/**',
      '**/build/**',
      '**/node_modules/**',
      'backend/**',          // .NET — covered by dotnet format + StyleCop
      'data-layer/migrations/**',
      '**/*.config.{js,ts}', // config files are exempt from strict rules
    ],
  },

  // Base JS rules everywhere
  js.configs.recommended,

  // TS rules — strict tier, applied to TS files
  ...tseslint.configs.strict,
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      // CLAUDE.md §7: `any` requires an explanation comment.
      // Override with `// eslint-disable-next-line @typescript-eslint/no-explicit-any -- <reason>`
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],
    },
  },

  // React rules — frontend + shared (shared exports React types)
  {
    files: ['frontend/**/*.{ts,tsx}', 'shared/**/*.ts'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooks,
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off', // React 17+ automatic JSX runtime
      'react/prop-types': 'off',          // TypeScript handles prop validation
    },
    settings: {
      react: { version: 'detect' },
    },
  },

  // Prettier — must be LAST to disable conflicting style rules
  prettierConfig,
];
