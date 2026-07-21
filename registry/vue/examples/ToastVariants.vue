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
      @click="toast.success('Berhasil dijalankan', { variant: 'filled' })"
    >
      Filled
    </button>
    <button
      type="button"
      :class="btn"
      @click="toast.info('Jalankan operasi', { variant: 'outline' })"
    >
      Outline
    </button>
    <button
      type="button"
      :class="btn"
      @click="toast.warning('Perubahan disimpan', { variant: 'accent' })"
    >
      Accent
    </button>
  </div>
</template>
