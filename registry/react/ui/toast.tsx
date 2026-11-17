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
import {
  AnimatePresence,
  motion,
  type PanInfo,
  type Transition,
} from "motion/react";

import { cn } from "@/lib/utils";
import {
  toastStore,
  type CloseReason,
  type ToastData,
  type ToastPosition,
  type ToastType,
  type ToastVariant,
} from "./toast-store";

// The loading glyph gets its spin at render time.
const ICONS: Record<ToastType, React.ReactElement | null> = {
  default: null,
  success: <Check strokeWidth={2.5} />,
  error: <CircleAlert />,
  warning: <TriangleAlert />,
  info: <Info />,
  loading: <Loader2 />,
};

// Each type sets two CSS variables: its color (--tone) and the text color that
// sits on it (--tone-fg). The variants are written once against them, so three
// variants over six types need three class lists instead of eighteen. default
// and loading use the text color as their tone: grey in subtle, inverted in solid.
const TONE: Record<ToastType, string> = {
  default: "[--tone:var(--foreground)] [--tone-fg:var(--background)]",
  success:
    "[--tone:var(--sapa-success)] [--tone-fg:var(--sapa-success-foreground)]",
  error: "[--tone:var(--sapa-error)] [--tone-fg:var(--sapa-error-foreground)]",
  warning:
    "[--tone:var(--sapa-warning)] [--tone-fg:var(--sapa-warning-foreground)]",
  info: "[--tone:var(--sapa-info)] [--tone-fg:var(--sapa-info-foreground)]",
  loading: "[--tone:var(--foreground)] [--tone-fg:var(--background)]",
};

interface VariantSlots {
  surface: string;
  tile: string;
  ring: string;
  track: string;
  bar: string;
  action: string;
  cancel: string;
}

const VARIANTS: Record<ToastVariant, VariantSlots> = {
  // Neutral glass surface; only the icon carries color.
  minimal: {
    surface:
      "bg-popover/90 text-popover-foreground border-border shadow-black/[0.06] backdrop-blur-xl",
    tile: "bg-(--tone)/12 text-(--tone)",
    ring: "stroke-(--tone)",
    track: "bg-muted",
    bar: "bg-(--tone)",
    action: "bg-foreground text-background hover:opacity-90",
    cancel: "border-border hover:bg-muted",
  },
  // An opaque tint of the tone, made for light, dense interfaces.
  subtle: {
    surface:
      "bg-[color-mix(in_oklab,var(--tone)_8%,var(--popover))] dark:bg-[color-mix(in_oklab,var(--tone)_14%,var(--popover))] text-popover-foreground border-(--tone)/20 shadow-(--tone)/[0.06]",
    tile: "bg-(--tone)/15 text-(--tone)",
    ring: "stroke-(--tone)",
    track: "bg-(--tone)/15",
    bar: "bg-(--tone)",
    action: "bg-foreground text-background hover:opacity-90",
    cancel: "border-(--tone)/25 hover:bg-(--tone)/10",
  },
  // Filled with the tone; the content switches to its foreground.
  solid: {
    surface:
      "bg-(--tone) text-(--tone-fg) border-transparent shadow-(--tone)/25",
    tile: "bg-(--tone-fg)/15 text-(--tone-fg)",
    ring: "stroke-(--tone-fg)",
    track: "bg-(--tone-fg)/20",
    bar: "bg-(--tone-fg)",
    action: "bg-(--tone-fg) text-(--tone) hover:opacity-90",
    cancel: "border-(--tone-fg)/30 hover:bg-(--tone-fg)/10",
  },
};

// The close button shows on hover so a resting toast stays quiet. bg-current
// keeps its hover wash visible on every variant's surface.
const CLOSE =
  "focus-visible:ring-ring rounded-full p-0.5 opacity-0 transition-opacity hover:bg-current/10 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 group-hover:opacity-70";

/** How long the bubble stays a pill before it opens to show the body. */
export const EXPAND_DELAY = 450;

const SWIPE_THRESHOLD = 80;
const SWIPE_VELOCITY = 500;

const RADIUS = { pill: 999, card: 22 } as const;

