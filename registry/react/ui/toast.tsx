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
  type CloseReason,
  type ToastData,
  type ToastPosition,
  type ToastType,
} from "./toast-store";

// Built-in glyphs — spin is applied at render time for the loading type.
const ICONS: Record<ToastType, React.ReactElement | null> = {
  default: null,
  success: <Check strokeWidth={2.5} />,
  error: <CircleAlert />,
  warning: <TriangleAlert />,
  info: <Info />,
  loading: <Loader2 />,
};

// Squared icon tile — soft semantic wash with a hairline of the same hue.
// This is where the type's color lives; the surface itself stays neutral.
const TILE: Record<ToastType, string> = {
  default: "bg-muted text-foreground border-border",
  success: "bg-sapa-success/10 text-sapa-success border-sapa-success/25",
  error: "bg-sapa-error/10 text-sapa-error border-sapa-error/25",
  warning: "bg-sapa-warning/10 text-sapa-warning border-sapa-warning/25",
  info: "bg-sapa-info/10 text-sapa-info border-sapa-info/25",
  loading: "bg-muted text-muted-foreground border-border",
};

// Bar colors, shared by the auto-dismiss timer and the determinate progress
// bar — both ride the card's bottom edge. default/loading have no semantic hue,
// so they fall back to the text color.
const BAR: Record<ToastType, string> = {
  default: "bg-foreground",
  success: "bg-sapa-success",
  error: "bg-sapa-error",
  warning: "bg-sapa-warning",
  info: "bg-sapa-info",
  loading: "bg-foreground",
};

// Close button — revealed on hover so a resting toast stays quiet.
const CLOSE =
  "focus-visible:ring-ring rounded-full p-1 opacity-0 transition-opacity hover:bg-black/5 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 group-hover:opacity-70 dark:hover:bg-white/10";

const SWIPE_THRESHOLD = 80;

