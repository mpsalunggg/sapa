<script setup lang="ts">
import { toast } from "@/components/ui/useToast"
</script>

<template>
  <button
    type="button"
    class="inline-flex h-9 items-center rounded-md border bg-background px-4 text-sm font-medium shadow-sm transition-colors hover:bg-muted"
    @click="
      toast.success('Event created', {
        description: 'Monday, January 3rd at 6:00pm',
        richColors: true,
      })
    "
  >
    With description
  </button>
</template>