// `bounce` keeps the pop lively without wobbling.
const POP: Transition = { type: "spring", bounce: 0.3, duration: 0.5 };
const MORPH: Transition = { type: "spring", bounce: 0.18, duration: 0.55 };
const EXIT: Transition = { duration: 0.28, ease: [0.4, 0, 1, 1] };

// Client-only. Toast renders after the Toaster has mounted.
function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function alignClass(position: ToastPosition = "bottom-right"): string {
  if (position.endsWith("left")) return "justify-start";
  if (position.endsWith("right")) return "justify-end";
  return "justify-center";
}

export interface ToastProps {
  toast: ToastData;
  /** Stacked layout, driven by <Toaster>. */
  stacked?: boolean;
  expanded?: boolean;
  /** Front toast of a stack. Toasts behind it fold back into pills. */
  front?: boolean;
  anchorBottom?: boolean;
  stackY?: number;
  stackScale?: number;
  stackOpacity?: number;
  stackZ?: number;
  onHeight?: (id: string | number, height: number) => void;
  /**
   * Fires after the exit animation. Unlike the store's onDismiss/onAutoClose,
   * it also works for a <Toast> rendered on its own.
   */
  onClosed?: (reason: CloseReason) => void;
}

export function Toast({
  toast,
  stacked = false,
  expanded = false,
  front = true,
  anchorBottom = true,
  stackY = 0,
  stackScale = 1,
  stackOpacity = 1,
  stackZ = 1,
  onHeight,
  onClosed,
}: ToastProps) {
  const { id, type, duration = 4000, icon, jsx } = toast;
  const variant = toast.variant ?? "minimal";
  const v = VARIANTS[variant];

  // Built-in glyphs are sized to fit the 26px tile.
  const rawIcon = icon ?? ICONS[type];
  const iconNode = React.isValidElement<{ className?: string }>(rawIcon)
    ? React.cloneElement(rawIcon, {
        className: cn(
          "size-3.5",
          type === "loading" && "animate-spin",
          rawIcon.props.className,
        ),
      })
    : rawIcon;

  // Reduced motion skips the pill phase and every animation.
  const reduceMotion = prefersReducedMotion();

  const pct =
    toast.progress == null ? null : Math.min(100, Math.max(0, toast.progress));

  // A title-only toast has no body and stays a pill.
  const hasBody =
    toast.description != null ||
    toast.action != null ||
    toast.cancel != null ||
    pct != null;

  const [state, setState] = React.useState<"open" | "closing">("open");
  const [opened, setOpened] = React.useState(reduceMotion || jsx != null);
  const [paused, setPaused] = React.useState(false);
  const [swipe, setSwipe] = React.useState<number | null>(null);
  const remaining = React.useRef(duration);
  const startedAt = React.useRef(Date.now());
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const exitTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const rootRef = React.useRef<HTMLLIElement>(null);

  // Mirrored in refs: one hover reaches both this toast and its stack container
  // in the same tick, and a setState value is not visible until the next render.
  const pausedRef = React.useRef(false);
  const closingRef = React.useRef(false);

  // A ref keeps `close` stable. <Toaster> passes a new toast object on every
  // render, and an unstable `close` would re-arm the auto-dismiss timer.
  const onClosedRef = React.useRef(onClosed);
  onClosedRef.current = onClosed;

  // Centered toasts swipe vertically, corner toasts horizontally.
  const vertical =
    toast.position === "top-center" || toast.position === "bottom-center";

  // Behind the front card of a collapsed stack, a toast folds back to a pill.
  const isOpen =
    jsx != null || (opened && hasBody && (!stacked || front || expanded));
  const phase = isOpen ? "card" : "pill";

  const clearTimer = React.useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  // Starts the exit animation and hands removal to the store, which fires
  // onDismiss (always) and onAutoClose (timeouts only). Repeat calls are ignored
  // so a swipe racing the timer closes once.
  const close = React.useCallback(
    (reason: CloseReason, swipeOffset?: number) => {
      if (closingRef.current) return;
      closingRef.current = true;

      if (swipeOffset) setSwipe(swipeOffset);
      setState("closing");
      clearTimer();
      toastStore.dismiss(id, reason);

      exitTimer.current = setTimeout(
        () => onClosedRef.current?.(reason),
        reduceMotion ? 0 : 320,
      );
    },
    [id, reduceMotion, clearTimer],
  );

  // A dismiss from app code only flags the toast in the store. Mirroring it here
  // makes the toast animate out instead of vanishing.
  React.useEffect(() => {
    if (toast.closing) close("programmatic");
  }, [toast.closing, close]);

  // Opens the pill once it has a body. Re-runs when a promise toast resolves
  // with a description it lacked while loading.
  React.useEffect(() => {
    if (opened || !hasBody) return;
    const t = setTimeout(() => setOpened(true), EXPAND_DELAY);
    return () => clearTimeout(t);
  }, [opened, hasBody]);

  React.useEffect(
    () => () => {
      if (exitTimer.current) clearTimeout(exitTimer.current);
    },
    [],
  );

  // The Toaster needs each height to lay out the stack.
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
    // A promise resolving under the cursor must not undo the pause.
    if (!pausedRef.current) startTimer();
    return clearTimer;
  }, [duration, startTimer, clearTimer]);

  const pause = React.useCallback(() => {
    // A stacked toast gets two calls per hover. Without this guard the elapsed
    // time would be subtracted twice.
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

  // A hovered, expanded stack pauses every toast in it.
  React.useEffect(() => {
    if (!stacked) return;
    if (expanded) pause();
    else resume();
  }, [expanded, stacked, pause, resume]);

  const onMouseEnter = () => {
    pause();
    // Hovering a pill opens it without waiting for the delay.
    setOpened(true);
  };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const offset = vertical ? info.offset.y : info.offset.x;
    const velocity = vertical ? info.velocity.y : info.velocity.x;
    if (
      Math.abs(offset) > SWIPE_THRESHOLD ||
      Math.abs(velocity) > SWIPE_VELOCITY
    ) {
      close("user", offset || velocity);
    } else {
      resume();
    }
  };

  // A loading toast has no deadline, and a progress value replaces the countdown.
  const showCountdown =
    Number.isFinite(duration) && type !== "loading" && pct == null;
  const showTile = iconNode != null || showCountdown;

  const closing = state === "closing";
  // Enter pops in from the anchored edge and exit leaves the same way.
  const nudge = anchorBottom ? 12 : -12;

  return (
    <motion.li
      ref={rootRef}
      role="status"
      aria-live={type === "error" ? "assertive" : "polite"}
      aria-atomic="true"
      data-state={state}
      data-type={type}
      data-variant={variant}
      data-phase={phase}
      onMouseEnter={onMouseEnter}
      onMouseLeave={resume}
      initial={
        reduceMotion
          ? false
          : {
              opacity: 0,
              scale: 0.6,
              y: stackY + nudge,
              filter: "blur(6px)",
            }
      }
      animate={
        closing
          ? swipe != null
            ? { opacity: 0, y: stackY, scale: stackScale }
            : {
                opacity: 0,
                scale: 0.85,
                y: stackY + nudge,
                filter: "blur(4px)",
              }
          : {
              opacity: stackOpacity,
              scale: stackScale,
              y: stackY,
              filter: "blur(0px)",
            }
      }
      transition={reduceMotion ? { duration: 0 } : closing ? EXIT : POP}
      style={{
        zIndex: stacked ? stackZ : undefined,
        transformOrigin: anchorBottom ? "bottom center" : "top center",
      }}
      className={cn(
        "pointer-events-none flex w-full",
        alignClass(toast.position),
        stacked
          ? cn("absolute inset-x-0", anchorBottom ? "bottom-0" : "top-0")
          : "relative",
      )}
    >
      <motion.div
        data-slot="bubble"
        layout={!reduceMotion}
        drag={closing ? false : vertical ? "y" : "x"}
        dragSnapToOrigin
        dragElastic={0.6}
        onDragStart={pause}
        onDragEnd={onDragEnd}
        animate={
          swipe != null
            ? vertical
              ? { y: swipe > 0 ? "260%" : "-260%" }
              : { x: swipe > 0 ? "130%" : "-130%" }
            : undefined
        }
        transition={{ layout: MORPH, default: EXIT }}
        style={{
          borderRadius: isOpen ? RADIUS.card : RADIUS.pill,
          touchAction: vertical ? "pan-x" : "pan-y",
        }}
        className={cn(
          "group pointer-events-auto relative flex cursor-grab flex-col overflow-hidden border shadow-lg transition-colors duration-300 active:cursor-grabbing",
          TONE[type],
          v.surface,
          isOpen ? "w-full p-[14px]" : "max-w-full py-1.5 pl-1.5 pr-2.5",
          !showTile && !isOpen && "pl-3.5",
        )}
      >
        {jsx ? (
          // Custom content has no header row, so the close button is absolute
          // and the content keeps room for it on the right.
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
            {/* layout="position" keeps the header from stretching mid-morph. */}
            <motion.div
              layout={reduceMotion ? false : "position"}
              transition={MORPH}
              data-slot="header"
              className="flex min-w-0 items-center gap-2.5"
            >
              {showTile && (
                <span
                  data-slot="icon"
                  className={cn(
                    "relative flex shrink-0 items-center justify-center rounded-full",
                    // Without a glyph the tile is only the ring, a bit smaller.
                    iconNode != null ? cn("size-[26px]", v.tile) : "size-4",
                  )}
                >
                  {iconNode}
                  {showCountdown && (
                    <svg
                      aria-hidden
                      viewBox="0 0 30 30"
                      className="absolute -inset-[2px] size-[calc(100%+4px)] -rotate-90"
                    >
                      <circle
                        key={duration}
                        data-slot="countdown"
                        cx="15"
                        cy="15"
                        r="14"
                        fill="none"
                        strokeWidth={iconNode != null ? 1.5 : 2.5}
                        strokeLinecap="round"
                        pathLength={100}
                        strokeDasharray="100"
                        className={v.ring}
                        style={{
                          animation: reduceMotion
                            ? "none"
                            : `sapa-toast-ring ${duration}ms linear forwards`,
                          animationPlayState: paused ? "paused" : undefined,
                        }}
                      />
                    </svg>
                  )}
                </span>
              )}
              {toast.title != null && (
                <div
                  className={cn(
                    "min-w-0 flex-1 text-sm font-semibold leading-tight",
                    !isOpen && "truncate",
                  )}
                >
                  {toast.title}
                </div>
              )}
              <button
                type="button"
                aria-label="Close"
                onClick={() => close("user")}
                className={cn(CLOSE, "ml-auto shrink-0")}
              >
                <X className="size-3.5" />
              </button>
            </motion.div>

            <AnimatePresence initial={false}>
              {isOpen && hasBody && (
                <motion.div
                  key="body"
                  // Position-only layout so the text never squashes mid-morph.
                  layout={reduceMotion ? false : "position"}
                  data-slot="body"
                  initial={{ opacity: 0, y: -4, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{
                    opacity: 0,
                    filter: "blur(4px)",
                    transition: { duration: 0.12 },
                  }}
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : {
                          duration: 0.3,
                          ease: "easeOut",
                          delay: 0.1,
                          layout: MORPH,
                        }
                  }
                >
                  {toast.description != null && (
                    <div className="mt-2 text-sm opacity-80">
                      {toast.description}
                    </div>
                  )}

                  {pct != null && (
                    <div
                      role="progressbar"
                      aria-valuenow={pct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      className={cn(
                        "mt-3 h-1.5 overflow-hidden rounded-full",
                        v.track,
                      )}
                    >
                      <div
                        className={cn(
                          "h-full rounded-full transition-[width] duration-300 ease-out",
                          v.bar,
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  )}

                  {(toast.action || toast.cancel) && (
                    <div className="mt-3 flex gap-2">
                      {toast.action && (
                        <button
                          type="button"
                          onClick={() => {
                            toast.action?.onClick?.();
                            close("action");
                          }}
                          className={cn(
                            "inline-flex h-7 items-center rounded-full px-3 text-xs font-medium transition-opacity",
                            v.action,
                          )}
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
                          className={cn(
                            "inline-flex h-7 items-center rounded-full border px-3 text-xs font-medium transition-colors",
                            v.cancel,
                          )}
                        >
                          {toast.cancel.label}
                        </button>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </motion.div>
    </motion.li>
  );
}
