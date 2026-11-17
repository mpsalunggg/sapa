"use client";

import { useEffect, useRef, useState } from "react";

import { Toast } from "@/components/ui/sapa-toast/toast";
import type { ToastData } from "@/components/ui/sapa-toast/toast-store";
import { cn } from "@/lib/utils";

const HERO_TOASTS: ToastData[] = [
  {
    id: "hero-deploy",
    type: "success",
    title: "Deployed to production",
    duration: Infinity,
    createdAt: 0,
  },
  {
    id: "hero-storage",
    type: "warning",
    title: "Storage almost full",
    description: "92% of 20 GB used on acme-eu-west",
    duration: Infinity,
    createdAt: 0,
  },
  {
    id: "hero-build",
    type: "error",
    title: "Build failed",
    description: "3 type errors in toast.tsx",
    action: { label: "Retry" },
    cancel: { label: "Dismiss" },
    duration: Infinity,
    createdAt: 0,
  },
  {
    id: "hero-upload",
    type: "loading",
    title: "Uploading assets…",
    description: "sapa-toast.tar.gz · 4.2 MB",
    progress: 62,
    duration: Infinity,
    createdAt: 0,
  },
];

const GLOW = [
  "bg-sapa-success",
  "bg-sapa-info",
  "bg-sapa-warning",
  "bg-sapa-error",
] as const;

const GLOW_MS = 3000;
const RESPAWN_MS = 600;

export function HeroToastPreview() {
  const [nonces, setNonces] = useState<Record<string, number>>({});
  const [glow, setGlow] = useState(0);
  const hovered = useRef(false);
  const timers = useRef<number[]>([]);

  const respawn = (id: string) => {
    const t = window.setTimeout(() => {
      setNonces((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
    }, RESPAWN_MS);
    timers.current.push(t);
  };

  useEffect(
    () => () => {
      for (const t of timers.current) window.clearTimeout(t);
    },
    [],
  );

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setInterval(() => {
      if (hovered.current || document.hidden) return;
      setGlow((i) => (i + 1) % GLOW.length);
    }, GLOW_MS);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="mx-auto w-full max-w-sm lg:ml-auto lg:mr-0">
      <div
        onMouseEnter={() => (hovered.current = true)}
        onMouseLeave={() => (hovered.current = false)}
        className="relative"
      >
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute -inset-6 rounded-[3rem] opacity-25 blur-3xl transition-colors duration-1000",
            GLOW[glow],
          )}
        />
        <ol className="relative flex flex-col gap-3">
          {HERO_TOASTS.map((t) => (
            <Toast
              key={`${t.id}-${nonces[String(t.id)] ?? 0}`}
              toast={t}
              onClosed={() => respawn(String(t.id))}
            />
          ))}
        </ol>
      </div>
    </div>
  );
}
