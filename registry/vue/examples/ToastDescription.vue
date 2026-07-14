<script setup lang="ts">
import { toast } from "@/components/ui/sapa-toast/useToast";
</script>

<template>
  <button
    type="button"
    class="bg-background hover:bg-muted inline-flex h-9 items-center rounded-md border px-4 text-sm font-medium shadow-sm transition-colors"
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
