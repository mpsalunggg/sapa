import js from "@eslint/js";
import tseslint from "typescript-eslint";
import nextPlugin from "@next/eslint-plugin-next";
import reactHooks from "eslint-plugin-react-hooks";
import prettier from "eslint-config-prettier";
import globals from "globals";

export default tseslint.config(
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/dist/**",
      "**/.output/**",
      "**/.vite/**",
      "**/.turbo/**",
      "apps/registry/public/**",
      "**/*.tsbuildinfo",
    ],
  },

  // Base JS + TypeScript (non-type-checked) recommended rules.
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // Shared settings for all TS/TSX + React hooks rules.
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: { "react-hooks": reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
    },
  },

  // Next.js rules, scoped to the Next app.
  {
    files: ["apps/registry/**/*.{ts,tsx}"],
    plugins: { "@next/next": nextPlugin },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      // App Router has no `pages/` dir — this rule only applies to the Pages Router.
      "@next/next/no-html-link-for-pages": "off",
    },
  },

  // Node scripts.
  {
    files: ["scripts/**/*.{js,mjs,cjs}", "**/*.config.{js,mjs,cjs}"],
    languageOptions: { globals: { ...globals.node } },
  },

  // Turn off stylistic rules that conflict with Prettier (keep last).
  prettier,
);
