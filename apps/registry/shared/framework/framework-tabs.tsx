"use client";

import { useFramework } from "@/shared/framework/framework-context";

export function FrameworkTabs({
  react,
  vue,
}: {
  react: React.ReactNode;
  vue: React.ReactNode;
}) {
  const { framework } = useFramework();
  return <div className="min-w-0">{framework === "react" ? react : vue}</div>;
}
