<script setup lang="ts">
import { toast } from "@/components/ui/sapa-toast/useToast"

const btn =
  "inline-flex h-9 items-center rounded-md border bg-background px-4 text-sm font-medium shadow-sm transition-colors hover:bg-muted"
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <button
      type="button"
      :class="btn"
      @click="toast.success('Changes saved', { richColors: true })"
    >
      Success
    </button>
    <button
      type="button"
      :class="btn"
      @click="toast.error('Something went wrong', { richColors: true })"
    >
      Error
    </button>
    <button
      type="button"
      :class="btn"
      @click="toast.warning('Your session is about to expire', { richColors: true })"
    >
      Warning
    </button>
    <button
      type="button"
      :class="btn"
      @click="toast.info('A new update is available', { richColors: true })"
    >
      Info
    </button>
  </div>
</template>
