<script setup lang="ts">
import { toast } from "@/components/ui/sapa-toast/useToast";

function showToast() {
  toast("File deleted", {
    description: "report-2026.pdf was moved to trash.",
    duration: 8000,
    action: { label: "Undo", onClick: () => toast.success("Restored") },
    cancel: { label: "Dismiss" },
  });
}
</script>

<template>
  <button
    type="button"
    class="bg-background hover:bg-muted inline-flex h-9 items-center rounded-md border px-4 text-sm font-medium shadow-sm transition-colors"
    @click="showToast"
  >
    With action
  </button>
</template>
