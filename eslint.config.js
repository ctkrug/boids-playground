const rules = {
  'no-unused-vars': 'error',
  'no-undef': 'error',
};

export default [
  { ignores: ['site/**'] },
  {
    files: ['src/**/*.js', 'test/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        document: 'readonly',
        window: 'readonly',
        requestAnimationFrame: 'readonly',
        performance: 'readonly',
      },
    },
    rules,
  },
  {
    // Node build/tooling scripts, not shipped to the browser.
    files: ['build.js', 'scripts/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        process: 'readonly',
      },
    },
    rules,
  },
];
