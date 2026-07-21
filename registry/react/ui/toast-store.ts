import type { ReactNode } from "react";

export type ToastType =
  "default" | "success" | "error" | "warning" | "info" | "loading";

export type ToastVariant = "default" | "outline" | "filled" | "accent";

export type ToastSize = "sm" | "default" | "lg";

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

export interface ToastOptions {
  id?: string | number;
  type?: ToastType;
  title?: ReactNode;
  description?: ReactNode;
  /** Auto-dismiss delay in ms. Use `Infinity` to keep it until dismissed. */
  duration?: number;
  position?: ToastPosition;
  icon?: ReactNode;
  /** Visual treatment. Defaults to "default" (neutral surface). */
  variant?: ToastVariant;
  /** Toast size. Defaults to "default". */
  size?: ToastSize;
  /** @deprecated Use `variant: "outline"`. Kept as an alias for backward compat. */
  richColors?: boolean;
  action?: ToastAction;
  cancel?: ToastAction;
  /** Fully custom content — bypasses title/description rendering. */
  jsx?: ReactNode;
  /** 0–100 — renders a determinate progress bar under the content. */
  progress?: number;
  onDismiss?: (toast: ToastData) => void;
  onAutoClose?: (toast: ToastData) => void;
}

export interface ToastData extends Omit<ToastOptions, "id" | "type"> {
  id: string | number;
  type: ToastType;
  createdAt: number;
}

const DEFAULT_DURATION = 4000;

type Listener = (toasts: ToastData[]) => void;

class ToastStore {
  private toasts: ToastData[] = [];
  private listeners = new Set<Listener>();
  private counter = 0;

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

  add(options: ToastOptions): string | number {
    const id = options.id ?? ++this.counter;
    const existingIndex = this.toasts.findIndex((t) => t.id === id);

    const base: ToastData = {
      duration: DEFAULT_DURATION,
      ...options,
      type: options.type ?? "default",
      id,
      createdAt: Date.now(),
    };

    if (existingIndex > -1) {
      // Update in place (used by toast.promise transitions).
      const next = this.toasts.slice();
      next[existingIndex] = { ...next[existingIndex], ...base };
      this.toasts = next;
    } else {
      this.toasts = [base, ...this.toasts];
    }
    this.emit();
    return id;
  }

  dismiss(id?: string | number) {
    const target =
      id != null ? this.toasts.filter((t) => t.id === id) : this.toasts;
    for (const t of target) t.onDismiss?.(t);
    this.toasts = id != null ? this.toasts.filter((t) => t.id !== id) : [];
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
  dismiss: (id?: string | number) => void;
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
    dismiss: (id?: string | number) => toastStore.dismiss(id),
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
