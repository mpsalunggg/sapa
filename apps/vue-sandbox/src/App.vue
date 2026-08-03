<script setup lang="ts">
import { onMounted, ref } from "vue";

import Toaster from "@/components/ui/Toaster.vue";
import ToastDefault from "../../../registry/vue/examples/ToastDefault.vue";
import ToastTypes from "../../../registry/vue/examples/ToastTypes.vue";
import ToastDescription from "../../../registry/vue/examples/ToastDescription.vue";
import ToastAction from "../../../registry/vue/examples/ToastAction.vue";
import ToastPromise from "../../../registry/vue/examples/ToastPromise.vue";
import ToastCustom from "../../../registry/vue/examples/ToastCustom.vue";
import ToastPositions from "../../../registry/vue/examples/ToastPositions.vue";

const dark = ref(false);
function toggle() {
  dark.value = !dark.value;
  document.documentElement.classList.toggle("dark", dark.value);
}
onMounted(() => {
  dark.value = window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.classList.toggle("dark", dark.value);
});

const variants = [
  { title: "Default", comp: ToastDefault },
  { title: "Types · rich colors", comp: ToastTypes },
  { title: "Title + description", comp: ToastDescription },
  { title: "Action + cancel", comp: ToastAction },
  { title: "Promise", comp: ToastPromise },
  { title: "Custom content", comp: ToastCustom },
  { title: "Positions", comp: ToastPositions },
];
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-10">
    <header class="mb-10 flex items-center justify-between">
      <h1 class="text-2xl font-bold tracking-tight">Sapa — Vue sandbox</h1>
      <button
        type="button"
        class="bg-background hover:bg-muted inline-flex h-9 items-center rounded-md border px-3 text-sm font-medium shadow-sm"
        @click="toggle"
      >
        {{ dark ? "Light" : "Dark" }}
      </button>
    </header>

    <div class="grid gap-4 sm:grid-cols-2">
      <div
        v-for="v in variants"
        :key="v.title"
        class="bg-card flex flex-col gap-3 rounded-xl border p-5"
      >
        <h3 class="font-semibold">{{ v.title }}</h3>
        <div
          class="bg-muted/30 flex min-h-20 items-center justify-center rounded-lg border border-dashed p-4"
        >
          <component :is="v.comp" />
        </div>
      </div>
    </div>

    <Toaster position="bottom-right" />
  </div>
</template>
