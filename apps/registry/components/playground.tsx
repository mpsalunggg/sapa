"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "next-themes";
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  useSandpack,
} from "@codesandbox/sandpack-react";

import { cn } from "@/lib/utils";
import {
  buildReactFiles,
  REACT_DEPENDENCIES,
  type RegistryFile,
} from "@/lib/playground-files";
import { GradientLoader } from "@/components/gradient-loader";

/** The editor + preview, with a gradient loading overlay until the Sandpack
 *  bundler finishes its first compile. Must render inside <SandpackProvider>. */
function EditorArea() {
  const { listen } = useSandpack();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // The bundler emits "done" when the preview has compiled + rendered.
    const unsub = listen((msg) => {
      if (msg.type === "done") setLoading(false);
    });
    // Safety net in case the "done" message is missed.
    const fallback = window.setTimeout(() => setLoading(false), 15000);
    return () => {
      unsub();
      window.clearTimeout(fallback);
    };
  }, [listen]);

  return (
    <div className="relative h-[660px] overflow-hidden rounded-md border-b">
      <div
        className={cn(
          "transition-opacity duration-300",
          loading && "pointer-events-none opacity-0",
        )}
      >
        <SandpackLayout style={{ flexDirection: "column" }}>
          <SandpackCodeEditor
            showTabs={false}
            showLineNumbers
            style={{ height: 360, flex: "none" }}
          />
          <SandpackPreview
            showOpenInCodeSandbox={false}
            showRefreshButton
            style={{ height: 300, flex: "none" }}
          />
        </SandpackLayout>
      </div>
      {loading && (
        <GradientLoader className="bg-background absolute inset-0 z-10 border" />
      )}
    </div>
  );
}

interface Variant {
  key: string;
  title: string;
  description: string;
}

export interface PlaygroundProps {
  variants: Variant[];
  /** variant key → example source (react/toast-<key>). */
  examples: Record<string, string>;
  toasterFiles: RegistryFile[];
  utilsFiles: RegistryFile[];
  /** Precompiled preview CSS (public/toast-preview.css). */
  previewCss: string;
}

const FRAMEWORKS = [
  { key: "react", label: "React", disabled: false },
  { key: "vue", label: "Vue", disabled: true },
] as const;

export function Playground({
  variants,
  examples,
  toasterFiles,
  utilsFiles,
  previewCss,
}: PlaygroundProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [active, setActive] = useState(variants[0]?.key ?? "default");
  const [layout, setLayout] = useState<"stack" | "list">("stack");
  const containerRef = useRef<HTMLDivElement>(null);

  const isDarkRef = useRef(isDark);
  isDarkRef.current = isDark;

  const built = useMemo(
    () =>
      buildReactFiles({
        example: examples[active] ?? "",
        toasterFiles,
        utilsFiles,
        previewCss,
        isDark: isDarkRef.current,
        expand: layout === "list",
      }),
    [active, examples, toasterFiles, utilsFiles, previewCss, layout],
  );

  // Keep the preview iframe's `.dark` class in sync when the site theme toggles,
  // via postMessage — no file rebuild, so edits survive the toggle.
  useEffect(() => {
    const post = () => {
      containerRef.current
        ?.querySelectorAll<HTMLIFrameElement>("iframe.sp-preview-iframe")
        .forEach((f) =>
          f.contentWindow?.postMessage(
            { __sapaTheme: true, dark: isDark },
            "*",
          ),
        );
    };
    post();
    const t = window.setTimeout(post, 500); // in case the iframe wasn't ready yet
    return () => window.clearTimeout(t);
  }, [isDark, active]);

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <aside className="lg:w-56 lg:shrink-0">
        {/* Framework switch — React active, Vue "coming soon" */}
        <p className="font-display text-muted-foreground mb-2 px-3 text-[0.95rem] italic">
          Framework
        </p>
        <div className="bg-muted/50 mb-6 inline-flex rounded-md border p-0.5 text-xs">
          {FRAMEWORKS.map((f) => (
            <button
              key={f.key}
              type="button"
              disabled={f.disabled}
              className={cn(
                "inline-flex items-center gap-1 rounded px-2.5 py-1 font-medium transition-colors",
                f.disabled
                  ? "text-muted-foreground/50 cursor-not-allowed"
                  : "bg-linear-to-br from-sapa-warning to-sapa-error text-white shadow-sm",
              )}
            >
              {f.label}
              {f.disabled && (
                <span className="bg-linear-to-br from-sapa-warning to-sapa-error rounded-sm px-1 py-0.5 text-[9px] font-semibold uppercase leading-none text-white">
                  Soon
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Layout switch — stack (default) vs flat list */}
        <p className="font-display text-muted-foreground mb-2 px-3 text-[0.95rem] italic">
          Layout
        </p>
        <div className="bg-muted/50 mb-6 inline-flex rounded-md border p-0.5 text-xs">
          {(["stack", "list"] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLayout(l)}
              className={cn(
                "rounded px-2.5 py-1 font-medium capitalize transition-colors",
                layout === l
                  ? "bg-linear-to-br from-sapa-warning to-sapa-error text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {l}
            </button>
          ))}
        </div>

        {/* Variant picker */}
        <p className="font-display text-muted-foreground mb-2 px-3 text-[0.95rem] italic">
          Variants
        </p>
        <ul className="flex flex-row flex-wrap gap-1 lg:flex-col">
          {variants.map((v) => (
            <li key={v.key}>
              <button
                type="button"
                onClick={() => setActive(v.key)}
                className={cn(
                  "relative block w-full rounded-md px-3 py-1.5 text-left text-sm transition-colors",
                  active === v.key
                    ? "bg-linear-to-r from-sapa-warning/15 to-sapa-error/10 text-foreground font-medium"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                )}
              >
                {active === v.key && (
                  <span
                    aria-hidden
                    className="bg-linear-to-b from-sapa-warning to-sapa-error absolute inset-y-1 left-0 hidden w-0.5 rounded-full lg:block"
                  />
                )}
                {v.title}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <div ref={containerRef} className="min-w-0 flex-1">
        <SandpackProvider
          key={`${active}-${layout}`}
          template="react-ts"
          theme={isDark ? "dark" : "light"}
          files={built.files}
          options={{
            activeFile: built.activeFile,
            visibleFiles: built.visibleFiles,
          }}
          customSetup={{ dependencies: REACT_DEPENDENCIES }}
        >
          <EditorArea />
        </SandpackProvider>
      </div>
    </div>
  );
}
