"use client";

import { CopyButton } from "@/components/copy-button";
import { FrameworkTabs } from "@/components/framework-tabs";

function Command({ cmd }: { cmd: string }) {
  return (
    <div className="bg-muted/40 flex min-w-0 items-center gap-2 rounded-lg border px-3 py-2 font-mono text-xs">
      <span className="text-muted-foreground select-none">$</span>
      <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap">
        {cmd}
      </code>
      <CopyButton value={cmd} className="shrink-0" />
    </div>
  );
}

export function InstallCommand({
  reactUrl,
  vueUrl,
}: {
  reactUrl: string;
  vueUrl: string;
}) {
  return (
    <FrameworkTabs
      react={<Command cmd={`npx shadcn@latest add ${reactUrl}`} />}
      vue={<Command cmd={`npx shadcn-vue@latest add ${vueUrl}`} />}
    />
  );
}
