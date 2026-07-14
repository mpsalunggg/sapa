<script setup lang="ts">
import { defineComponent, h } from "vue";

import { toast } from "@/components/ui/sapa-toast/useToast";

const FriendRequest = defineComponent(
  () => () =>
    h("div", { class: "flex items-center gap-3" }, [
      h("img", {
        src: "https://avatars.githubusercontent.com/u/124599?v=4",
        alt: "",
        class: "size-10 rounded-full",
      }),
      h("div", { class: "space-y-0.5" }, [
        h("p", { class: "text-sm font-medium" }, "Olivia Martin"),
        h(
          "p",
          { class: "text-xs text-muted-foreground" },
          "sent you a friend request",
        ),
      ]),
      h(
        "button",
        {
          type: "button",
          class:
            "ml-2 inline-flex h-7 items-center rounded-md bg-foreground px-2.5 text-xs font-medium text-background",
          onClick: () => toast.success("Accepted"),
        },
        "Accept",
      ),
    ]),
);

function showToast() {
  toast.custom(FriendRequest, { duration: 6000 });
}
</script>

<template>
  <button
    type="button"
    class="bg-background hover:bg-muted inline-flex h-9 items-center rounded-md border px-4 text-sm font-medium shadow-sm transition-colors"
    @click="showToast"
  >
    Custom content
  </button>
</template>
