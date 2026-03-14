module.exports = {
  'root': true,
  'env': { 'browser': true, 'es2020': true },
  'extends': [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  'ignorePatterns': ['dist', '.eslintrc.cjs'],
  'parser': '@typescript-eslint/parser',
  'plugins': ['react-refresh'],
  'overrides': [
    {
      'files': ['*.config.ts', 'playwright.config.ts', 'vitest.config.ts'],
      'rules': {
        'sort-imports': 'off',
      },
    },
    {
      'files': ['tests/**/*'],
      'rules': {
        'sort-imports': 'off',
        'line-comment-position': 'off',
        'no-var': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
      },
    },
  ],
  'rules': {
    'react-refresh/only-export-components': [
      'warn',
      { 'allowConstantExport': true },
    ],
    'no-debugger': 'off',

    'indent': [
      'error',
      2,
    ],
    'linebreak-style': [
      'error',
      'unix',
    ],
    'quotes': [
      'error',
      'single',
    ],
    'no-extra-parens': 'error',
    'no-template-curly-in-string': 'warn',

    'curly': 'error',
    'eqeqeq': 'error',
    'no-multi-spaces': 'error',

    'array-bracket-spacing': [ 'error', 'always' ],
    'block-spacing': 'error',
    'brace-style': 'error',
    'comma-dangle': [ 'error', 'always-multiline' ],
    'eol-last': 'error',
    'func-call-spacing': 'error',
    'key-spacing': 'error',
    'keyword-spacing': 'error',
    'line-comment-position': 'off',
    'no-multiple-empty-lines': 'error',
    'no-tabs': 'error',
    'no-trailing-spaces': 'error',
    'no-whitespace-before-property': 'error',
    'object-curly-spacing': [ 'error', 'always' ],
    'space-before-blocks': 'error',
    'space-before-function-paren': [ 'error', 'never' ],
    'space-in-parens': 'error',
    'space-unary-ops': 'error',

    'arrow-spacing': 'error',
    'generator-star-spacing': 'error',
    'no-duplicate-imports': 'error',
    'no-var': 'error',
    'prefer-const': 'error',
    'prefer-spread': 'error',
    'rest-spread-spacing': 'error',
    'sort-imports': 'off',
    'yield-star-spacing': 'error',

    '@typescript-eslint/no-duplicate-enum-values': 'error',
    "@typescript-eslint/no-unused-vars": 'off',
    "@typescript-eslint/no-explicit-any": 'off',
    'no-duplicate-imports': 'off',
  },
}
