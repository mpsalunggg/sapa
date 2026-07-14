import { reactive } from "vue";
import type { Component } from "vue";

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
  label: string;
  onClick?: () => void;
}

export interface ToastOptions {
  id?: string | number;
  type?: ToastType;
  title?: string;
  description?: string;
  /** Auto-dismiss delay in ms. Use `Infinity` to keep it until dismissed. */
  duration?: number;
  position?: ToastPosition;
  /** Use the semantic --sapa-* colors instead of the neutral surface. */
  richColors?: boolean;
  action?: ToastAction;
  cancel?: ToastAction;
  /** Override the leading icon with a custom component. */
  icon?: Component;
  /** Fully custom content — a Vue component rendered instead of title/description. */
  component?: Component;
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

export const toasts = reactive<ToastData[]>([]);
let counter = 0;

function add(options: ToastOptions): string | number {
  const id = options.id ?? ++counter;
  const existing = toasts.findIndex((t) => t.id === id);

  const data: ToastData = {
    duration: DEFAULT_DURATION,
    ...options,
    type: options.type ?? "default",
    id,
    createdAt: Date.now(),
  };

  if (existing > -1) {
    toasts[existing] = { ...toasts[existing], ...data };
  } else {
    toasts.unshift(data);
  }
  return id;
}

export function dismiss(id?: string | number) {
  if (id == null) {
    for (const t of toasts) t.onDismiss?.(t);
    toasts.splice(0, toasts.length);
    return;
  }
  const index = toasts.findIndex((t) => t.id === id);
  if (index > -1) {
    toasts[index].onDismiss?.(toasts[index]);
    toasts.splice(index, 1);
  }
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
  return { toast, toasts, dismiss };
}
