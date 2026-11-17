import type { RegistryFile } from "@/shared/lib/registry";
import type { Framework } from "@/shared/framework/framework-context";

export interface FrameworkSources {
  examples: Record<string, string>;
  toasterFiles: RegistryFile[];
  utilsFiles: RegistryFile[];
}

export interface PlaygroundFiles {
  files: Record<string, { code: string; readOnly?: boolean; active?: boolean }>;
  activeFile: string;
  visibleFiles: string[];
}

interface BuildInput {
  example: string;
  libFiles: RegistryFile[];
  previewCss: string;
  isDark: boolean;
  expand: boolean;
}

export const PLAYGROUND_DEPENDENCIES: Record<
  Framework,
  Record<string, string>
> = {
  react: {
    "lucide-react": "latest",
    motion: "latest",
    clsx: "latest",
    "tailwind-merge": "latest",
  },
  vue: {
    "@lucide/vue": "latest",
    "motion-v": "latest",
    clsx: "latest",
    "tailwind-merge": "latest",
  },
};

function themeListener(isDark: boolean): string {
  return `document.documentElement.classList.toggle("dark", ${isDark});
window.addEventListener("message", (e) => {
  if (e && e.data && e.data.__sapaTheme) {
    document.documentElement.classList.toggle("dark", !!e.data.dark);
    if (e.data.vars) {
      for (const name in e.data.vars) {
        document.documentElement.style.setProperty(name, e.data.vars[name]);
      }
    }
  }
});`;
}

const toasterTag = (expand: boolean) =>
  `<Toaster position="bottom-right"${expand ? " expand" : ""} />`;

const TARGETS = {
  react: {
    root: "/",
    example: "Example.tsx",
    rewrite: (src: string) =>
      src
        .replace(/^\s*["']use client["'];?\s*$/gm, "")
        .replaceAll("@/components/ui/sapa-toast/toaster", "./toaster")
        .replaceAll("@/components/ui/sapa-toast/toast-store", "./toast-store")
        .replaceAll("@/lib/utils", "./utils")
        .replace(/^\n+/, ""),
    entry: (isDark: boolean) => [
      "index.tsx",
      `import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

${themeListener(isDark)}

const root = createRoot(document.getElementById("root"));
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
`,
    ],
    app: (expand: boolean) => [
      "App.tsx",
      `import { Toaster } from "./toaster";
import Example from "./Example";

export default function App() {
  return (
    <div className="grid min-h-screen place-items-center p-6">
      <Example />
      ${toasterTag(expand)}
    </div>
  );
}
`,
    ],
  },
  vue: {
    root: "/src/",
    example: "Example.vue",
    rewrite: (src: string) =>
      src
        .replaceAll("@/components/ui/sapa-toast/useToast", "./useToast")
        .replaceAll("@/lib/utils", "./utils"),
    entry: (isDark: boolean) => [
      "main.ts",
      `import { createApp } from "vue";
import App from "./App.vue";
import "./styles.css";

${themeListener(isDark)}

createApp(App).mount("#app");
`,
    ],
    app: (expand: boolean) => [
      "App.vue",
      `<script setup lang="ts">
import Toaster from "./Toaster.vue";
import Example from "./Example.vue";
</script>

<template>
  <div class="grid min-h-screen place-items-center p-6">
    <Example />
    ${toasterTag(expand)}
  </div>
</template>
`,
    ],
  },
} satisfies Record<
  Framework,
  {
    root: string;
    example: string;
    rewrite: (src: string) => string;
    entry: (isDark: boolean) => [string, string];
    app: (expand: boolean) => [string, string];
  }
>;

export function buildPlaygroundFiles(
  framework: Framework,
  { example, libFiles, previewCss, isDark, expand }: BuildInput,
): PlaygroundFiles {
  const {
    root,
    rewrite,
    entry,
    app,
    example: exampleName,
  } = TARGETS[framework];
  const [entryName, entryCode] = entry(isDark);
  const [appName, appCode] = app(expand);
  const examplePath = `${root}${exampleName}`;

  const files: PlaygroundFiles["files"] = {
    [`${root}${entryName}`]: { code: entryCode, readOnly: true },
    [`${root}${appName}`]: { code: appCode, readOnly: true },
    [examplePath]: { code: rewrite(example), active: true },
    [`${root}styles.css`]: { code: previewCss, readOnly: true },
  };
  for (const f of libFiles) {
    files[`${root}${f.path.split("/").pop()}`] = {
      code: rewrite(f.content),
      readOnly: true,
    };
  }

  return { files, activeFile: examplePath, visibleFiles: [examplePath] };
}
