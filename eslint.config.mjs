import js from '@eslint/js';
import globals from 'globals';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import reactPlugin from 'eslint-plugin-react';
import importPlugin from 'eslint-plugin-import';
import nextPlugin from '@next/eslint-plugin-next';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import { FlatCompat } from '@eslint/eslintrc';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// Combine Next.js and Prettier configs
const nextAndPrettierConfig = [...compat.extends('next/core-web-vitals'), ...compat.extends('prettier')];

export default [
  // Config for plain JavaScript files
  {
    files: ['*.js', '*.mjs', '*.cjs'],
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
  },
  ...nextAndPrettierConfig,
  {
    // TypeScript and React files
    files: ['**/*.{ts,tsx,jsx}'],
    plugins: {
      react: reactPlugin,
      'jsx-a11y': jsxA11y,
      'react-hooks': reactHooks,
      import: importPlugin,
      next: nextPlugin,
      '@typescript-eslint': tseslint,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
      next: {
        rootDir: '.',
      },
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx'],
      },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
        node: true,
      },
    },
    rules: {
      // TypeScript specific rules
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'warn',

      // React rules
      'react/function-component-definition': [
        'warn',
        {
          namedComponents: 'arrow-function',
        },
      ],
      'react/jsx-pascal-case': 'warn',
      'react/jsx-filename-extension': [
        1,
        {
          extensions: ['.jsx', '.tsx'],
        },
      ],
      'react/jsx-key': 'warn',
      'react/no-array-index-key': 'warn',
      'react/self-closing-comp': 'warn',
      'react/jsx-sort-props': [
        'error',
        {
          ignoreCase: true,
        },
      ],

      // React Hooks rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Import rules
      'import/no-anonymous-default-export': 'warn',
      'import/no-extraneous-dependencies': 'error',
      'import/newline-after-import': 'error',
      'import/no-duplicates': 'error',
      'import/no-unresolved': 'error',
      'import/named': 'error',
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
      'jsx-a11y/accessible-emoji': 'warn',
      // General rules
      'no-console': [
        'warn',
        {
          allow: ['warn', 'error'],
        },
      ],
      'consistent-return': 'error',

      // Prettier-compatible rules
      'max-len': ['warn', { code: 120, ignoreUrls: true, ignoreStrings: true, ignoreTemplateLiterals: true }],
      quotes: ['warn', 'single', { avoidEscape: true, allowTemplateLiterals: true }],
      'jsx-quotes': ['error', 'prefer-single'],
    },
  },
  {
    files: ['e2e-tests/**/*', 'allure-report/**/*', 'app/**/*.{js,jsx,ts,tsx}'],
    rules: {
      'no-console': 'off',
      'consistent-return': 'off',
      'react/function-component-definition': [
        'warn',
        {
          namedComponents: 'function-declaration',
        },
      ],
    },
  },
  {
    ignores: [
      '**/node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'coverage/**',
      'allure-report/',
      'postcss.config.js',
      'tailwind.config.js',
      'next.config.js',
      '/eslint.config.mjs',
      'lib/auth/types.d.ts',
      'lib/constants/errors/errors.ts',
      'save/**',
      '**/.git/**',
      '**/dist/**',
      'tests-examples/**',
      'eslint.config.mjs',
      'e2e-tests/**',
    ],
  },
];
