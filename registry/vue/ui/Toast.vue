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
import {
  dismiss,
  type CloseReason,
  type ToastData,
  type ToastType,
} from "./useToast";

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
    /**
     * Fired once the exit animation is over. Works even when <Toast> is
     * rendered on its own, outside the store — unlike onDismiss/onAutoClose.
     */
    onClosed?: (reason: CloseReason) => void;
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

// Enter/exit slide direction based on the toast's anchor position.
// `top-*` centered slide up, `bottom-*` centered slide down, corners slide sideways.
function dirTransform(position: string = "bottom-right"): string {
  if (position.endsWith("left")) return "translateX(-115%)";
  if (position.endsWith("right")) return "translateX(115%)";
  return position.startsWith("top") ? "translateY(-250%)" : "translateY(250%)";
}

/** Skip enter/exit/drag animations for users who prefer reduced motion. */
const reduceMotion =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Clamped determinate progress (toast.progress), or null when not a progress toast. */
const progressValue = computed(() =>
  props.toast.progress == null
    ? null
    : Math.min(100, Math.max(0, props.toast.progress)),
);

const duration = computed(() => props.toast.duration ?? 4000);
const iconComp = computed(() => props.toast.icon ?? ICONS[props.toast.type]);
// The auto-dismiss timer bar. A loading toast has no deadline to show, and a
// real progress value beats a countdown for the same strip of pixels.
const showProgress = computed(
  () =>
    Number.isFinite(duration.value) &&
    props.toast.type !== "loading" &&
    progressValue.value == null,
);

const vertical = computed(
  () =>
    props.toast.position === "top-center" ||
    props.toast.position === "bottom-center",
);

const dir = computed(() => dirTransform(props.toast.position));

const rootEl = ref<HTMLLIElement | null>(null);
const shown = ref(false);
const paused = ref(false);
const offset = ref(0);
const dragging = ref(false);
const state = ref<"open" | "closing">("open");
const exitTransform = ref(dir.value);
let startX = 0;
let startY = 0;
let remaining = duration.value;
let startedAt = Date.now();
let timer: ReturnType<typeof setTimeout> | null = null;
let closeTimeout: ReturnType<typeof setTimeout> | null = null;
let ro: ResizeObserver | null = null;

function clearTimer() {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
}

/**
 * Starts the exit animation and hands the removal over to the store, which
 * fires onDismiss (always) and onAutoClose (timeouts only) once it drops the
 * toast. Repeat calls are ignored so a swipe racing the timer closes once.
 * `swipe` is the drag offset (px): its sign picks the exit direction.
 */
function close(reason: CloseReason, swipe?: number) {
  if (state.value === "closing") return;
  exitTransform.value = swipe
    ? vertical.value
      ? `translateY(${swipe > 0 ? 260 : -260}%)`
      : `translateX(${swipe > 0 ? 130 : -130}%)`
    : dir.value;
  state.value = "closing";
  clearTimer();
  dismiss(props.toast.id, reason);
  closeTimeout = setTimeout(
    () => props.onClosed?.(reason),
    reduceMotion ? 0 : 320,
  );
}

function startTimer() {
  if (state.value === "closing" || !Number.isFinite(remaining)) return;
  startedAt = Date.now();
  clearTimer();
  timer = setTimeout(() => close("timeout"), remaining);
}

function pause() {
  // Without the `paused` guard the elapsed time is subtracted once per caller,
  // and a stacked toast gets two calls per hover (its own handler plus the
  // group container's) — draining the remaining time.
  if (paused.value || state.value === "closing") return;
  paused.value = true;
  if (!Number.isFinite(remaining)) return;
  clearTimer();
  remaining = Math.max(0, remaining - (Date.now() - startedAt));
}

function resume() {
  if (!paused.value || state.value === "closing") return;
  paused.value = false;
  startTimer();
}

// Re-arm the auto-dismiss timer when the duration changes (e.g. a promise
// toast transitions loading→success), matching the React useEffect([duration]).
watch(duration, (d) => {
  remaining = d;
  // Don't restart a hovered toast: a promise resolving under the cursor must
  // not undo the pause.
  if (!paused.value) startTimer();
});

// A dismiss from application code only flags the toast in the store; mirror
// that here so it animates out instead of vanishing.
watch(
  () => props.toast.closing,
  (closing) => {
    if (closing) close("programmatic");
  },
);

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
    close("user", offset.value); // exit toward the swipe direction
  } else {
    offset.value = 0;
    resume();
  }
}

function runAction() {
  props.toast.action?.onClick?.();
  close("action");
}
function runCancel() {
  props.toast.cancel?.onClick?.();
  close("action");
}

