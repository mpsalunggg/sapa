<script setup lang="ts">
import { toast } from "@/components/ui/sapa-toast/useToast"

function showToast() {
  toast("File deleted", {
    description: "report-2026.pdf was moved to trash.",
    duration: 8000,
    action: { label: "Undo", onClick: () => toast.success("Restored") },
    cancel: { label: "Dismiss" },
  })
}
</script>

<template>
  <button
    type="button"
    class="inline-flex h-9 items-center rounded-md border bg-background px-4 text-sm font-medium shadow-sm transition-colors hover:bg-muted"
    @click="showToast"
  >
    With action
  </button>
</template>
