<script setup lang="ts">
import { computed } from "vue";

import { cn } from "@/lib/utils";
import Toast from "./Toast.vue";
import { toasts, type ToastData, type ToastPosition } from "./useToast";

const props = withDefaults(
  defineProps<{ position?: ToastPosition; richColors?: boolean }>(),
  { position: "bottom-right", richColors: false },
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

// Enter/exit slide direction based on the group's position.
function dirClass(pos: ToastPosition): string {
  if (pos.endsWith("left")) return "-translate-x-full opacity-0";
  if (pos.endsWith("right")) return "translate-x-full opacity-0";
  return pos.startsWith("top")
    ? "-translate-y-[220%] opacity-0"
    : "translate-y-[220%] opacity-0";
}

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
</script>

<template>
  <Teleport to="body">
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
      enter-active-class="transition-all duration-300 ease-out"
      leave-active-class="transition-all duration-300 ease-in absolute"
      :leave-to-class="dirClass(pos)"
      move-class="transition-transform duration-300"
    >
      <Toast v-for="t in items" :key="t.id" :toast="t" />
    </TransitionGroup>
  </Teleport>
</template>
