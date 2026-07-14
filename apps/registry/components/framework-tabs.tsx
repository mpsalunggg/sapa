"use client";

import { useFramework } from "@/components/framework-context";

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
