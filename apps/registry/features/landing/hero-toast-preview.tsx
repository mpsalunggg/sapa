"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Toast } from "@/components/ui/sapa-toast/toast";
import type { ToastData } from "@/components/ui/sapa-toast/toast-store";
import { cn } from "@/lib/utils";

/** The hero pile renders the *real* <Toast>, so what visitors see is exactly
 *  what `shadcn add` gives them. Four cards, picked so that every content
 *  feature (title only, description, actions, progress) appears exactly once,
 *  each on a different type so the semantic tiles are all represented.
 *
 *  Two constraints worth keeping if you edit this list:
 *  - `id` must be a string. The store hands real toasts incrementing *numbers*,
 *    and closing a card calls toastStore.dismiss(id) — a string id can never
 *    collide with a live toast.
 *  - `createdAt` must be a constant, never Date.now(), or the server and client
 *    render different values and hydration mismatches. Nothing reads it.
 *  `duration: Infinity` keeps every card put: it skips the auto-dismiss timer
 *  and suppresses the thin timer bar along the bottom edge. */
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
    description: "sapa-toast.tar.gz — 4.2 MB",
    progress: 62,
    duration: Infinity,
    createdAt: 0,
  },
];

/** Ambient haze behind the pile, cycling through the four rich-color tokens. */
const GLOW = [
  "bg-sapa-success",
  "bg-sapa-info",
  "bg-sapa-warning",
  "bg-sapa-error",
] as const;

const GLOW_MS = 3000;
/** Grace period before a dismissed card comes back. */
const RESPAWN_MS = 600;

export function HeroToastPreview() {
  // Bumping a card's nonce changes its React key, which remounts it — that's how
  // a card the visitor swiped away re-enters with the component's own pop-in.
  const [nonces, setNonces] = useState<Record<string, number>>({});
  const [glow, setGlow] = useState(0);
  const hovered = useRef(false);
  const timers = useRef<number[]>([]);

  const respawn = useCallback((id: string) => {
    const t = window.setTimeout(() => {
      setNonces((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
    }, RESPAWN_MS);
    timers.current.push(t);
  }, []);

  useEffect(
    () => () => {
      for (const t of timers.current) window.clearTimeout(t);
    },
    [],
  );

  useEffect(() => {
    // Ambient loop only — hold a single colour for reduced-motion users.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setInterval(() => {
      if (hovered.current || document.hidden) return;
      setGlow((i) => (i + 1) % GLOW.length);
    }, GLOW_MS);
    return () => window.clearInterval(timer);
  }, []);

  // These cards live outside the store, so onDismiss/onAutoClose never fire for
  // them — <Toast>'s own onClosed is what brings a dismissed card back, whether
  // it was swiped, closed or answered with an action.

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
