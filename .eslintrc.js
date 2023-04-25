module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    'standard-with-typescript',
    'plugin:svelte/recommended'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    extraFileExtensions: ['.svelte']
  },

  overrides: [{
    files: ['*.svelte'],
    parser: 'svelte-eslint-parser',
    parserOptions: {
      parser: '@typescript-eslint/parser'
    }
  }],
  rules: {
    camelcase: 'off',
    indent: "off",
    quotes: ["error", "double", { "allowTemplateLiterals": true }],
    "svelte/indent": "error",
    semi: ["error", "always"]
  }
}
