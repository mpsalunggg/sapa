<script setup lang="ts">
import { toast } from "@/components/ui/sapa-toast/useToast";

const btn =
  "inline-flex h-9 items-center rounded-md border bg-background px-4 text-sm font-medium shadow-sm transition-colors hover:bg-muted";
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <button
      type="button"
      :class="btn"
      @click="toast.info('Ukuran kecil', { size: 'sm' })"
    >
      Small
    </button>
    <button
      type="button"
      :class="btn"
      @click="toast.info('Ukuran default', { size: 'default' })"
    >
      Default
    </button>
    <button
      type="button"
      :class="btn"
      @click="toast.info('Ukuran besar', { size: 'lg' })"
    >
      Large
    </button>
  </div>
</template>
