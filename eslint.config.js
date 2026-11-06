import js from "@eslint/js";
import globals from "globals";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactHooks from "eslint-plugin-react-hooks";

// Browser globals must never be touched during render (the page is pre-rendered in Node).
// Use them inside effects, event handlers or hooks/* (which only read them in subscriptions/effects).
const SSR_UNSAFE = ["window", "document", "localStorage", "sessionStorage", "matchMedia", "navigator", "location"].map(
  (name) => ({ name, message: `"${name}" is not available during pre-rendering. Read it in an effect or event handler.` }),
);

export default [
  { ignores: ["dist", "dist-ssr", "node_modules", ".lighthouseci", "coverage"] },
  js.configs.recommended,
  {
    files: ["**/*.{js,jsx,mjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.browser, ...globals.node, __BUILD_YEAR__: "readonly" },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { "jsx-a11y": jsxA11y, "react-hooks": reactHooks },
    rules: {
      ...jsxA11y.flatConfigs.strict.rules,
      // role="list" is deliberate: Safari/VoiceOver drops list semantics when list-style is none.
      "jsx-a11y/no-redundant-roles": ["error", { ul: ["list"], ol: ["list"] }],
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      // Capitalised names are JSX components (core ESLint can't see JSX usage).
      "no-unused-vars": ["error", { varsIgnorePattern: "^[A-Z_]", argsIgnorePattern: "^(_|[A-Z])" }],
    },
  },
  {
    // Components and sections: bare browser globals are banned at module/render level.
    // Effects and handlers access them as `window.*`, which this rule still allows via the member form.
    files: ["src/sections/**/*.jsx", "src/components/**/*.jsx", "src/App.jsx"],
    rules: { "no-restricted-globals": ["error", ...SSR_UNSAFE.filter((g) => g.name !== "window" && g.name !== "document")] },
  },
];
