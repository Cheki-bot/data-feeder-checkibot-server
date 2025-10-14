// ESLint Flat Config for ESM Node project
import js from '@eslint/js';
import globals from 'globals';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
  {
    ignores: ['node_modules', 'dist', 'coverage', '.husky'],
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      ...js.configs.recommended.rules,

      // Project-specific tweaks
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': 'off',
      'prefer-const': 'warn',
    },
  },
  // Disable formatting-related rules in favor of Prettier
  {
    rules: {
      'arrow-parens': 'off',
      'max-len': 'off',
      'no-mixed-spaces-and-tabs': 'off',
    },
  },
  eslintConfigPrettier,
];
