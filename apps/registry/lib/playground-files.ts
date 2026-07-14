/**
 * Builds the virtual file map fed to Sandpack for the live playground.
 *
 * The toast components are styled with Tailwind v4 utilities + the sapa/shadcn
 * design tokens, but Sandpack's bundler does not run Tailwind. So the styles
 * are precompiled (scripts → public/toast-preview.css) and embedded directly
 * as a sandbox file (/styles.css) that the entry imports — the bundler then
 * includes it, so no external/cross-origin fetch is involved. Dark mode is
 * toggled by a listener in the bundled entry (/index.tsx).
 */

export interface RegistryFile {
  path: string;
  content: string;
}

/** Rewrite the repo's `@/…` alias specifiers to the flat relative paths we use
 *  inside the sandbox, and drop the Next-only "use client" directive. */
function rewriteImports(src: string): string {
  return src
    .replace(/^\s*["']use client["'];?\s*$/gm, "")
    .replaceAll("@/components/ui/sapa-toast/toaster", "./toaster")
    .replaceAll("@/components/ui/sapa-toast/toast-store", "./toast-store")
    .replaceAll("@/lib/utils", "./utils")
    .replace(/^\n+/, "");
}

function appTsx(expand: boolean): string {
  return `import { Toaster } from "./toaster";
import Example from "./Example";

export default function App() {
  return (
    <div className="grid min-h-screen place-items-center p-6">
      <Example />
      <Toaster position="bottom-right"${expand ? " expand" : ""} />
    </div>
  );
}
`;
}

/** Bundled entry: applies the initial theme and listens for live theme changes
 *  posted by the parent (playground.tsx), then renders <App/>. Runs in-bundle,
 *  so it executes reliably (unlike scripts in a custom index.html). */
function indexTsx(isDark: boolean): string {
  return `import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

document.documentElement.classList.toggle("dark", ${isDark ? "true" : "false"});
window.addEventListener("message", (e) => {
  if (e && e.data && e.data.__sapaTheme) {
    document.documentElement.classList.toggle("dark", !!e.data.dark);
  }
});

const root = createRoot(document.getElementById("root"));
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
`;
}

export const REACT_DEPENDENCIES: Record<string, string> = {
  "lucide-react": "latest",
  clsx: "latest",
  "tailwind-merge": "latest",
};

interface BuildInput {
  /** Selected example source (the react/toast-<key> file content). */
  example: string;
  /** The react/toaster item files (toast-store.ts, toast.tsx, toaster.tsx). */
  toasterFiles: RegistryFile[];
  /** The react/utils item files (utils.ts). */
  utilsFiles: RegistryFile[];
  /** Precompiled preview CSS (public/toast-preview.css contents). */
  previewCss: string;
  isDark: boolean;
  /** Flat-list layout instead of the collapsible stack. */
  expand: boolean;
}

interface PlaygroundFiles {
  files: Record<string, { code: string; readOnly?: boolean; active?: boolean }>;
  activeFile: string;
  visibleFiles: string[];
}

/** Assemble the Sandpack file map for the React playground. */
export function buildReactFiles({
  example,
  toasterFiles,
  utilsFiles,
  previewCss,
  isDark,
  expand,
}: BuildInput): PlaygroundFiles {
  const lib: PlaygroundFiles["files"] = {};
  for (const f of [...toasterFiles, ...utilsFiles]) {
    // Built paths are like "toast-store.ts" / "utils.ts" → flat at root.
    const name = f.path.split("/").pop() as string;
    lib[`/${name}`] = { code: rewriteImports(f.content), readOnly: true };
  }

  return {
    files: {
      "/index.tsx": { code: indexTsx(isDark), readOnly: true },
      "/App.tsx": { code: appTsx(expand), readOnly: true },
      "/Example.tsx": { code: rewriteImports(example), active: true },
      "/styles.css": { code: previewCss, readOnly: true },
      ...lib,
    },
    activeFile: "/Example.tsx",
    visibleFiles: ["/Example.tsx"],
  };
}
