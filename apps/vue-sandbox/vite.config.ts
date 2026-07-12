import { fileURLToPath, URL } from "node:url"

import tailwindcss from "@tailwindcss/vite"
import vue from "@vitejs/plugin-vue"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    // Order matters: the most specific aliases must come first.
    alias: [
      {
        find: "@/components/ui",
        replacement: fileURLToPath(
          new URL("../../registry/vue/ui", import.meta.url)
        ),
      },
      {
        find: "@/lib",
        replacement: fileURLToPath(
          new URL("../../registry/vue/lib", import.meta.url)
        ),
      },
      {
        find: "@",
        replacement: fileURLToPath(new URL("./src", import.meta.url)),
      },
    ],
  },
  server: { port: 5174 },
})
