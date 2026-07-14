<script setup lang="ts">
import { toast, type ToastPosition } from "@/components/ui/sapa-toast/useToast";

const positions: ToastPosition[] = [
  "top-left",
  "top-center",
  "top-right",
  "bottom-left",
  "bottom-center",
  "bottom-right",
];
</script>

<template>
  <div class="grid grid-cols-3 gap-2">
    <button
      v-for="position in positions"
      :key="position"
      type="button"
      class="bg-background hover:bg-muted inline-flex h-9 items-center justify-center rounded-md border px-3 text-xs font-medium shadow-sm transition-colors"
      @click="toast(position, { position, richColors: true, type: 'info' })"
    >
      {{ position }}
    </button>
  </div>
</template>
