"use client";

import * as React from "react";
import {
  Check,
  CircleAlert,
  Info,
  Loader2,
  TriangleAlert,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  toastStore,
  type ToastData,
  type ToastPosition,
  type ToastType,
} from "./toast-store";

const ICONS: Record<ToastType, React.ReactNode> = {
  default: null,
  success: <Check className="size-5" strokeWidth={2.5} />,
  error: <CircleAlert className="size-5" />,
  warning: <TriangleAlert className="size-5" />,
  info: <Info className="size-5" />,
  loading: <Loader2 className="size-5 animate-spin" />,
};

// Colored "outline" treatment (richColors): tinted border + title + soft glow
// over a light surface — matches the pill reference design.
const RICH_COLORS: Record<ToastType, string> = {
  default: "",
  success: "border-sapa-success/50 shadow-lg shadow-sapa-success/10",
  error: "border-sapa-error/50 shadow-lg shadow-sapa-error/10",
  warning: "border-sapa-warning/50 shadow-lg shadow-sapa-warning/10",
  info: "border-sapa-info/50 shadow-lg shadow-sapa-info/10",
  loading: "",
};

// Title text color when richColors is on.
const RICH_TEXT: Record<ToastType, string> = {
  default: "",
  success: "text-sapa-success",
  error: "text-sapa-error",
  warning: "text-sapa-warning",
  info: "text-sapa-info",
  loading: "",
};

// Solid colored icon circle (white glyph) per type.
const CHIP: Record<ToastType, string> = {
  default: "bg-muted text-foreground",
  success: "bg-sapa-success text-white",
  error: "bg-sapa-error text-white",
  warning: "bg-sapa-warning text-white",
  info: "bg-sapa-info text-white",
  loading: "bg-muted text-muted-foreground",
};

const SWIPE_THRESHOLD = 80;

// Enter/exit slide direction based on the toast's anchor position.
// `top-*` centers slide up, `bottom-*` centers slide down, corners slide sideways.
function dirTransform(position: ToastPosition = "bottom-right"): string {
  if (position.endsWith("left")) return "translateX(-115%)";
  if (position.endsWith("right")) return "translateX(115%)";
  return position.startsWith("top") ? "translateY(-250%)" : "translateY(250%)";
}

export interface ToastProps {
  toast: ToastData;
  /** Stacking layout (Sonner-style), driven by <Toaster>. */
  stacked?: boolean;
  expanded?: boolean;
  anchorBottom?: boolean;
  stackY?: number;
  stackScale?: number;
  stackOpacity?: number;
  stackZ?: number;
  onHeight?: (id: string | number, height: number) => void;
}

