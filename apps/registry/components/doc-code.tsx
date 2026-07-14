"use client";

import { cn } from "@/lib/utils";
import { CopyButton } from "@/components/copy-button";
import { FrameworkTabs } from "@/components/framework-tabs";

function Code({
  code,
  html,
  filename,
}: {
  code: string;
  html: string;
  filename?: string;
}) {
  return (
    <div className="bg-muted/40 min-w-0 overflow-hidden rounded-lg border">
      <div className="flex items-center justify-between border-b px-3 py-1.5">
        <span className="text-muted-foreground font-mono text-xs">
          {filename ?? ""}
        </span>
        <CopyButton value={code} />
      </div>
      <div
        className={cn(
          "shiki-code overflow-x-auto p-3 font-mono text-xs leading-relaxed",
        )}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

export function DocCode({
  reactCode,
  vueCode,
  reactHtml,
  vueHtml,
  reactFilename,
  vueFilename,
}: {
  reactCode: string;
  vueCode: string;
  reactHtml: string;
  vueHtml: string;
  reactFilename?: string;
  vueFilename?: string;
}) {
  return (
    <FrameworkTabs
      react={
        <Code code={reactCode} html={reactHtml} filename={reactFilename} />
      }
      vue={<Code code={vueCode} html={vueHtml} filename={vueFilename} />}
    />
  );
}
