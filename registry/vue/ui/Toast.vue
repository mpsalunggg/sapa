<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type CSSProperties,
} from "vue";
import {
  Check,
  CircleAlert,
  Info,
  Loader2,
  TriangleAlert,
  X,
} from "@lucide/vue";

import { cn } from "@/lib/utils";
import { dismiss, type ToastData, type ToastType } from "./useToast";

const props = withDefaults(
  defineProps<{
    toast: ToastData;
    stacked?: boolean;
    expanded?: boolean;
    anchorBottom?: boolean;
    stackY?: number;
    stackScale?: number;
    stackOpacity?: number;
    stackZ?: number;
    reportHeight?: (id: string | number, height: number) => void;
  }>(),
  {
    stacked: false,
    expanded: false,
    anchorBottom: true,
    stackY: 0,
    stackScale: 1,
    stackOpacity: 1,
    stackZ: 1,
  },
);

const ICONS: Record<ToastType, unknown> = {
  default: null,
  success: Check,
  error: CircleAlert,
  warning: TriangleAlert,
  info: Info,
  loading: Loader2,
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

const compact = computed(
  () =>
    !props.toast.component &&
    !props.toast.description &&
    !props.toast.action &&
    !props.toast.cancel,
);

const duration = computed(() => props.toast.duration ?? 4000);
const iconComp = computed(() => props.toast.icon ?? ICONS[props.toast.type]);
const showProgress = computed(
  () =>
    Number.isFinite(duration.value) &&
    props.toast.type !== "loading" &&
    !compact.value,
);

const vertical = computed(
  () =>
    props.toast.position === "top-center" ||
    props.toast.position === "bottom-center",
);

const rootEl = ref<HTMLLIElement | null>(null);
const shown = ref(false);
const paused = ref(false);
const offset = ref(0);
const dragging = ref(false);
let startX = 0;
let startY = 0;
let remaining = duration.value;
let startedAt = Date.now();
let timer: ReturnType<typeof setTimeout> | null = null;
let ro: ResizeObserver | null = null;

function clearTimer() {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
}

function close() {
  props.toast.onAutoClose?.(props.toast);
  dismiss(props.toast.id);
}

function startTimer() {
  if (!Number.isFinite(remaining)) return;
  startedAt = Date.now();
  clearTimer();
  timer = setTimeout(close, remaining);
}

function pause() {
  paused.value = true;
  if (!Number.isFinite(remaining)) return;
  clearTimer();
  remaining -= Date.now() - startedAt;
}

function resume() {
  paused.value = false;
  startTimer();
}

// Pause the whole group while the stack is expanded (hovered).
watch(
  () => props.expanded,
  (val) => {
    if (!props.stacked) return;
    if (val) pause();
    else resume();
  },
);

function onPointerDown(e: PointerEvent) {
  if ((e.target as HTMLElement).closest("button")) return;
  dragging.value = true;
  startX = e.clientX;
  startY = e.clientY;
  (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  pause();
}
function onPointerMove(e: PointerEvent) {
  if (!dragging.value) return;
  offset.value = vertical.value ? e.clientY - startY : e.clientX - startX;
}
function onPointerUp() {
  if (!dragging.value) return;
  dragging.value = false;
  if (Math.abs(offset.value) > SWIPE_THRESHOLD) {
    offset.value = 0;
    close();
  } else {
    offset.value = 0;
    resume();
  }
}

function runAction() {
  props.toast.action?.onClick?.();
  close();
}
function runCancel() {
  props.toast.cancel?.onClick?.();
  close();
}

// Combined transform/opacity — stack layout merged with drag + enter.
const stackStyle = computed(() => {
  if (!props.stacked) {
    return {
      transform: offset.value
        ? vertical.value
          ? `translateY(${offset.value}px)`
          : `translateX(${offset.value}px)`
        : undefined,
      opacity: dragging.value
        ? Math.max(0, 1 - Math.abs(offset.value) / 200)
        : undefined,
      touchAction: vertical.value ? "pan-x" : "pan-y",
    } as CSSProperties;
  }
  const dragged = dragging.value && offset.value !== 0;
  return {
    zIndex: props.stackZ,
    touchAction: vertical.value ? "pan-x" : "pan-y",
    transition: dragged
      ? "none"
      : "transform 320ms cubic-bezier(0.22, 1, 0.36, 1), opacity 320ms ease",
    transform: dragged
      ? vertical.value
        ? `translateY(${offset.value}px)`
        : `translateX(${offset.value}px)`
      : `translateY(${props.stackY}px) scale(${shown.value ? props.stackScale : 0.9})`,
    opacity: dragged
      ? Math.max(0, 1 - Math.abs(offset.value) / 200)
      : shown.value
        ? props.stackOpacity
        : 0,
  } as CSSProperties;
});

onMounted(() => {
  remaining = duration.value;
  startTimer();
  requestAnimationFrame(() => (shown.value = true));
  if (props.stacked && props.reportHeight && rootEl.value) {
    const el = rootEl.value;
    const report = () => props.reportHeight!(props.toast.id, el.offsetHeight);
    report();
    ro = new ResizeObserver(report);
    ro.observe(el);
  }
});
onBeforeUnmount(() => {
  clearTimer();
  ro?.disconnect();
});
</script>

<template>
  <li
    ref="rootEl"
    role="status"
    :aria-live="toast.type === 'error' ? 'assertive' : 'polite'"
    aria-atomic="true"
    :data-type="toast.type"
    :style="stackStyle"
    :class="
      cn(
        'group pointer-events-auto flex w-full gap-3 overflow-hidden border bg-popover/95 p-4 pr-10 text-popover-foreground shadow-xl shadow-black/5 backdrop-blur',
        stacked
          ? cn('absolute inset-x-0', anchorBottom ? 'bottom-0' : 'top-0')
          : 'relative',
        compact ? 'items-center rounded-full' : 'items-start rounded-3xl',
        !dragging && 'cursor-grab active:cursor-grabbing',
        toast.richColors && RICH_COLORS[toast.type],
      )
    "
    @mouseenter="pause"
    @mouseleave="resume"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
  >
    <component :is="toast.component" v-if="toast.component" class="flex-1" />

    <template v-else>
      <span
        v-if="iconComp"
        :class="
          cn(
            'flex size-8 shrink-0 items-center justify-center rounded-full',
            !compact && 'mt-0.5',
            CHIP[toast.type],
          )
        "
      >
        <component
          :is="iconComp"
          class="size-5"
          :class="toast.type === 'loading' && 'animate-spin'"
        />
      </span>
      <div class="flex-1 space-y-1">
        <div
          v-if="toast.title != null"
          :class="
            cn(
              'text-sm font-semibold leading-tight',
              toast.richColors && RICH_TEXT[toast.type],
            )
          "
        >
          {{ toast.title }}
        </div>
        <div v-if="toast.description != null" class="text-sm opacity-90">
          {{ toast.description }}
        </div>
        <div v-if="toast.action || toast.cancel" class="mt-2 flex gap-2">
          <button
            v-if="toast.action"
            type="button"
            class="inline-flex h-7 items-center rounded-md bg-foreground px-2.5 text-xs font-medium text-background transition-opacity hover:opacity-90"
            @click="runAction"
          >
            {{ toast.action.label }}
          </button>
          <button
            v-if="toast.cancel"
            type="button"
            class="inline-flex h-7 items-center rounded-md border px-2.5 text-xs font-medium transition-colors hover:bg-muted"
            @click="runCancel"
          >
            {{ toast.cancel.label }}
          </button>
        </div>
      </div>
    </template>

    <button
      type="button"
      aria-label="Close"
      class="absolute right-2 top-2 rounded-full p-1 opacity-0 transition-opacity hover:bg-black/5 group-hover:opacity-70 dark:hover:bg-white/10"
      @click="close"
    >
      <X class="size-4" />
    </button>

    <span
      v-if="showProgress"
      class="absolute inset-x-3 bottom-1.5 h-1 origin-left rounded-full bg-current opacity-25"
      :style="{
        animation: `sapa-toast-progress ${duration}ms linear forwards`,
        animationPlayState: paused || dragging ? 'paused' : undefined,
      }"
    />
  </li>
</template>
