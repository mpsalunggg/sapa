<script setup lang="ts">
import { toast } from "@/components/ui/sapa-toast/useToast";

const btn =
  "inline-flex h-9 items-center rounded-md border bg-background px-4 text-sm font-medium shadow-sm transition-colors hover:bg-muted";

function solid() {
  toast.success("Payment received", {
    description: "Invoice #1042 has been paid in full.",
    variant: "solid",
  });
}
function minimal() {
  toast.info("New sign-in", {
    description: "Chrome on macOS · Jakarta, Indonesia",
    variant: "minimal",
  });
}
function subtle() {
  toast.warning("Storage almost full", {
    description: "92% of 20 GB used on acme-eu-west.",
    variant: "subtle",
  });
}
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <button type="button" :class="btn" @click="solid">Solid</button>
    <button type="button" :class="btn" @click="minimal">Minimal</button>
    <button type="button" :class="btn" @click="subtle">Subtle</button>
  </div>
</template>
