<script setup lang="ts">
import { toast } from "@/components/ui/sapa-toast/useToast"

function fakeUpload(): Promise<{ name: string }> {
  return new Promise((resolve, reject) =>
    setTimeout(() => {
      Math.round(Date.now() / 1000) % 2 === 0
        ? resolve({ name: "avatar.png" })
        : reject(new Error("Network error"))
    }, 1800)
  )
}

function showToast() {
  toast.promise(fakeUpload(), {
    loading: "Uploading file…",
    success: (data) => `${data.name} uploaded`,
    error: (err) => `Upload failed: ${(err as Error).message}`,
  })
}
</script>

<template>
  <button
    type="button"
    class="inline-flex h-9 items-center rounded-md border bg-background px-4 text-sm font-medium shadow-sm transition-colors hover:bg-muted"
    @click="showToast"
  >
    Promise
  </button>
</template>
