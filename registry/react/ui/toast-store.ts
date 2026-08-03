import type { ReactNode } from "react";

export type ToastType =
  "default" | "success" | "error" | "warning" | "info" | "loading";

export type ToastPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export interface ToastAction {
  label: ReactNode;
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
  title?: ReactNode;
  description?: ReactNode;
  /** Auto-dismiss delay in ms. Use `Infinity` to keep it until dismissed. */
  duration?: number;
  position?: ToastPosition;
  icon?: ReactNode;
  action?: ToastAction;
  cancel?: ToastAction;
  /** Fully custom content — bypasses title/description rendering. */
  jsx?: ReactNode;
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

function exitDelay(): number {
  if (typeof window === "undefined") return 0;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? 0
    : EXIT_MS;
}

type Listener = (toasts: ToastData[]) => void;

class ToastStore {
  private toasts: ToastData[] = [];
  private listeners = new Set<Listener>();
  private counter = 0;
  private exitTimers = new Map<
    string | number,
    ReturnType<typeof setTimeout>
  >();

  subscribe = (listener: Listener) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = (): ToastData[] => this.toasts;

  private emit() {
    this.toasts = [...this.toasts];
    for (const listener of this.listeners) listener(this.toasts);
  }

  /**
   * Auto-ids must never land on an id the caller has already claimed, so a
   * numeric explicit id pushes the counter past itself.
   */
  private nextId(explicit?: string | number): string | number {
    if (explicit == null) return ++this.counter;
    if (typeof explicit === "number" && explicit > this.counter) {
      this.counter = explicit;
    }
    return explicit;
  }

  private cancelExit(id: string | number) {
    const timer = this.exitTimers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.exitTimers.delete(id);
    }
  }

  add(options: ToastOptions): string | number {
    const id = this.nextId(options.id);
    const existingIndex = this.toasts.findIndex((t) => t.id === id);

    const base: ToastData = {
      duration: DEFAULT_DURATION,
      ...options,
      type: options.type ?? "default",
      id,
      createdAt: Date.now(),
      closing: false,
    };

    if (existingIndex > -1) {
      // Update in place (used by toast.promise transitions). An update revives
      // a toast that was already animating out.
      this.cancelExit(id);
      const next = this.toasts.slice();
      next[existingIndex] = { ...next[existingIndex], ...base };
      this.toasts = next;
    } else {
      this.toasts = [base, ...this.toasts];
    }
    this.emit();
    return id;
  }

  /**
   * Flags the toast as closing so <Toast> can play its exit animation, then
   * removes it once that animation is over. Dismissing an already-closing toast
   * is a no-op, so the callbacks fire exactly once per toast.
   */
  dismiss(id?: string | number, reason: CloseReason = "programmatic") {
    const targets = (
      id != null ? this.toasts.filter((t) => t.id === id) : this.toasts
    ).filter((t) => !t.closing);
    if (targets.length === 0) return;

    const ids = new Set(targets.map((t) => t.id));
    this.toasts = this.toasts.map((t) =>
      ids.has(t.id) ? { ...t, closing: true } : t,
    );

    const delay = exitDelay();
    for (const target of targets) {
      this.exitTimers.set(
        target.id,
        setTimeout(() => this.remove(target.id, reason), delay),
      );
    }
    this.emit();
  }

  /** Drop a closing toast and fire its callbacks. */
  private remove(id: string | number, reason: CloseReason) {
    this.exitTimers.delete(id);
    const toast = this.toasts.find((t) => t.id === id);
    if (!toast) return;

    this.toasts = this.toasts.filter((t) => t.id !== id);
    if (reason === "timeout") toast.onAutoClose?.(toast);
    toast.onDismiss?.(toast);
    this.emit();
  }

  /** Wipe the queue with no animation and no callbacks (reset / teardown). */
  clear() {
    for (const timer of this.exitTimers.values()) clearTimeout(timer);
    this.exitTimers.clear();
    this.toasts = [];
    this.emit();
  }
}

export const toastStore = new ToastStore();

export interface PromiseMessages<T> {
  loading: ReactNode;
  success: ReactNode | ((data: T) => ReactNode);
  error: ReactNode | ((error: unknown) => ReactNode);
}

function resolveMessage<T>(
  value: ReactNode | ((arg: T) => ReactNode),
  arg: T,
): ReactNode {
  return typeof value === "function"
    ? (value as (arg: T) => ReactNode)(arg)
    : value;
}

type ToastFn = (title: ReactNode, options?: ToastOptions) => string | number;

interface ToastApi extends ToastFn {
  message: ToastFn;
  success: ToastFn;
  error: ToastFn;
  warning: ToastFn;
  info: ToastFn;
  loading: ToastFn;
  /** Determinate progress toast — re-call with the same `id` to update `value`. */
  progress: (
    title: ReactNode,
    options?: ToastOptions & { value?: number },
  ) => string | number;
  custom: (jsx: ReactNode, options?: ToastOptions) => string | number;
  dismiss: (id?: string | number, reason?: CloseReason) => void;
  promise: <T>(
    promise: Promise<T>,
    messages: PromiseMessages<T>,
    options?: ToastOptions,
  ) => string | number;
}

function make(type: ToastType): ToastFn {
  return (title, options) => toastStore.add({ ...options, title, type });
}

export const toast: ToastApi = Object.assign(
  ((title, options) => toastStore.add({ ...options, title })) as ToastFn,
  {
    message: make("default"),
    success: make("success"),
    error: make("error"),
    warning: make("warning"),
    info: make("info"),
    loading: (title: ReactNode, options?: ToastOptions) =>
      toastStore.add({
        duration: Infinity,
        ...options,
        title,
        type: "loading",
      }),
    progress: (
      title: ReactNode,
      options?: ToastOptions & { value?: number },
    ) => {
      const { value, ...rest } = options ?? {};
      return toastStore.add({
        duration: Infinity,
        ...rest,
        title,
        progress: value ?? rest.progress ?? 0,
      });
    },
    custom: (jsx: ReactNode, options?: ToastOptions) =>
      toastStore.add({ ...options, jsx }),
    dismiss: (id?: string | number, reason?: CloseReason) =>
      toastStore.dismiss(id, reason),
    promise: <T>(
      promise: Promise<T>,
      messages: PromiseMessages<T>,
      options?: ToastOptions,
    ) => {
      const id = toastStore.add({
        ...options,
        title: messages.loading,
        type: "loading",
        duration: Infinity,
      });
      promise
        .then((data) =>
          toastStore.add({
            ...options,
            id,
            title: resolveMessage(messages.success, data),
            type: "success",
            duration: options?.duration ?? DEFAULT_DURATION,
          }),
        )
        .catch((error) =>
          toastStore.add({
            ...options,
            id,
            title: resolveMessage(messages.error, error),
            type: "error",
            duration: options?.duration ?? DEFAULT_DURATION,
          }),
        );
      return id;
    },
  } satisfies Omit<ToastApi, keyof ToastFn>,
);
