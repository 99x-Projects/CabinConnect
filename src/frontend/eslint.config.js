// @ts-check
import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import react from 'eslint-plugin-react';
import unicorn from 'eslint-plugin-unicorn';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['dist', 'node_modules', 'coverage'],
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      unicorn,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // Ban class components (CLAUDE.md §3: functional components only)
      'no-restricted-syntax': [
        'error',
        {
          selector: "ClassDeclaration[superClass.name='Component']",
          message: 'Class components are not allowed. Use a function component.',
        },
        {
          selector: "ClassDeclaration[superClass.name='PureComponent']",
          message: 'Class components are not allowed. Use a function component.',
        },
        {
          selector: "ClassDeclaration[superClass.object.name='React']",
          message: 'Class components are not allowed. Use a function component.',
        },
      ],

      // Kebab-case filenames (CLAUDE.md §3)
      'unicorn/filename-case': [
        'error',
        {
          case: 'kebabCase',
          ignore: ['vite-env.d.ts'],
        },
      ],

      // No `any` without comment (CLAUDE.md §3)
      '@typescript-eslint/no-explicit-any': 'error',

      // Hygiene
      '@typescript-eslint/consistent-type-imports': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  {
    files: ['**/*.test.{ts,tsx}', 'src/test-setup.ts'],
    rules: {
      'unicorn/filename-case': 'off',
    },
  },
);
