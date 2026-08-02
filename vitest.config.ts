import { fileURLToPath } from "node:url";

import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vitest/config";

const resolve = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  plugins: [vue()],
  // Both registry sources import `cn` from "@/lib/utils"; the React and Vue
  // copies are byte-identical, so one alias serves both test suites.
  resolve: {
    alias: { "@/lib/utils": resolve("./registry/react/lib/utils.ts") },
  },
  esbuild: { jsx: "automatic" },
  test: {
    environment: "jsdom",
    include: ["tests/**/*.test.{ts,tsx}"],
    setupFiles: ["tests/setup.ts"],
  },
});
