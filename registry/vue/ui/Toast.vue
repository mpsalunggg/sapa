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
  type ToastData,
  type ToastSize,
  type ToastType,
  type ToastVariant,
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

const compact = computed(
  () =>
    !props.toast.component &&
    !props.toast.description &&
    !props.toast.action &&
    !props.toast.cancel &&
    props.toast.progress == null,
);

/** Clamped determinate progress (toast.progress), or null when not a progress toast. */
const progressValue = computed(() =>
  props.toast.progress == null
    ? null
    : Math.min(100, Math.max(0, props.toast.progress)),
);

// Effective variant — `richColors: true` is a deprecated alias for "outline".
const variant = computed<ToastVariant>(
  () => props.toast.variant ?? (props.toast.richColors ? "outline" : "default"),
);
const size = computed<ToastSize>(() => props.toast.size ?? "default");

// Variant classes applied last on the root <li> (tailwind-merge lets them win).
const variantClass = computed(() => {
  const t = props.toast.type;
  switch (variant.value) {
    case "outline":
      return OUTLINE[t];
    case "filled":
      return FILLED[t];
    case "accent":
      return ACCENT[t];
    default:
      return "";
  }
});

// Icon chip: translucent on the filled surface, otherwise the solid colored chip.
const chipClass = computed(() =>
  variant.value === "filled"
    ? "bg-white/20 text-current"
    : CHIP[props.toast.type],
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

// Animate out (directional), then remove — mirrors the React <Toast> closing
// state so stacked toasts slide away instead of vanishing. `swipe` is the drag
// offset (px): its sign picks the exit direction.
function close(swipe?: number) {
  if (state.value === "closing") return;
  exitTransform.value = swipe
    ? vertical.value
      ? `translateY(${swipe > 0 ? 260 : -260}%)`
      : `translateX(${swipe > 0 ? 130 : -130}%)`
    : dir.value;
  state.value = "closing";
  clearTimer();
  closeTimeout = setTimeout(
    () => {
      props.toast.onAutoClose?.(props.toast);
      dismiss(props.toast.id);
    },
    reduceMotion ? 0 : 320,
  );
}

function startTimer() {
  if (!Number.isFinite(remaining)) return;
  startedAt = Date.now();
  clearTimer();
  timer = setTimeout(close, remaining);
}

function pause() {
  if (state.value === "closing") return;
  paused.value = true;
  if (!Number.isFinite(remaining)) return;
  clearTimer();
  remaining -= Date.now() - startedAt;
}

function resume() {
  if (state.value === "closing") return;
  paused.value = false;
  startTimer();
}

// Re-arm the auto-dismiss timer when the duration changes (e.g. a promise
// toast transitions loading→success), matching the React useEffect([duration]).
watch(duration, (d) => {
  remaining = d;
  startTimer();
});

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
    close(offset.value); // exit toward the swipe direction
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
    :data-type="toast.type"
    :style="stackStyle"
    :class="
      cn(
        'bg-popover/95 text-popover-foreground group pointer-events-auto flex w-full gap-3 overflow-hidden border p-4 pr-10 shadow-xl shadow-black/5 backdrop-blur',
        stacked
          ? cn('absolute inset-x-0', anchorBottom ? 'bottom-0' : 'top-0')
          : 'relative',
        compact ? 'items-center rounded-full' : 'items-start rounded-3xl',
        !dragging && 'cursor-grab active:cursor-grabbing',
        SIZE_ROOT[size],
        variantClass,
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
            'flex shrink-0 items-center justify-center rounded-full',
            SIZE_CHIP[size],
            !compact && 'mt-0.5',
            chipClass,
          )
        "
      >
        <component
          :is="iconComp"
          :class="
            cn(SIZE_GLYPH[size], toast.type === 'loading' && 'animate-spin')
          "
        />
      </span>
      <div class="flex-1 space-y-1">
        <div
          v-if="toast.title != null"
          :class="
            cn(
              'font-semibold leading-tight',
              SIZE_TITLE[size],
              variant === 'outline' && RICH_TEXT[toast.type],
            )
          "
        >
          {{ toast.title }}
        </div>
        <div
          v-if="toast.description != null"
          :class="cn('opacity-90', SIZE_DESC[size])"
        >
          {{ toast.description }}
        </div>
        <div
          v-if="progressValue != null"
          role="progressbar"
          :aria-valuenow="progressValue"
          :aria-valuemin="0"
          :aria-valuemax="100"
          class="bg-muted mt-2 h-1.5 w-full overflow-hidden rounded-full"
        >
          <div
            class="from-sapa-warning to-sapa-error bg-linear-to-r h-full rounded-full transition-[width] duration-300 ease-out"
            :style="{ width: `${progressValue}%` }"
          />
        </div>
        <div v-if="toast.action || toast.cancel" class="mt-2 flex gap-2">
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
      </div>
    </template>

    <button
      type="button"
      aria-label="Close"
      class="focus-visible:ring-ring absolute right-2 top-2 rounded-full p-1 opacity-0 transition-opacity hover:bg-black/5 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 group-hover:opacity-70 dark:hover:bg-white/10"
      @click="close()"
    >
      <X class="size-4" />
    </button>

    <span
      v-if="showProgress"
      class="absolute inset-x-3 bottom-1.5 h-1 origin-left rounded-full bg-current opacity-25"
      :style="{
        animation: reduceMotion
          ? 'none'
          : `sapa-toast-progress ${duration}ms linear forwards`,
        animationPlayState: paused || dragging ? 'paused' : undefined,
      }"
    />
  </li>
</template>
