import js from "@eslint/js";

export default [
  js.configs.recommended,

  // Frontend and PyScript code
  {
    files: ["src/**/*.js", "public/stepper/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        window: "readonly",
        document: "readonly",
        console: "readonly",
        alert: "readonly",
        localStorage: "readonly",
        fetch: "readonly",
        setTimeout: "readonly",
      },
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-undef": "error",
      "no-console": "off",
      "eqeqeq": ["error", "always"],
      "curly": ["error", "all"],
      "no-var": "error",
      "prefer-const": "warn",
      "semi": ["warn", "always"],
      "quotes": ["warn", "double", { avoidEscape: true }],
    },
  },

  // Node.js server
  {
    files: ["server/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: {
        require: "readonly",
        process: "readonly",
        console: "readonly",
        fetch: "readonly",
        setTimeout: "readonly",
      },
    },
    rules: {
      "no-undef": "error",
      "no-console": "off",
      "curly": ["error", "all"],
    },
  },

  {
    files: ["vite.config.*", ".*rc.js", ".eslintrc.*", "scripts/**"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        Option: "readonly",
      },
    },
  },

  {
    ignores: ["dist/", "node_modules/"],
  },
];