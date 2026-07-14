<script setup lang="ts">
import { toast } from "@/components/ui/sapa-toast/useToast";

const MESSAGES = [
  "Event has been created",
  "Your report is ready",
  "New comment on your post",
  "Payment received",
  "Deployment finished",
];

function stack() {
  MESSAGES.forEach((m, i) =>
    setTimeout(() => toast(m, { description: "Just now" }), i * 220),
  );
}
</script>

<template>
  <button
    type="button"
    class="bg-background hover:bg-muted inline-flex h-9 items-center rounded-md border px-4 text-sm font-medium shadow-sm transition-colors"
    @click="stack"
  >
    Stack toasts
  </button>
</template>
