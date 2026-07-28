"use client";

import { useEffect, useRef, useState } from "react";
import { Check, CircleAlert, Info, TriangleAlert, X } from "lucide-react";

const POOL = [
  {
    Icon: Check,
    label: "Operation successful!",
    chip: "bg-sapa-success",
    text: "text-sapa-success",
    ring: "border-sapa-success/50 shadow-sapa-success/10",
  },
  {
    Icon: Info,
    label: "Execute the operation",
    chip: "bg-sapa-info",
    text: "text-sapa-info",
    ring: "border-sapa-info/50 shadow-sapa-info/10",
  },
  {
    Icon: TriangleAlert,
    label: "Operation in progress",
    chip: "bg-sapa-warning",
    text: "text-sapa-warning",
    ring: "border-sapa-warning/50 shadow-sapa-warning/10",
  },
  {
    Icon: CircleAlert,
    label: "Operation unsuccessful",
    chip: "bg-sapa-error",
    text: "text-sapa-error",
    ring: "border-sapa-error/50 shadow-sapa-error/10",
  },
  {
    Icon: Info,
    label: "Copied to clipboard",
    chip: "bg-sapa-info",
    text: "text-sapa-info",
    ring: "border-sapa-info/50 shadow-sapa-info/10",
  },
  {
    Icon: Check,
    label: "Halo 👋 from Sapa",
    chip: "bg-sapa-success",
    text: "text-sapa-success",
    ring: "border-sapa-success/50 shadow-sapa-success/10",
  },
] as const;

// Sonner-style pile: collapsed cards peek 14px above the front card with a
// shrinking scale; hovering the group expands them into a flat list.
const STACK = [
  "z-40",
  "z-30 -translate-y-[14px] scale-95 group-hover:-translate-y-[56px] group-hover:scale-100",
  "z-20 -translate-y-[28px] scale-90 group-hover:-translate-y-[112px] group-hover:scale-100",
  "z-10 -translate-y-[42px] scale-[.85] group-hover:-translate-y-[168px] group-hover:scale-100",
] as const;

const MAX_VISIBLE = STACK.length;
const ARRIVAL_MS = 2500;

interface StackToast {
  uid: number;
  pool: number;
}

// Seeded with the first four pool entries so SSR/first paint shows a full pile.
const SEED: StackToast[] = [0, 1, 2, 3].map((i) => ({ uid: i, pool: i }));

export function HeroToastPreview() {
  const [toasts, setToasts] = useState<StackToast[]>(SEED);
  const hovered = useRef(false);
  const nextUid = useRef(SEED.length);

  useEffect(() => {
    // Ambient loop only — keep the pile static for reduced-motion users.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setInterval(() => {
      if (hovered.current || document.hidden) return;
      setToasts((prev) => {
        const uid = nextUid.current++;
        return [{ uid, pool: uid % POOL.length }, ...prev].slice(
          0,
          MAX_VISIBLE,
        );
      });
    }, ARRIVAL_MS);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="mx-auto w-full max-w-xs lg:ml-auto lg:mr-0">
      <div
        onMouseEnter={() => (hovered.current = true)}
        onMouseLeave={() => (hovered.current = false)}
        className="group relative h-[88px] transition-[height] duration-300 ease-out hover:h-[214px]"
      >
        {toasts.map(({ uid, pool }, i) => {
          const { Icon, label, chip, text, ring } = POOL[pool];
          return (
            <div
              key={uid}
              // Stagger the entrance only for the seeded cards; live arrivals pop in right away.
              style={{
                animationDelay: uid < SEED.length ? `${i * 90}ms` : "0ms",
              }}
              className={`bg-popover/95 animate-in fade-in slide-in-from-bottom-3 fill-mode-both absolute inset-x-0 bottom-0 flex items-center gap-2.5 rounded-full border p-2 pr-3.5 shadow-lg shadow-black/5 backdrop-blur transition-[translate,scale] duration-300 ease-out ${STACK[i]} ${ring}`}
            >
              <span
                className={`flex size-7 shrink-0 items-center justify-center rounded-full text-white ${chip}`}
              >
                <Icon className="size-4" strokeWidth={2.5} />
              </span>
              <span className={`truncate text-[13px] font-semibold ${text}`}>
                {label}
              </span>
              <X className="text-muted-foreground/60 ml-auto size-3.5 shrink-0" />
            </div>
          );
        })}
      </div>
      <p className="font-display text-muted-foreground mt-4 text-center text-sm italic">
        hover the stack — it expands
      </p>
    </div>
  );
}
