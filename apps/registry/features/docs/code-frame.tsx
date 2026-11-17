"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";
import { CopyButton } from "@/shared/components/copy-button";
import { FrameworkTabs } from "@/shared/framework/framework-tabs";

export interface CodeSnippet {
  code: string;
  html: string;
  filename?: string;
}

export function CodeFrame({
  code,
  html,
  filename,
  collapsible,
}: CodeSnippet & { collapsible?: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-muted/40 min-w-0 overflow-hidden rounded-lg border">
      <div className="flex items-center justify-between border-b px-3 py-1.5">
        {collapsible ? (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="text-muted-foreground hover:text-foreground text-xs font-medium"
          >
            {open ? "Hide code" : "Show code"}
          </button>
        ) : (
          <span className="text-muted-foreground font-mono text-xs">
            {filename ?? ""}
          </span>
        )}
        <CopyButton value={code} />
      </div>
      <div
        className={cn(
          "shiki-code overflow-x-auto p-3 font-mono text-xs leading-relaxed",
          collapsible && !open && "max-h-40 overflow-y-hidden opacity-70",
        )}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

export function FrameworkCodeFrame({
  react,
  vue,
  collapsible,
}: {
  react: CodeSnippet;
  vue: CodeSnippet;
  collapsible?: boolean;
}) {
  return (
    <FrameworkTabs
      react={<CodeFrame {...react} collapsible={collapsible} />}
      vue={<CodeFrame {...vue} collapsible={collapsible} />}
    />
  );
}