// Combined transform/opacity — stack layout merged with drag + enter/exit.
const stackStyle = computed(() => {
  const dragged = dragging.value && offset.value !== 0;
  const closing = state.value === "closing";
  const transition =
    dragged || reduceMotion
      ? "none"
      : "transform 320ms cubic-bezier(0.22, 1, 0.36, 1), opacity 320ms ease";
  const dragTransform = vertical.value
    ? `translateY(${offset.value}px)`
    : `translateX(${offset.value}px)`;
  const dragOpacity = Math.max(0, 1 - Math.abs(offset.value) / 200);

  if (!props.stacked) {
    return {
      touchAction: vertical.value ? "pan-x" : "pan-y",
      transition,
      transform: closing
        ? exitTransform.value
        : dragged
          ? dragTransform
          : shown.value
            ? undefined
            : "scale(0.96)",
      opacity: closing ? 0 : dragged ? dragOpacity : shown.value ? 1 : 0,
    } as CSSProperties;
  }

  return {
    zIndex: props.stackZ,
    touchAction: vertical.value ? "pan-x" : "pan-y",
    transition,
    transform: closing
      ? exitTransform.value
      : dragged
        ? dragTransform
        : `translateY(${props.stackY}px) scale(${shown.value ? props.stackScale : 0.9})`,
    opacity: closing
      ? 0
      : dragged
        ? dragOpacity
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
  if (closeTimeout) clearTimeout(closeTimeout);
  ro?.disconnect();
});
</script>

<template>
  <li
    ref="rootEl"
    role="status"
    :aria-live="toast.type === 'error' ? 'assertive' : 'polite'"
    aria-atomic="true"
    :data-state="state"
    :data-type="toast.type"
    :style="stackStyle"
    :class="
      cn(
        'bg-popover/95 text-popover-foreground group pointer-events-auto flex w-full flex-col overflow-hidden rounded-[9px] border p-[14px] shadow-xl shadow-black/5 backdrop-blur',
        stacked
          ? cn('absolute inset-x-0', anchorBottom ? 'bottom-0' : 'top-0')
          : 'relative',
        !dragging && 'cursor-grab active:cursor-grabbing',
      )
    "
    @mouseenter="pause"
    @mouseleave="resume"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
  >
    <!-- Custom content has no header row to hang the close button off, so it
         keeps the absolute one — hence the padding reserved on the right. -->
    <template v-if="toast.component">
      <component :is="toast.component" class="pr-6" />
      <button
        type="button"
        aria-label="Close"
        :class="cn(CLOSE, 'absolute right-2.5 top-2.5')"
        @click="close('user')"
      >
        <X class="size-4" />
      </button>
    </template>

    <template v-else>
      <!-- Header — the tile sits *beside* the title so the two read as one
           object; everything below it gets the card's full width. -->
      <div class="flex items-center gap-[10px]">
        <span
          v-if="iconComp"
          :class="
            cn(
              'flex size-[30px] shrink-0 items-center justify-center rounded-[8px] border',
              TILE[toast.type],
            )
          "
        >
          <component
            :is="iconComp"
            :class="cn('size-4', toast.type === 'loading' && 'animate-spin')"
          />
        </span>
        <div
          v-if="toast.title != null"
          class="min-w-0 flex-1 text-sm font-semibold leading-tight"
        >
          {{ toast.title }}
        </div>
        <button
          type="button"
          aria-label="Close"
          :class="cn(CLOSE, '-mr-1 ml-auto shrink-0')"
          @click="close('user')"
        >
          <X class="size-4" />
        </button>
      </div>

      <div
        v-if="toast.description != null"
        class="mt-[11px] text-sm opacity-90"
      >
        {{ toast.description }}
      </div>

      <div v-if="toast.action || toast.cancel" class="mt-[11px] flex gap-2">
        <button
          v-if="toast.action"
          type="button"
          class="bg-foreground text-background inline-flex h-7 items-center rounded-md px-2.5 text-xs font-medium transition-opacity hover:opacity-90"
          @click="runAction"
        >
          {{ toast.action.label }}
        </button>
        <button
          v-if="toast.cancel"
          type="button"
          class="hover:bg-muted inline-flex h-7 items-center rounded-md border px-2.5 text-xs font-medium transition-colors"
          @click="runCancel"
        >
          {{ toast.cancel.label }}
        </button>
      </div>
    </template>

    <!-- Both bars ride the bottom edge; overflow-hidden on the root clips them
         to the card's radius, so neither needs one of its own. -->
    <div
      v-if="progressValue != null"
      role="progressbar"
      :aria-valuenow="progressValue"
      :aria-valuemin="0"
      :aria-valuemax="100"
      class="bg-muted absolute inset-x-0 bottom-0 h-[3px]"
    >
      <div
        :class="
          cn('h-full transition-[width] duration-300 ease-out', BAR[toast.type])
        "
        :style="{ width: `${progressValue}%` }"
      />
    </div>

    <span
      v-if="showProgress"
      :class="
        cn('absolute inset-x-0 bottom-0 h-[3px] origin-left', BAR[toast.type])
      "
      :style="{
        animation: reduceMotion
          ? 'none'
          : `sapa-toast-progress ${duration}ms linear forwards`,
        animationPlayState: paused || dragging ? 'paused' : undefined,
      }"
    />
  </li>
</template>
