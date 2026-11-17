"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { MotionConfig } from "motion/react";

import { cn } from "@/lib/utils";
import { Toast } from "./toast";
import {
  toastStore,
  type ToastData,
  type ToastPosition,
  type ToastVariant,
} from "./toast-store";

// getServerSnapshot must return the same value on every call, or
// useSyncExternalStore re-renders forever.
const EMPTY: ToastData[] = [];

const POSITION_CLASSES: Record<ToastPosition, string> = {
  "top-left": "top-0 left-0 sm:items-start",
  "top-center": "top-0 left-1/2 -translate-x-1/2 sm:items-center",
  "top-right": "top-0 right-0 sm:items-end",
  "bottom-left": "bottom-0 left-0 flex-col-reverse sm:items-start",
  "bottom-center":
    "bottom-0 left-1/2 -translate-x-1/2 flex-col-reverse sm:items-center",
  "bottom-right": "bottom-0 right-0 flex-col-reverse sm:items-end",
};

const PEEK = 14; // px each card behind peeks out when collapsed
const GAP = 14; // px between cards when expanded
const SCALE_STEP = 0.05; // scale reduction per card behind
const MAX_VISIBLE = 3; // cards shown before the rest fade out when collapsed

export interface ToasterProps {
  /** Default position for toasts that don't set their own. */
  position?: ToastPosition;
  /** Show toasts as a flat list instead of a collapsible stack. */
  expand?: boolean;
  /** Default color variant for toasts that don't set their own. */
  variant?: ToastVariant;
}

export function Toaster({
  position = "bottom-right",
  expand = false,
  variant = "minimal",
}: ToasterProps) {
  const toasts = React.useSyncExternalStore(
    toastStore.subscribe,
    toastStore.getSnapshot,
    () => EMPTY,
  );
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const [heights, setHeights] = React.useState<Record<string | number, number>>(
    {},
  );
  const [expandedMap, setExpandedMap] = React.useState<Record<string, boolean>>(
    {},
  );

  const reportHeight = React.useCallback((id: string | number, h: number) => {
    setHeights((prev) => (prev[id] === h ? prev : { ...prev, [id]: h }));
  }, []);

  const setGroupExpanded = React.useCallback((pos: string, val: boolean) => {
    setExpandedMap((prev) =>
      prev[pos] === val ? prev : { ...prev, [pos]: val },
    );
  }, []);

  if (!mounted) return null;

  const groups = new Map<ToastPosition, ToastData[]>();
  for (const t of toasts) {
    const pos = t.position ?? position;
    if (!groups.has(pos)) groups.set(pos, []);
    groups
      .get(pos)!
      .push({ ...t, position: pos, variant: t.variant ?? variant });
  }

  const stacked = !expand;

  return createPortal(
    <MotionConfig reducedMotion="user">
      {[...groups.entries()].map(([pos, items]) => {
        if (!stacked) {
          return (
            <ol
              key={pos}
              className={cn(
                "pointer-events-none fixed z-[100] flex max-h-screen w-full flex-col gap-2 p-4 sm:max-w-[380px]",
                POSITION_CLASSES[pos],
              )}
            >
              {items.map((t) => (
                <Toast
                  key={t.id}
                  toast={t}
                  anchorBottom={!pos.startsWith("top")}
                />
              ))}
            </ol>
          );
        }

        const anchorBottom = !pos.startsWith("top");
        const dir = pos.startsWith("top") ? 1 : -1;
        const groupExpanded = !!expandedMap[pos];
        const h = (id: string | number) => heights[id] ?? 40;

        const frontHeight = items[0] ? h(items[0].id) : 0;
        const visibleBehind = Math.min(items.length - 1, MAX_VISIBLE - 1);
        const total = items.reduce((s, t) => s + h(t.id), 0);
        const containerHeight = groupExpanded
          ? total + Math.max(0, items.length - 1) * GAP
          : frontHeight + visibleBehind * PEEK;

        return (
          // The stack's sized box is a <div> because an <ol> may only contain
          // <li> children.
          <div
            key={pos}
            className={cn(
              "pointer-events-none fixed z-[100] flex w-full p-4 sm:max-w-[380px]",
              POSITION_CLASSES[pos],
            )}
          >
            <ol
              onMouseEnter={() => setGroupExpanded(pos, true)}
              onMouseLeave={() => setGroupExpanded(pos, false)}
              className="pointer-events-auto relative w-full transition-[height] duration-300 ease-out"
              style={{ height: containerHeight }}
            >
              {items.map((t, i) => {
                let expandedOffset = 0;
                for (let k = 0; k < i; k++)
                  expandedOffset += h(items[k].id) + GAP;
                const stackY = groupExpanded
                  ? dir * expandedOffset
                  : dir * i * PEEK;
                const stackScale = groupExpanded ? 1 : 1 - i * SCALE_STEP;
                const stackOpacity = groupExpanded
                  ? 1
                  : i < MAX_VISIBLE
                    ? 1
                    : 0;
                return (
                  <Toast
                    key={t.id}
                    toast={t}
                    stacked
                    expanded={groupExpanded}
                    front={i === 0}
                    anchorBottom={anchorBottom}
                    stackY={stackY}
                    stackScale={stackScale}
                    stackOpacity={stackOpacity}
                    stackZ={items.length - i}
                    onHeight={reportHeight}
                  />
                );
              })}
            </ol>
          </div>
        );
      })}
    </MotionConfig>,
    document.body,
  );
}

export { toast } from "./toast-store";
