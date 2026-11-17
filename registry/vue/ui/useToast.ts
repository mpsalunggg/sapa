import { reactive } from "vue";
import type { Component } from "vue";

export type ToastType =
  "default" | "success" | "error" | "warning" | "info" | "loading";

/**
 * How the type's color is carried: `minimal` keeps the surface neutral and
 * tints only the icon, `subtle` washes the whole bubble in a light tint, and
 * `solid` fills it with the color itself.
 */
export type ToastVariant = "solid" | "minimal" | "subtle";

export type ToastPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export interface ToastAction {
  label: string;
  onClick?: () => void;
}

/**
 * Why a toast is going away. Only `"timeout"` counts as an auto-close;
 * everything else is a deliberate dismissal.
 */
export type CloseReason = "timeout" | "user" | "action" | "programmatic";

export interface ToastOptions {
  id?: string | number;
  type?: ToastType;
  title?: string;
  description?: string;
  /** Auto-dismiss delay in ms. Use `Infinity` to keep it until dismissed. */
  duration?: number;
  position?: ToastPosition;
  /** Color treatment; falls back to the <Toaster> variant, then "minimal". */
  variant?: ToastVariant;
  action?: ToastAction;
  cancel?: ToastAction;
  /** Override the leading icon with a custom component. */
  icon?: Component;
  /** Fully custom content — a Vue component rendered instead of title/description. */
  component?: Component;
  /** 0–100 — renders a determinate progress bar under the content. */
  progress?: number;
  /** Called for every removal, whatever triggered it. */
  onDismiss?: (toast: ToastData) => void;
  /** Called only when the toast's own duration ran out. */
  onAutoClose?: (toast: ToastData) => void;
}

export interface ToastData extends Omit<ToastOptions, "id" | "type"> {
  id: string | number;
  type: ToastType;
  createdAt: number;
  /** Set while the exit animation plays, just before the toast is removed. */
  closing?: boolean;
}

const DEFAULT_DURATION = 4000;

/** Matches the transition duration on <Toast>. */
const EXIT_MS = 320;

// This queue is module state, so on the server it would be shared by every
// request. Toasts are a client-only concern, so the store simply does nothing
// while rendering on the server rather than accumulating cross-request leftovers.
const isBrowser = () => typeof window !== "undefined";

function exitDelay(): number {
  if (!isBrowser()) return 0;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? 0
    : EXIT_MS;
}

export const toasts = reactive<ToastData[]>([]);
let counter = 0;
const exitTimers = new Map<string | number, ReturnType<typeof setTimeout>>();

/**
 * Auto-ids must never land on an id the caller has already claimed, so a
 * numeric explicit id pushes the counter past itself.
 */
function nextId(explicit?: string | number): string | number {
  if (explicit == null) return ++counter;
  if (typeof explicit === "number" && explicit > counter) counter = explicit;
  return explicit;
}

function cancelExit(id: string | number) {
  const timer = exitTimers.get(id);
  if (timer) {
    clearTimeout(timer);
    exitTimers.delete(id);
  }
}

function add(options: ToastOptions): string | number {
  if (!isBrowser()) return options.id ?? -1;

  const id = nextId(options.id);
  const existing = toasts.findIndex((t) => t.id === id);

  const data: ToastData = {
    duration: DEFAULT_DURATION,
    ...options,
    type: options.type ?? "default",
    id,
    createdAt: Date.now(),
    closing: false,
  };

  if (existing > -1) {
    // Update in place (used by toast.promise transitions). An update revives
    // a toast that was already animating out.
    cancelExit(id);
    toasts[existing] = { ...toasts[existing], ...data };
  } else {
    toasts.unshift(data);
  }
  return id;
}

/**
 * Flags the toast as closing so <Toast> can play its exit animation, then
 * removes it once that animation is over. Dismissing an already-closing toast
 * is a no-op, so the callbacks fire exactly once per toast.
 */
export function dismiss(
  id?: string | number,
  reason: CloseReason = "programmatic",
) {
  const targets = (
    id != null ? toasts.filter((t) => t.id === id) : [...toasts]
  ).filter((t) => !t.closing);
  if (targets.length === 0) return;

  const delay = exitDelay();
  for (const target of targets) {
    const index = toasts.findIndex((t) => t.id === target.id);
    if (index > -1) toasts[index] = { ...toasts[index], closing: true };
    exitTimers.set(
      target.id,
      setTimeout(() => remove(target.id, reason), delay),
    );
  }
}

/** Drop a closing toast and fire its callbacks. */
function remove(id: string | number, reason: CloseReason) {
  exitTimers.delete(id);
  const index = toasts.findIndex((t) => t.id === id);
  if (index < 0) return;

  const [toast] = toasts.splice(index, 1);
  if (reason === "timeout") toast.onAutoClose?.(toast);
  toast.onDismiss?.(toast);
}

/** Wipe the queue with no animation and no callbacks (reset / teardown). */
export function clear() {
  for (const timer of exitTimers.values()) clearTimeout(timer);
  exitTimers.clear();
  toasts.splice(0, toasts.length);
}

export interface PromiseMessages<T> {
  loading: string;
  success: string | ((data: T) => string);
  error: string | ((error: unknown) => string);
}

function resolveMessage<T>(
  value: string | ((arg: T) => string),
  arg: T,
): string {
  return typeof value === "function"
    ? (value as (arg: T) => string)(arg)
    : value;
}

type ToastFn = (title: string, options?: ToastOptions) => string | number;

function make(type: ToastType): ToastFn {
  return (title, options) => add({ ...options, title, type });
}

export const toast = Object.assign(
  ((title: string, options?: ToastOptions) =>
    add({ ...options, title })) as ToastFn,
  {
    message: make("default"),
    success: make("success"),
    error: make("error"),
    warning: make("warning"),
    info: make("info"),
    loading: (title: string, options?: ToastOptions) =>
      add({ duration: Infinity, ...options, title, type: "loading" }),
    /** Determinate progress toast — re-call with the same `id` to update `value`. */
    progress: (title: string, options?: ToastOptions & { value?: number }) => {
      const { value, ...rest } = options ?? {};
      return add({
        duration: Infinity,
        ...rest,
        title,
        progress: value ?? rest.progress ?? 0,
      });
    },
    custom: (component: Component, options?: ToastOptions) =>
      add({ ...options, component }),
    dismiss,
    promise: <T>(
      promise: Promise<T>,
      messages: PromiseMessages<T>,
      options?: ToastOptions,
    ) => {
      const id = add({
        ...options,
        title: messages.loading,
        type: "loading",
        duration: Infinity,
      });
      promise
        .then((data) =>
          add({
            ...options,
            id,
            title: resolveMessage(messages.success, data),
            type: "success",
            duration: options?.duration ?? DEFAULT_DURATION,
          }),
        )
        .catch((error) =>
          add({
            ...options,
            id,
            title: resolveMessage(messages.error, error),
            type: "error",
            duration: options?.duration ?? DEFAULT_DURATION,
          }),
        );
      return id;
    },
  },
);

/** Optional composable form, mirroring the React import ergonomics. */
export function useToast() {
  return { toast, toasts, dismiss, clear };
}
