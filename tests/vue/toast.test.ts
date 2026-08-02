import { enableAutoUnmount, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";

import Toast from "../../registry/vue/ui/Toast.vue";
import Toaster from "../../registry/vue/ui/Toaster.vue";
import { clear, toast } from "../../registry/vue/ui/useToast";
import { EXIT_MS, useToastTimers } from "../helpers";

// Teleported markup lives on document.body, so every wrapper has to be torn
// down properly between tests.
enableAutoUnmount(afterEach);

beforeEach(() => {
  useToastTimers();
});

afterEach(() => {
  clear();
  vi.useRealTimers();
});

/** Advance timers and let Vue flush the resulting reactive updates. */
async function advance(ms: number) {
  vi.advanceTimersByTime(ms);
  await nextTick();
  await nextTick();
}

// <Toaster> teleports to body, so queries go through the document.
const item = () => document.querySelector<HTMLElement>("li[role='status']");
const button = (label: string) =>
  [...document.querySelectorAll("button")].find(
    (b) =>
      b.getAttribute("aria-label") === label || b.textContent?.trim() === label,
  )!;

async function mountToaster(props: Record<string, unknown> = {}) {
  mount(Toaster, { props });
  await advance(0);
}

/**
 * Native mouseenter fires on every element of the entered chain, so a stacked
 * toast gets one pause() from its own handler and one from the group container.
 * jsdom does not synthesise that, so dispatch it on both.
 */
function hoverStack(el: HTMLElement) {
  el.parentElement!.dispatchEvent(new MouseEvent("mouseenter"));
  el.dispatchEvent(new MouseEvent("mouseenter"));
}
function unhoverStack(el: HTMLElement) {
  el.parentElement!.dispatchEvent(new MouseEvent("mouseleave"));
  el.dispatchEvent(new MouseEvent("mouseleave"));
}

describe("hover pauses the auto-dismiss timer", () => {
  it("does not consume the remaining time twice in stacked mode", async () => {
    await mountToaster();
    toast("hi", { duration: 4000 });
    await advance(0);

    await advance(3000); // 1000 ms left
    const el = item()!;
    hoverStack(el);
    await advance(2000); // paused
    unhoverStack(el);

    await advance(900);
    expect(item()).not.toBeNull();

    await advance(100 + EXIT_MS + 10);
    expect(item()).toBeNull();
  });
});

describe("close paths", () => {
  it("fires onDismiss once even when close is triggered twice", async () => {
    const onDismiss = vi.fn();
    await mountToaster();
    toast("hi", { onDismiss });
    await advance(0);

    const close = button("Close");
    close.click();
    close.click();
    await advance(EXIT_MS + 10);

    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(item()).toBeNull();
  });

  it("does not call onAutoClose when the user closes the toast", async () => {
    const onAutoClose = vi.fn();
    const onDismiss = vi.fn();
    await mountToaster();
    toast("hi", { onAutoClose, onDismiss });
    await advance(0);

    button("Close").click();
    await advance(EXIT_MS + 10);

    expect(onAutoClose).not.toHaveBeenCalled();
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("calls onAutoClose when the duration runs out", async () => {
    const onAutoClose = vi.fn();
    await mountToaster();
    toast("hi", { duration: 1000, onAutoClose });
    await advance(0);

    await advance(1000 + EXIT_MS + 10);

    expect(onAutoClose).toHaveBeenCalledTimes(1);
    expect(item()).toBeNull();
  });

  it("treats an action click as a user close, not an auto close", async () => {
    const onAutoClose = vi.fn();
    const onClick = vi.fn();
    await mountToaster();
    toast("hi", { action: { label: "Undo", onClick }, onAutoClose });
    await advance(0);

    button("Undo").click();
    await advance(EXIT_MS + 10);

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onAutoClose).not.toHaveBeenCalled();
    expect(item()).toBeNull();
  });
});

describe("programmatic dismiss", () => {
  it("plays the exit animation before removing the toast", async () => {
    await mountToaster();
    const id = toast("hi");
    await advance(0);

    toast.dismiss(id);
    await advance(0);

    expect(item()).not.toBeNull();
    expect(item()!.dataset.state).toBe("closing");
    expect(item()!.style.opacity).toBe("0");

    await advance(EXIT_MS + 10);
    expect(item()).toBeNull();
  });

  it("calls onClosed with the reason for a standalone toast outside the store", async () => {
    const onClosed = vi.fn();
    mount(Toast, {
      props: {
        toast: {
          id: "solo",
          type: "default",
          title: "hi",
          duration: 1000,
          createdAt: Date.now(),
        },
        onClosed,
      },
      attachTo: document.body,
    });
    await advance(0);

    await advance(1000 + EXIT_MS + 10);
    expect(onClosed).toHaveBeenCalledWith("timeout");
  });
});

describe("stacked markup", () => {
  it("keeps the list element free of non-li children", async () => {
    await mountToaster();
    toast("hi");
    await advance(0);

    const list = document.querySelector("ol")!;
    for (const child of list.children) {
      expect(child.tagName).toBe("LI");
    }
  });
});
