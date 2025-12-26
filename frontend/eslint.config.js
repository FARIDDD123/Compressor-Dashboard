import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import prettier from 'eslint-config-prettier'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'node_modules', 'build', 'coverage']),
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
      prettier, // Must be last to override other configs
    ],
    languageOptions: {
      ecmaVersion: 2022,
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      // Error prevention
      'no-unused-vars': ['error', { 
        varsIgnorePattern: '^[A-Z_]',
        argsIgnorePattern: '^_',
        ignoreRestSiblings: true,
      }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'no-alert': 'warn',
      'no-var': 'error',
      'prefer-const': 'error',
      'prefer-arrow-callback': 'warn',
      
      // Code quality
      'eqeqeq': ['error', 'always', { null: 'ignore' }],
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-return-assign': 'error',
      'no-self-compare': 'error',
      'no-sequences': 'error',
      'no-throw-literal': 'error',
      'no-unmodified-loop-condition': 'error',
      'no-unused-expressions': 'error',
      'no-useless-call': 'error',
      'no-useless-concat': 'error',
      'no-useless-return': 'error',
      'radix': 'error',
      'yoda': 'error',
      
      // Best practices
      'array-callback-return': 'error',
      'consistent-return': 'warn',
      'default-case': 'warn',
      'default-case-last': 'error',
      'dot-notation': 'warn',
      'no-caller': 'error',
      'no-else-return': ['warn', { allowElseIf: false }],
      'no-empty-function': 'warn',
      'no-implicit-coercion': 'warn',
      'no-lone-blocks': 'error',
      'no-multi-assign': 'error',
      'no-param-reassign': ['warn', { props: false }],
      'no-return-await': 'error',
      'no-shadow': ['warn', { hoist: 'all' }],
      'no-underscore-dangle': ['warn', { allow: ['_id', '__REDUX_DEVTOOLS_EXTENSION__'] }],
      'prefer-promise-reject-errors': 'error',
      'require-await': 'warn',
      
      // React specific
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      
      // Import/Export
      'no-duplicate-imports': 'error',
      'no-useless-rename': 'error',
      'object-shorthand': 'warn',
      
      // Style (will be handled by Prettier, but good to have)
      'brace-style': ['warn', '1tbs', { allowSingleLine: true }],
      'comma-dangle': ['warn', 'always-multiline'],
      'comma-spacing': 'warn',
      'comma-style': 'warn',
      'computed-property-spacing': 'warn',
      'func-call-spacing': 'warn',
      'key-spacing': 'warn',
      'keyword-spacing': 'warn',
      'no-multiple-empty-lines': ['warn', { max: 2, maxEOF: 1 }],
      'no-trailing-spaces': 'warn',
      'object-curly-spacing': ['warn', 'always'],
      'quotes': ['warn', 'single', { avoidEscape: true, allowTemplateLiterals: true }],
      'semi': ['warn', 'always'],
      'space-before-blocks': 'warn',
      'space-before-function-paren': ['warn', { anonymous: 'always', named: 'never', asyncArrow: 'always' }],
      'space-in-parens': 'warn',
      'space-infix-ops': 'warn',
      'space-unary-ops': 'warn',
      'spaced-comment': ['warn', 'always', { exceptions: ['-', '+'], markers: ['/'] }],
    },
  },
  // TypeScript files
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      // TypeScript specific rules can be added here
      '@typescript-eslint/no-unused-vars': ['error', { 
        varsIgnorePattern: '^[A-Z_]',
        argsIgnorePattern: '^_',
      }],
    },
  },
])