/** Safe on the client only — Toast renders after the Toaster has mounted. */
function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

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
  /**
   * Fired once the exit animation is over. Works even when <Toast> is rendered
   * on its own, outside the store — unlike the store's onDismiss/onAutoClose.
   */
  onClosed?: (reason: CloseReason) => void;
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
  onClosed,
}: ToastProps) {
  const { id, type, duration = 4000, icon, jsx } = toast;

  // Resolve the leading icon; built-in glyphs are sized to fit the 30px tile.
  const rawIcon = icon ?? ICONS[type];
  const iconNode = React.isValidElement<{ className?: string }>(rawIcon)
    ? React.cloneElement(rawIcon, {
        className: cn(
          "size-4",
          type === "loading" && "animate-spin",
          rawIcon.props.className,
        ),
      })
    : rawIcon;

  // Skip enter/exit/drag animations for users who prefer reduced motion.
  const reduceMotion = prefersReducedMotion();

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
  const exitTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const rootRef = React.useRef<HTMLLIElement>(null);

  // `paused` and `state` are mirrored in refs because both guards are read more
  // than once per tick — one hover reaches this toast *and* its stack container,
  // and a setState value is not visible until the next render.
  const pausedRef = React.useRef(false);
  const closingRef = React.useRef(false);

  // Kept in a ref so `close` stays referentially stable: <Toaster> hands down a
  // fresh toast object on every render, and an unstable `close` would re-arm the
  // auto-dismiss timer each time.
  const onClosedRef = React.useRef(onClosed);
  onClosedRef.current = onClosed;

  const dir = dirTransform(toast.position);
  const exit = React.useRef(dir);
  // Centered top/bottom toasts are swiped vertically; others horizontally.
  const vertical =
    toast.position === "top-center" || toast.position === "bottom-center";

  const clearTimer = React.useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  /**
   * Starts the exit animation and hands the removal over to the store, which
   * fires onDismiss (always) and onAutoClose (timeouts only) once it drops the
   * toast. Repeat calls are ignored so a swipe racing the timer closes once.
   */
  const close = React.useCallback(
    (reason: CloseReason, swipe?: number) => {
      if (closingRef.current) return;
      closingRef.current = true;

      exit.current = swipe
        ? vertical
          ? `translateY(${swipe > 0 ? 260 : -260}%)`
          : `translateX(${swipe > 0 ? 130 : -130}%)`
        : dir;
      setState("closing");
      clearTimer();
      toastStore.dismiss(id, reason);

      exitTimer.current = setTimeout(
        () => onClosedRef.current?.(reason),
        reduceMotion ? 0 : 320,
      );
    },
    [id, dir, vertical, reduceMotion, clearTimer],
  );

  // A dismiss from application code only flags the toast in the store; mirror
  // that here so it animates out instead of vanishing.
  React.useEffect(() => {
    if (toast.closing) close("programmatic");
  }, [toast.closing, close]);

  React.useEffect(() => {
    const raf = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  React.useEffect(
    () => () => {
      if (exitTimer.current) clearTimeout(exitTimer.current);
    },
    [],
  );

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

  const startTimer = React.useCallback(() => {
    if (closingRef.current || !Number.isFinite(remaining.current)) return;
    startedAt.current = Date.now();
    clearTimer();
    timer.current = setTimeout(() => close("timeout"), remaining.current);
  }, [clearTimer, close]);

  React.useEffect(() => {
    remaining.current = duration;
    // Don't restart a hovered toast: a promise resolving under the cursor must
    // not undo the pause.
    if (!pausedRef.current) startTimer();
    return clearTimer;
    // Re-arm when the duration changes (e.g. promise resolves).
  }, [duration, startTimer, clearTimer]);

  const pause = React.useCallback(() => {
    // Without this guard the elapsed time is subtracted once per caller, and a
    // stacked toast gets two calls per hover — draining the remaining time.
    if (pausedRef.current || closingRef.current) return;
    pausedRef.current = true;
    setPaused(true);
    if (!Number.isFinite(remaining.current)) return;
    clearTimer();
    remaining.current = Math.max(
      0,
      remaining.current - (Date.now() - startedAt.current),
    );
  }, [clearTimer]);

  const resume = React.useCallback(() => {
    if (!pausedRef.current || closingRef.current) return;
    pausedRef.current = false;
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
      close("user", offset);
    } else {
      setOffset(0);
      resume();
    }
  };

  /** Clamped determinate progress, or null when this isn't a progress toast. */
  const pct =
    toast.progress == null ? null : Math.min(100, Math.max(0, toast.progress));

  // The auto-dismiss timer bar. A loading toast has no deadline to show, and a
  // real progress value beats a countdown for the same strip of pixels.
  const showProgress =
    Number.isFinite(duration) && type !== "loading" && pct == null;

  const dragged = dragging.current && offset !== 0;
  const style: React.CSSProperties = {
    touchAction: vertical ? "pan-x" : "pan-y",
    transition:
      dragged || reduceMotion
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
        "bg-popover/95 text-popover-foreground group pointer-events-auto flex w-full flex-col overflow-hidden rounded-[9px] border p-[14px] shadow-xl shadow-black/5 backdrop-blur",
        stacked
          ? cn("absolute inset-x-0", anchorBottom ? "bottom-0" : "top-0")
          : "relative",
        !dragging.current && "cursor-grab active:cursor-grabbing",
      )}
    >
      {jsx ? (
        // Custom content has no header row to hang the close button off, so it
        // keeps the absolute one — hence the padding reserved on the right.
        <>
          <div className="pr-6">{jsx}</div>
          <button
            type="button"
            aria-label="Close"
            onClick={() => close("user")}
            className={cn(CLOSE, "absolute right-2.5 top-2.5")}
          >
            <X className="size-4" />
          </button>
        </>
      ) : (
        <>
          {/* Header — the tile sits *beside* the title so the two read as one
              object; everything below it gets the card's full width. */}
          <div className="flex items-center gap-[10px]">
            {iconNode && (
              <span
                className={cn(
                  "flex size-[30px] shrink-0 items-center justify-center rounded-[8px] border",
                  TILE[type],
                )}
              >
                {iconNode}
              </span>
            )}
            {toast.title != null && (
              <div className="min-w-0 flex-1 text-sm font-semibold leading-tight">
                {toast.title}
              </div>
            )}
            <button
              type="button"
              aria-label="Close"
              onClick={() => close("user")}
              className={cn(CLOSE, "-mr-1 ml-auto shrink-0")}
            >
              <X className="size-4" />
            </button>
          </div>

          {toast.description != null && (
            <div className="mt-[11px] text-sm opacity-90">
              {toast.description}
            </div>
          )}

          {(toast.action || toast.cancel) && (
            <div className="mt-[11px] flex gap-2">
              {toast.action && (
                <button
                  type="button"
                  onClick={() => {
                    toast.action?.onClick?.();
                    close("action");
                  }}
                  className="bg-foreground text-background inline-flex h-7 items-center rounded-md px-2.5 text-xs font-medium transition-opacity hover:opacity-90"
                >
                  {toast.action.label}
                </button>
              )}
              {toast.cancel && (
                <button
                  type="button"
                  onClick={() => {
                    toast.cancel?.onClick?.();
                    close("action");
                  }}
                  className="hover:bg-muted inline-flex h-7 items-center rounded-md border px-2.5 text-xs font-medium transition-colors"
                >
                  {toast.cancel.label}
                </button>
              )}
            </div>
          )}
        </>
      )}

      {/* Both bars ride the bottom edge; overflow-hidden on the root clips them
          to the card's radius, so neither needs one of its own. */}
      {pct != null && (
        <div
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          className="bg-muted absolute inset-x-0 bottom-0 h-[3px]"
        >
          <div
            className={cn(
              "h-full transition-[width] duration-300 ease-out",
              BAR[type],
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}

      {showProgress && (
        <span
          key={duration}
          className={cn(
            "absolute inset-x-0 bottom-0 h-[3px] origin-left",
            BAR[type],
          )}
          style={{
            animation: reduceMotion
              ? "none"
              : `sapa-toast-progress ${duration}ms linear forwards`,
            animationPlayState:
              paused || dragging.current ? "paused" : undefined,
          }}
        />
      )}
    </li>
  );
}