export function Toast({
  toast,
  stacked = false,
  expanded = false,
  anchorBottom = true,
  stackY = 0,
  stackScale = 1,
  stackOpacity = 1,
  stackZ = 1,
  onHeight,
}: ToastProps) {
  const { id, type, duration = 4000, richColors, icon, jsx } = toast;

  // A "compact" toast (title only, no description/actions) centers its content
  // vertically against the icon; richer toasts top-align.
  const compact = !jsx && !toast.description && !toast.action && !toast.cancel;

  const [state, setState] = React.useState<"open" | "closing">("open");
  const [shown, setShown] = React.useState(false);
  const [paused, setPaused] = React.useState(false);
  const [offset, setOffset] = React.useState(0);
  const dragging = React.useRef(false);
  const startX = React.useRef(0);
  const startY = React.useRef(0);
  const remaining = React.useRef(duration);
  const startedAt = React.useRef(Date.now());
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const rootRef = React.useRef<HTMLLIElement>(null);

  const dir = dirTransform(toast.position);
  const exit = React.useRef(dir);
  // Centered top/bottom toasts are swiped vertically; others horizontally.
  const vertical =
    toast.position === "top-center" || toast.position === "bottom-center";

  const close = React.useCallback(
    (swipe?: number) => {
      exit.current = swipe
        ? vertical
          ? `translateY(${swipe > 0 ? 260 : -260}%)`
          : `translateX(${swipe > 0 ? 130 : -130}%)`
        : dir;
      setState("closing");

      window.setTimeout(() => {
        toast.onAutoClose?.(toast);
        toastStore.dismiss(id);
      }, 320);
    },
    [id, toast, dir, vertical],
  );

  React.useEffect(() => {
    const raf = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // Report the measured height so the Toaster can lay out the stack.
  React.useEffect(() => {
    if (!stacked || !onHeight) return;
    const el = rootRef.current;
    if (!el) return;
    const report = () => onHeight(id, el.offsetHeight);
    report();
    const ro = new ResizeObserver(report);
    ro.observe(el);
    return () => ro.disconnect();
  }, [stacked, onHeight, id]);

  const clearTimer = React.useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  const startTimer = React.useCallback(() => {
    if (!Number.isFinite(remaining.current)) return;
    startedAt.current = Date.now();
    clearTimer();
    timer.current = setTimeout(close, remaining.current);
  }, [clearTimer, close]);

  React.useEffect(() => {
    remaining.current = duration;
    startTimer();
    return clearTimer;
    // Re-arm when the duration changes (e.g. promise resolves).
  }, [duration, startTimer, clearTimer]);

  const pause = React.useCallback(() => {
    setPaused(true);
    if (!Number.isFinite(remaining.current)) return;
    clearTimer();
    remaining.current -= Date.now() - startedAt.current;
  }, [clearTimer]);

  const resume = React.useCallback(() => {
    setPaused(false);
    startTimer();
  }, [startTimer]);

  // Pause every toast in the group while the stack is expanded (hovered).
  React.useEffect(() => {
    if (!stacked) return;
    if (expanded) pause();
    else resume();
  }, [expanded, stacked, pause, resume]);

  // --- swipe / drag to dismiss ---
  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    dragging.current = true;
    startX.current = e.clientX;
    startY.current = e.clientY;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    pause();
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    setOffset(
      vertical ? e.clientY - startY.current : e.clientX - startX.current,
    );
  };
  const onPointerUp = () => {
    if (!dragging.current) return;
    dragging.current = false;
    if (Math.abs(offset) > SWIPE_THRESHOLD) {
      close(offset);
    } else {
      setOffset(0);
      resume();
    }
  };

  // Progress bar only on the larger (non-pill) toasts — pills stay clean.
  const showProgress =
    Number.isFinite(duration) && type !== "loading" && !compact;

  const dragged = dragging.current && offset !== 0;
  const style: React.CSSProperties = {
    touchAction: vertical ? "pan-x" : "pan-y",
    transition: dragged
      ? "none"
      : "transform 320ms cubic-bezier(0.22, 1, 0.36, 1), opacity 320ms ease",
  };

  if (stacked) {
    style.zIndex = stackZ;
    if (state === "closing") {
      style.transform = exit.current;
      style.opacity = 0;
    } else if (dragged) {
      style.transform = vertical
        ? `translateY(${offset}px)`
        : `translateX(${offset}px)`;
      style.opacity = Math.max(0, 1 - Math.abs(offset) / 200);
    } else {
      style.transform = `translateY(${stackY}px) scale(${shown ? stackScale : 0.9})`;
      style.opacity = shown ? stackOpacity : 0;
    }
  } else {
    style.transform =
      state === "closing"
        ? exit.current // directional slide-out (by position / swipe)
        : dragged
          ? vertical
            ? `translateY(${offset}px)`
            : `translateX(${offset}px)`
          : shown
            ? undefined
            : "scale(0.96)"; // neutral pop-in on enter
    style.opacity =
      state === "closing"
        ? 0
        : dragged
          ? Math.max(0, 1 - Math.abs(offset) / 200)
          : shown
            ? 1
            : 0;
  }

  return (
    <li
      ref={rootRef}
      role="status"
      aria-live={type === "error" ? "assertive" : "polite"}
      aria-atomic="true"
      data-state={state}
      data-type={type}
      onMouseEnter={pause}
      onMouseLeave={resume}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      style={style}
      className={cn(
        "group pointer-events-auto flex w-full gap-3 overflow-hidden border bg-popover/95 p-4 pr-10 text-popover-foreground shadow-xl shadow-black/5 backdrop-blur",
        stacked
          ? cn("absolute inset-x-0", anchorBottom ? "bottom-0" : "top-0")
          : "relative",
        compact ? "items-center rounded-full" : "items-start rounded-3xl",
        !dragging.current && "cursor-grab active:cursor-grabbing",
        richColors && RICH_COLORS[type],
      )}
    >
      {jsx ? (
        <div className="flex-1">{jsx}</div>
      ) : (
        <>
          {(icon ?? ICONS[type]) && (
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-full",
                !compact && "mt-0.5",
                CHIP[type],
              )}
            >
              {icon ?? ICONS[type]}
            </span>
          )}
          <div className="flex-1 space-y-1">
            {toast.title != null && (
              <div
                className={cn(
                  "text-sm font-semibold leading-tight",
                  richColors && RICH_TEXT[type],
                )}
              >
                {toast.title}
              </div>
            )}
            {toast.description != null && (
              <div className="text-sm opacity-90">{toast.description}</div>
            )}
            {(toast.action || toast.cancel) && (
              <div className="mt-2 flex gap-2">
                {toast.action && (
                  <button
                    type="button"
                    onClick={() => {
                      toast.action?.onClick?.();
                      close();
                    }}
                    className="inline-flex h-7 items-center rounded-md bg-foreground px-2.5 text-xs font-medium text-background transition-opacity hover:opacity-90"
                  >
                    {toast.action.label}
                  </button>
                )}
                {toast.cancel && (
                  <button
                    type="button"
                    onClick={() => {
                      toast.cancel?.onClick?.();
                      close();
                    }}
                    className="inline-flex h-7 items-center rounded-md border px-2.5 text-xs font-medium transition-colors hover:bg-muted"
                  >
                    {toast.cancel.label}
                  </button>
                )}
              </div>
            )}
          </div>
        </>
      )}

      <button
        type="button"
        aria-label="Close"
        onClick={() => close()}
        className="absolute right-2 top-2 rounded-full p-1 opacity-0 transition-opacity hover:bg-black/5 group-hover:opacity-70 dark:hover:bg-white/10"
      >
        <X className="size-4" />
      </button>

      {showProgress && (
        <span
          key={duration}
          className="absolute inset-x-3 bottom-1.5 h-1 origin-left rounded-full bg-current opacity-25"
          style={{
            animation: `sapa-toast-progress ${duration}ms linear forwards`,
            animationPlayState:
              paused || dragging.current ? "paused" : undefined,
          }}
        />
      )}
    </li>
  );
}
