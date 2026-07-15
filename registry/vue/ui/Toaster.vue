<script setup lang="ts">
import { computed, reactive } from "vue";

import { cn } from "@/lib/utils";
import Toast from "./Toast.vue";
import { toasts, type ToastData, type ToastPosition } from "./useToast";

const props = withDefaults(
  defineProps<{
    position?: ToastPosition;
    richColors?: boolean;
    expand?: boolean;
  }>(),
  { position: "bottom-right", richColors: false, expand: false },
);

const POSITION_CLASSES: Record<ToastPosition, string> = {
  "top-left": "top-0 left-0 sm:items-start",
  "top-center": "top-0 left-1/2 -translate-x-1/2 sm:items-center",
  "top-right": "top-0 right-0 sm:items-end",
  "bottom-left": "bottom-0 left-0 flex-col-reverse sm:items-start",
  "bottom-center":
    "bottom-0 left-1/2 -translate-x-1/2 flex-col-reverse sm:items-center",
  "bottom-right": "bottom-0 right-0 flex-col-reverse sm:items-end",
};

// Sonner-style stack tuning.
const PEEK = 14;
const GAP = 14;
const SCALE_STEP = 0.05;
const MAX_VISIBLE = 3;

// Enter/exit slide direction based on the group's position (flat-list mode).
function dirClass(pos: ToastPosition): string {
  if (pos.endsWith("left")) return "-translate-x-full opacity-0";
  if (pos.endsWith("right")) return "translate-x-full opacity-0";
  return pos.startsWith("top")
    ? "-translate-y-[220%] opacity-0"
    : "translate-y-[220%] opacity-0";
}

const heights = reactive<Record<string | number, number>>({});
const expandedMap = reactive<Record<string, boolean>>({});

function registerHeight(id: string | number, h: number) {
  if (heights[id] !== h) heights[id] = h;
}
const h = (id: string | number) => heights[id] ?? 76;

const groups = computed(() => {
  const map = new Map<ToastPosition, ToastData[]>();
  for (const t of toasts) {
    const pos = t.position ?? props.position;
    if (!map.has(pos)) map.set(pos, []);
    map.get(pos)!.push({
      ...t,
      position: pos,
      richColors: t.richColors ?? props.richColors,
    });
  }
  return [...map.entries()];
});

function containerHeight(items: ToastData[], pos: string): number {
  const expanded = !!expandedMap[pos];
  if (expanded) {
    const total = items.reduce((s, t) => s + h(t.id), 0);
    return total + Math.max(0, items.length - 1) * GAP;
  }
  const front = items[0] ? h(items[0].id) : 0;
  const visibleBehind = Math.min(items.length - 1, MAX_VISIBLE - 1);
  return front + visibleBehind * PEEK;
}

function layoutFor(items: ToastData[], i: number, pos: ToastPosition) {
  const expanded = !!expandedMap[pos];
  const dir = pos.startsWith("top") ? 1 : -1;
  let expandedOffset = 0;
  for (let k = 0; k < i; k++) expandedOffset += h(items[k].id) + GAP;
  return {
    anchorBottom: !pos.startsWith("top"),
    stackY: expanded ? dir * expandedOffset : dir * i * PEEK,
    stackScale: expanded ? 1 : 1 - i * SCALE_STEP,
    stackOpacity: expanded ? 1 : i < MAX_VISIBLE ? 1 : 0,
    stackZ: items.length - i,
  };
}
</script>

<template>
  <Teleport to="body">
    <!-- Flat-list mode -->
    <template v-if="expand">
      <TransitionGroup
        v-for="[pos, items] in groups"
        :key="pos"
        tag="ol"
        :class="
          cn(
            'pointer-events-none fixed z-[100] flex max-h-screen w-full flex-col gap-2 p-4 sm:max-w-[380px]',
            POSITION_CLASSES[pos],
          )
        "
        enter-from-class="opacity-0 scale-95"
        enter-active-class="transition-all duration-300 ease-out motion-reduce:transition-none"
        leave-active-class="transition-all duration-300 ease-in absolute motion-reduce:transition-none"
        :leave-to-class="dirClass(pos)"
        move-class="transition-transform duration-300 motion-reduce:transition-none"
      >
        <Toast v-for="t in items" :key="t.id" :toast="t" />
      </TransitionGroup>
    </template>

    <!-- Stacked mode (default) -->
    <template v-else>
      <ol
        v-for="[pos, items] in groups"
        :key="pos"
        :class="
          cn(
            'pointer-events-none fixed z-[100] flex w-full p-4 sm:max-w-[380px]',
            POSITION_CLASSES[pos],
          )
        "
      >
        <div
          class="pointer-events-auto relative w-full transition-[height] duration-300 ease-out"
          :style="{ height: containerHeight(items, pos) + 'px' }"
          @mouseenter="expandedMap[pos] = true"
          @mouseleave="expandedMap[pos] = false"
        >
          <Toast
            v-for="(t, i) in items"
            :key="t.id"
            :toast="t"
            stacked
            :expanded="!!expandedMap[pos]"
            :anchor-bottom="layoutFor(items, i, pos).anchorBottom"
            :stack-y="layoutFor(items, i, pos).stackY"
            :stack-scale="layoutFor(items, i, pos).stackScale"
            :stack-opacity="layoutFor(items, i, pos).stackOpacity"
            :stack-z="layoutFor(items, i, pos).stackZ"
            :report-height="registerHeight"
          />
        </div>
      </ol>
    </template>
  </Teleport>
</template>
