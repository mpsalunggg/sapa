"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  useSandpack,
} from "@codesandbox/sandpack-react";

import { cn } from "@/lib/utils";
import {
  buildPlaygroundFiles,
  PLAYGROUND_DEPENDENCIES,
  type FrameworkSources,
} from "@/features/playground/playground-files";
import { GradientLoader } from "@/features/playground/gradient-loader";
import {
  useThemeMode,
  useThemeOverrides,
} from "@/features/theming/theme-overrides-context";
import { resolveVars } from "@/features/theming/theme-tokens";
import { TOAST_LAYOUT_OPTIONS } from "@/features/toast/toast-layout-toggle";
import type { ToastLayout } from "@/features/toast/toast-layout-context";
import { SegmentedControl } from "@/shared/components/segmented-control";
import type { Framework } from "@/shared/framework/framework-context";
import { FRAMEWORK_OPTIONS } from "@/shared/framework/framework-switch";
import {
  ActiveBar,
  navItemClass,
  SidebarLabel,
} from "@/shared/components/sidebar";

function EditorArea() {
  const { listen } = useSandpack();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = listen((msg) => {
      if (msg.type === "done") setLoading(false);
    });
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
}

export interface PlaygroundProps {
  variants: readonly Variant[];
  react: FrameworkSources;
  vue: FrameworkSources;
  previewCss: string;
}

export function Playground({
  variants,
  react,
  vue,
  previewCss,
}: PlaygroundProps) {
  const isDark = useThemeMode() === "dark";
  const [active, setActive] = useState(variants[0]?.key ?? "default");
  const [layout, setLayout] = useState<ToastLayout>("stack");
  const [framework, setFramework] = useState<Framework>("react");
  const { overrides } = useThemeOverrides();
  const containerRef = useRef<HTMLDivElement>(null);

  const isDarkRef = useRef(isDark);
  isDarkRef.current = isDark;

  const built = useMemo(() => {
    const sources = framework === "vue" ? vue : react;
    return buildPlaygroundFiles(framework, {
      example: sources.examples[active] ?? "",
      libFiles: [...sources.toasterFiles, ...sources.utilsFiles],
      previewCss,
      isDark: isDarkRef.current,
      expand: layout === "list",
    });
  }, [framework, active, react, vue, previewCss, layout]);

  useEffect(() => {
    const vars = resolveVars(overrides, isDark ? "dark" : "light");
    const post = () => {
      containerRef.current
        ?.querySelectorAll<HTMLIFrameElement>("iframe.sp-preview-iframe")
        .forEach((f) =>
          f.contentWindow?.postMessage(
            { __sapaTheme: true, dark: isDark, vars },
            "*",
          ),
        );
    };
    post();
    const t = window.setTimeout(post, 500);
    return () => window.clearTimeout(t);
  }, [isDark, active, layout, framework, overrides]);

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <aside className="lg:w-56 lg:shrink-0">
        <SidebarLabel>Framework</SidebarLabel>
        <SegmentedControl
          options={FRAMEWORK_OPTIONS}
          value={framework}
          onChange={setFramework}
          className="mb-6"
        />

        <SidebarLabel>Layout</SidebarLabel>
        <SegmentedControl
          options={TOAST_LAYOUT_OPTIONS}
          value={layout}
          onChange={setLayout}
          className="mb-6"
        />

        <SidebarLabel>Variants</SidebarLabel>
        <ul className="flex flex-row flex-wrap gap-1 lg:flex-col">
          {variants.map((v) => (
            <li key={v.key}>
              <button
                type="button"
                onClick={() => setActive(v.key)}
                className={cn(
                  navItemClass(active === v.key),
                  "w-full text-left",
                )}
              >
                {active === v.key && <ActiveBar />}
                {v.title}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <div ref={containerRef} className="min-w-0 flex-1">
        <SandpackProvider
          key={`${framework}-${active}-${layout}`}
          template={framework === "vue" ? "vue-ts" : "react-ts"}
          theme={isDark ? "dark" : "light"}
          files={built.files}
          options={{
            activeFile: built.activeFile,
            visibleFiles: built.visibleFiles,
          }}
          customSetup={{
            dependencies: PLAYGROUND_DEPENDENCIES[framework],
          }}
        >
          <EditorArea />
        </SandpackProvider>
      </div>
    </div>
  );
}
