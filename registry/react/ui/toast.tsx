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
  type ToastSize,
  type ToastType,
  type ToastVariant,
} from "./toast-store";

// Built-in glyphs — size / spin are applied at render time from the size prop.
const ICONS: Record<ToastType, React.ReactElement | null> = {
  default: null,
  success: <Check strokeWidth={2.5} />,
  error: <CircleAlert />,
  warning: <TriangleAlert />,
  info: <Info />,
  loading: <Loader2 />,
};

// Colored "outline" treatment: tinted border + title + soft glow
// over a light surface — matches the pill reference design.
const OUTLINE: Record<ToastType, string> = {
  default: "",
  success: "border-sapa-success/50 shadow-lg shadow-sapa-success/10",
  error: "border-sapa-error/50 shadow-lg shadow-sapa-error/10",
  warning: "border-sapa-warning/50 shadow-lg shadow-sapa-warning/10",
  info: "border-sapa-info/50 shadow-lg shadow-sapa-info/10",
  loading: "",
};

// Solid colored surface (high contrast). default/loading stay neutral.
const FILLED: Record<ToastType, string> = {
  default: "",
  success:
    "bg-sapa-success text-sapa-success-foreground border-transparent shadow-lg shadow-sapa-success/20",
  error:
    "bg-sapa-error text-sapa-error-foreground border-transparent shadow-lg shadow-sapa-error/20",
  warning:
    "bg-sapa-warning text-sapa-warning-foreground border-transparent shadow-lg shadow-sapa-warning/20",
  info: "bg-sapa-info text-sapa-info-foreground border-transparent shadow-lg shadow-sapa-info/20",
  loading: "",
};

// Neutral surface + thick colored left bar (minimalist), tighter radius.
const ACCENT: Record<ToastType, string> = {
  default: "border-l-4",
  success: "border-l-4 border-l-sapa-success rounded-xl",
  error: "border-l-4 border-l-sapa-error rounded-xl",
  warning: "border-l-4 border-l-sapa-warning rounded-xl",
  info: "border-l-4 border-l-sapa-info rounded-xl",
  loading: "border-l-4 rounded-xl",
};

// Padding / gap per size (applied to the root <li>).
const SIZE_ROOT: Record<ToastSize, string> = {
  sm: "gap-2.5 p-3 pr-9",
  default: "gap-3 p-4 pr-10",
  lg: "gap-4 p-5 pr-12",
};
const SIZE_TITLE: Record<ToastSize, string> = {
  sm: "text-xs",
  default: "text-sm",
  lg: "text-base",
};
const SIZE_DESC: Record<ToastSize, string> = {
  sm: "text-xs",
  default: "text-sm",
  lg: "text-base",
};
const SIZE_CHIP: Record<ToastSize, string> = {
  sm: "size-7",
  default: "size-8",
  lg: "size-10",
};
const SIZE_GLYPH: Record<ToastSize, string> = {
  sm: "size-4",
  default: "size-5",
  lg: "size-6",
};

// Title text color when the outline variant is on.
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
  const { id, type, duration = 4000, richColors, icon, jsx } = toast;

  // Effective variant — `richColors: true` is a deprecated alias for "outline".
  const variant: ToastVariant =
    toast.variant ?? (richColors ? "outline" : "default");
  const size: ToastSize = toast.size ?? "default";

  // Variant classes applied last on the root <li> (tailwind-merge lets them win).
  const variantClass =
    variant === "outline"
      ? OUTLINE[type]
      : variant === "filled"
        ? FILLED[type]
        : variant === "accent"
          ? ACCENT[type]
          : "";

  // Icon chip: translucent on the filled surface, otherwise the solid chip.
  const chipClass =
    variant === "filled" ? "bg-white/20 text-current" : CHIP[type];

  // Resolve the leading icon, sizing built-in glyphs by the size prop.
  const rawIcon = icon ?? ICONS[type];
  const iconNode = React.isValidElement<{ className?: string }>(rawIcon)
    ? React.cloneElement(rawIcon, {
        className: cn(
          SIZE_GLYPH[size],
          type === "loading" && "animate-spin",
          rawIcon.props.className,
        ),
      })
    : rawIcon;

  // A "compact" toast (title only, no description/actions) centers its content
  // vertically against the icon; richer toasts top-align.
  const compact =
    !jsx &&
    !toast.description &&
    !toast.action &&
    !toast.cancel &&
    toast.progress == null;

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

  // Progress bar only on the larger (non-pill) toasts — pills stay clean.
  const showProgress =
    Number.isFinite(duration) && type !== "loading" && !compact;

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
        "bg-popover/95 text-popover-foreground group pointer-events-auto flex w-full gap-3 overflow-hidden border p-4 pr-10 shadow-xl shadow-black/5 backdrop-blur",
        stacked
          ? cn("absolute inset-x-0", anchorBottom ? "bottom-0" : "top-0")
          : "relative",
        compact ? "items-center rounded-full" : "items-start rounded-3xl",
        !dragging.current && "cursor-grab active:cursor-grabbing",
        SIZE_ROOT[size],
        variantClass,
      )}
    >
      {jsx ? (
        <div className="flex-1">{jsx}</div>
      ) : (
        <>
          {iconNode && (
            <span
              className={cn(
                "flex shrink-0 items-center justify-center rounded-full",
                SIZE_CHIP[size],
                !compact && "mt-0.5",
                chipClass,
              )}
            >
              {iconNode}
            </span>
          )}
          <div className="flex-1 space-y-1">
            {toast.title != null && (
              <div
                className={cn(
                  "font-semibold leading-tight",
                  SIZE_TITLE[size],
                  variant === "outline" && RICH_TEXT[type],
                )}
              >
                {toast.title}
              </div>
            )}
            {toast.description != null && (
              <div className={cn("opacity-90", SIZE_DESC[size])}>
                {toast.description}
              </div>
            )}
            {toast.progress != null && (
              <div
                role="progressbar"
                aria-valuenow={Math.min(100, Math.max(0, toast.progress))}
                aria-valuemin={0}
                aria-valuemax={100}
                className="bg-muted mt-2 h-1.5 w-full overflow-hidden rounded-full"
              >
                <div
                  className="from-sapa-warning to-sapa-error bg-linear-to-r h-full rounded-full transition-[width] duration-300 ease-out"
                  style={{
                    width: `${Math.min(100, Math.max(0, toast.progress))}%`,
                  }}
                />
              </div>
            )}
            {(toast.action || toast.cancel) && (
              <div className="mt-2 flex gap-2">
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
          </div>
        </>
      )}

      <button
        type="button"
        aria-label="Close"
        onClick={() => close("user")}
        className="focus-visible:ring-ring absolute right-2 top-2 rounded-full p-1 opacity-0 transition-opacity hover:bg-black/5 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 group-hover:opacity-70 dark:hover:bg-white/10"
      >
        <X className="size-4" />
      </button>

      {showProgress && (
        <span
          key={duration}
          className="absolute inset-x-3 bottom-1.5 h-1 origin-left rounded-full bg-current opacity-25"
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
