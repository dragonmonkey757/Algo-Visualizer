import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    files: ["src/**/*.js", "public/stepper/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        window:       "readonly",
        document:     "readonly",
        console:      "readonly",
        alert:        "readonly",
        localStorage: "readonly",
      },
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-undef":       "error",
      "no-console":     "off",
      "eqeqeq":         ["error", "always"],
      "curly":          ["error", "all"],
      "no-var":         "error",
      "prefer-const":   "warn",
      "semi":           ["warn", "always"],
      "quotes":         ["warn", "double", { avoidEscape: true }],
    },
  },
  {
    files: ["vite.config.*", ".*rc.js", ".eslintrc.*", "scripts/**"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
    },
  },
  {
    ignores: ["dist/", "node_modules/"],
  },
];