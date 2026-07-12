<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
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

const props = defineProps<{ toast: ToastData }>();

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

// A "compact" toast (title only, no description/actions) centers its content
// vertically against the icon; richer toasts top-align.
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

// Centered top/bottom toasts are swiped vertically; others horizontally.
const vertical = computed(
  () =>
    props.toast.position === "top-center" ||
    props.toast.position === "bottom-center",
);

const paused = ref(false);
const offset = ref(0);
const dragging = ref(false);
let startX = 0;
let startY = 0;
let remaining = duration.value;
let startedAt = Date.now();
let timer: ReturnType<typeof setTimeout> | null = null;

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
    // Clear inline transform so the TransitionGroup leave class controls the exit.
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

onMounted(() => {
  remaining = duration.value;
  startTimer();
});
onBeforeUnmount(clearTimer);
</script>

<template>
  <li
    role="status"
    :aria-live="toast.type === 'error' ? 'assertive' : 'polite'"
    aria-atomic="true"
    :data-type="toast.type"
    :style="{
      transform: offset
        ? vertical
          ? `translateY(${offset}px)`
          : `translateX(${offset}px)`
        : undefined,
      opacity: dragging ? Math.max(0, 1 - Math.abs(offset) / 200) : undefined,
      touchAction: vertical ? 'pan-x' : 'pan-y',
    }"
    :class="
      cn(
        'group pointer-events-auto relative flex w-full gap-3 overflow-hidden border bg-popover/95 p-4 pr-10 text-popover-foreground shadow-xl shadow-black/5 backdrop-blur',
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
