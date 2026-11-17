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
import { AnimatePresence, motion, type PanInfo } from "motion-v";

import { cn } from "@/lib/utils";
import {
  dismiss,
  type CloseReason,
  type ToastData,
  type ToastType,
  type ToastVariant,
} from "./useToast";

const props = withDefaults(
  defineProps<{
    toast: ToastData;
    stacked?: boolean;
    expanded?: boolean;
    /** Front toast of a stack. Toasts behind it fold back into pills. */
    front?: boolean;
    anchorBottom?: boolean;
    stackY?: number;
    stackScale?: number;
    stackOpacity?: number;
    stackZ?: number;
    reportHeight?: (id: string | number, height: number) => void;
    /**
     * Fires after the exit animation. Unlike the store's onDismiss/onAutoClose,
     * it also works for a <Toast> rendered on its own.
     */
    onClosed?: (reason: CloseReason) => void;
  }>(),
  {
    stacked: false,
    expanded: false,
    front: true,
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
const EXPAND_DELAY = 450;

const SWIPE_THRESHOLD = 80;
const SWIPE_VELOCITY = 500;

const RADIUS = { pill: 999, card: 22 } as const;

// `bounce` keeps the pop lively without wobbling.
const POP = { type: "spring", bounce: 0.3, duration: 0.5 } as const;
const MORPH = { type: "spring", bounce: 0.18, duration: 0.55 } as const;
const EXIT = { duration: 0.28, ease: [0.4, 0, 1, 1] } as const;

// Reduced motion skips the pill phase and every animation.
const reduceMotion =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function alignClass(position: string = "bottom-right"): string {
  if (position.endsWith("left")) return "justify-start";
  if (position.endsWith("right")) return "justify-end";
  return "justify-center";
}

const progressValue = computed(() =>
  props.toast.progress == null
    ? null
    : Math.min(100, Math.max(0, props.toast.progress)),
);

const duration = computed(() => props.toast.duration ?? 4000);
const variant = computed(() => props.toast.variant ?? "minimal");
const v = computed(() => VARIANTS[variant.value]);
const iconComp = computed(() => props.toast.icon ?? ICONS[props.toast.type]);
// A loading toast has no deadline, and a progress value replaces the countdown.
const showCountdown = computed(
  () =>
    Number.isFinite(duration.value) &&
    props.toast.type !== "loading" &&
    progressValue.value == null,
);
const showTile = computed(() => !!iconComp.value || showCountdown.value);

// A title-only toast has no body and stays a pill.
const hasBody = computed(
  () =>
    props.toast.description != null ||
    props.toast.action != null ||
    props.toast.cancel != null ||
    progressValue.value != null,
);

const vertical = computed(
  () =>
    props.toast.position === "top-center" ||
    props.toast.position === "bottom-center",
);

const rootEl = ref<{ $el: HTMLElement } | null>(null);
const opened = ref(reduceMotion || props.toast.component != null);
const paused = ref(false);
const swipe = ref<number | null>(null);
const state = ref<"open" | "closing">("open");
let remaining = duration.value;
let startedAt = Date.now();
let timer: ReturnType<typeof setTimeout> | null = null;
let closeTimeout: ReturnType<typeof setTimeout> | null = null;
let expandTimeout: ReturnType<typeof setTimeout> | null = null;
let ro: ResizeObserver | null = null;

// Behind the front card of a collapsed stack, a toast folds back to a pill.
const isOpen = computed(
  () =>
    props.toast.component != null ||
    (opened.value &&
      hasBody.value &&
      (!props.stacked || props.front || props.expanded)),
);

function clearTimer() {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
}

// Starts the exit animation and hands removal to the store, which fires
// onDismiss (always) and onAutoClose (timeouts only). Repeat calls are ignored
// so a swipe racing the timer closes once. The sign of `swipeOffset` picks the
// exit direction.
function close(reason: CloseReason, swipeOffset?: number) {
  if (state.value === "closing") return;
  if (swipeOffset) swipe.value = swipeOffset;
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
  // A stacked toast gets two calls per hover, its own and the stack's. Without
  // this guard the elapsed time would be subtracted twice.
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

function onMouseEnter() {
  pause();
  // Hovering a pill opens it without waiting for the delay.
  opened.value = true;
}

// Opens the pill once it has a body. Re-runs when a promise toast resolves
// with a description it lacked while loading.
watch(
  [opened, hasBody],
  ([isOpened, body]) => {
    if (expandTimeout) clearTimeout(expandTimeout);
    if (isOpened || !body) return;
    expandTimeout = setTimeout(() => (opened.value = true), EXPAND_DELAY);
  },
  { immediate: true },
);

// Re-arms the timer when the duration changes, as when a promise resolves.
watch(duration, (d) => {
  remaining = d;
  // A promise resolving under the cursor must not undo the pause.
  if (!paused.value) startTimer();
});

// A dismiss from app code only flags the toast in the store. Mirroring it here
// makes the toast animate out instead of vanishing.
watch(
  () => props.toast.closing,
  (closing) => {
    if (closing) close("programmatic");
  },
);

// A hovered, expanded stack pauses every toast in it.
watch(
  () => props.expanded,
  (val) => {
    if (!props.stacked) return;
    if (val) pause();
    else resume();
  },
);

function onDragEnd(_: PointerEvent, info: PanInfo) {
  const offset = vertical.value ? info.offset.y : info.offset.x;
  const velocity = vertical.value ? info.velocity.y : info.velocity.x;
  if (
    Math.abs(offset) > SWIPE_THRESHOLD ||
    Math.abs(velocity) > SWIPE_VELOCITY
  ) {
    close("user", offset || velocity);
  } else {
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

// Enter pops in from the anchored edge and exit leaves the same way.
const nudge = computed(() => (props.anchorBottom ? 12 : -12));

const initial = reduceMotion
  ? false
  : {
      opacity: 0,
      scale: 0.6,
      y: props.stackY + (props.anchorBottom ? 12 : -12),
      filter: "blur(6px)",
    };

const liAnimate = computed(() => {
  if (state.value !== "closing") {
    return {
      opacity: props.stackOpacity,
      scale: props.stackScale,
      y: props.stackY,
      filter: "blur(0px)",
    };
  }
  return swipe.value != null
    ? { opacity: 0, y: props.stackY, scale: props.stackScale }
    : {
        opacity: 0,
        scale: 0.85,
        y: props.stackY + nudge.value,
        filter: "blur(4px)",
      };
});

const liTransition = computed(() =>
  reduceMotion ? { duration: 0 } : state.value === "closing" ? EXIT : POP,
);

const bubbleAnimate = computed(() => {
  if (swipe.value == null) return undefined;
  return vertical.value
    ? { y: swipe.value > 0 ? "260%" : "-260%" }
    : { x: swipe.value > 0 ? "130%" : "-130%" };
});

const liStyle = computed(
  () =>
    ({
      zIndex: props.stacked ? props.stackZ : undefined,
      transformOrigin: props.anchorBottom ? "bottom center" : "top center",
    }) as CSSProperties,
);

const bodyTransition = reduceMotion
  ? { duration: 0 }
  : { duration: 0.3, ease: "easeOut", delay: 0.1, layout: MORPH };

onMounted(() => {
  remaining = duration.value;
  startTimer();
  const el = rootEl.value?.$el;
  if (props.stacked && props.reportHeight && el) {
    const report = () => props.reportHeight!(props.toast.id, el.offsetHeight);
    report();
    ro = new ResizeObserver(report);
    ro.observe(el);
  }
});
onBeforeUnmount(() => {
  clearTimer();
  if (closeTimeout) clearTimeout(closeTimeout);
  if (expandTimeout) clearTimeout(expandTimeout);
  ro?.disconnect();
});
</script>

<template>
  <motion.li
    ref="rootEl"
    role="status"
    :aria-live="toast.type === 'error' ? 'assertive' : 'polite'"
    aria-atomic="true"
    :data-state="state"
    :data-type="toast.type"
    :data-variant="variant"
    :data-phase="isOpen ? 'card' : 'pill'"
    :initial="initial"
    :animate="liAnimate"
    :transition="liTransition"
    :style="liStyle"
    :class="
      cn(
        'pointer-events-none flex w-full',
        alignClass(toast.position),
        stacked
          ? cn('absolute inset-x-0', anchorBottom ? 'bottom-0' : 'top-0')
          : 'relative',
      )
    "
    @mouseenter="onMouseEnter"
    @mouseleave="resume"
  >
    <motion.div
      data-slot="bubble"
      :layout="!reduceMotion"
      :drag="state === 'closing' ? false : vertical ? 'y' : 'x'"
      drag-snap-to-origin
      :drag-elastic="0.6"
      :animate="bubbleAnimate"
      :transition="{ layout: MORPH, default: EXIT }"
      :style="{
        borderRadius: `${isOpen ? RADIUS.card : RADIUS.pill}px`,
        touchAction: vertical ? 'pan-x' : 'pan-y',
      }"
      :class="
        cn(
          'group pointer-events-auto relative flex cursor-grab flex-col overflow-hidden border shadow-lg transition-colors duration-300 active:cursor-grabbing',
          TONE[toast.type],
          v.surface,
          isOpen ? 'w-full p-[14px]' : 'max-w-full py-1.5 pl-1.5 pr-2.5',
          !showTile && !isOpen && 'pl-3.5',
        )
      "
      @drag-start="pause"
      @drag-end="onDragEnd"
    >
      <!-- Custom content has no header row, so the close button is absolute
           and the content keeps room for it on the right. -->
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
        <!-- layout="position" keeps the header from stretching mid-morph. -->
        <motion.div
          :layout="reduceMotion ? false : 'position'"
          :transition="MORPH"
          data-slot="header"
          class="flex min-w-0 items-center gap-2.5"
        >
          <span
            v-if="showTile"
            data-slot="icon"
            :class="
              cn(
                'relative flex shrink-0 items-center justify-center rounded-full',
                // Without a glyph the tile is only the ring, a bit smaller.
                iconComp ? cn('size-[26px]', v.tile) : 'size-4',
              )
            "
          >
            <component
              :is="iconComp"
              v-if="iconComp"
              :class="
                cn('size-3.5', toast.type === 'loading' && 'animate-spin')
              "
            />
            <svg
              v-if="showCountdown"
              aria-hidden="true"
              viewBox="0 0 30 30"
              class="absolute -inset-[2px] size-[calc(100%+4px)] -rotate-90"
            >
              <circle
                :key="duration"
                data-slot="countdown"
                cx="15"
                cy="15"
                r="14"
                fill="none"
                :stroke-width="iconComp ? 1.5 : 2.5"
                stroke-linecap="round"
                path-length="100"
                stroke-dasharray="100"
                :class="v.ring"
                :style="{
                  animation: reduceMotion
                    ? 'none'
                    : `sapa-toast-ring ${duration}ms linear forwards`,
                  animationPlayState: paused ? 'paused' : undefined,
                }"
              />
            </svg>
          </span>
          <div
            v-if="toast.title != null"
            :class="
              cn(
                'min-w-0 flex-1 text-sm font-semibold leading-tight',
                !isOpen && 'truncate',
              )
            "
          >
            {{ toast.title }}
          </div>
          <button
            type="button"
            aria-label="Close"
            :class="cn(CLOSE, 'ml-auto shrink-0')"
            @click="close('user')"
          >
            <X class="size-3.5" />
          </button>
        </motion.div>

        <AnimatePresence :initial="false">
          <motion.div
            v-if="isOpen && hasBody"
            key="body"
            :layout="reduceMotion ? false : 'position'"
            data-slot="body"
            :initial="{ opacity: 0, y: -4, filter: 'blur(4px)' }"
            :animate="{ opacity: 1, y: 0, filter: 'blur(0px)' }"
            :exit="{
              opacity: 0,
              filter: 'blur(4px)',
              transition: { duration: 0.12 },
            }"
            :transition="bodyTransition"
          >
            <div
              v-if="toast.description != null"
              class="mt-2 text-sm opacity-80"
            >
              {{ toast.description }}
            </div>

            <div
              v-if="progressValue != null"
              role="progressbar"
              :aria-valuenow="progressValue"
              :aria-valuemin="0"
              :aria-valuemax="100"
              :class="cn('mt-3 h-1.5 overflow-hidden rounded-full', v.track)"
            >
              <div
                :class="
                  cn(
                    'h-full rounded-full transition-[width] duration-300 ease-out',
                    v.bar,
                  )
                "
                :style="{ width: `${progressValue}%` }"
              />
            </div>

            <div v-if="toast.action || toast.cancel" class="mt-3 flex gap-2">
              <button
                v-if="toast.action"
                type="button"
                :class="
                  cn(
                    'inline-flex h-7 items-center rounded-full px-3 text-xs font-medium transition-opacity',
                    v.action,
                  )
                "
                @click="runAction"
              >
                {{ toast.action.label }}
              </button>
              <button
                v-if="toast.cancel"
                type="button"
                :class="
                  cn(
                    'inline-flex h-7 items-center rounded-full border px-3 text-xs font-medium transition-colors',
                    v.cancel,
                  )
                "
                @click="runCancel"
              >
                {{ toast.cancel.label }}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </template>
    </motion.div>
  </motion.li>
</template>
