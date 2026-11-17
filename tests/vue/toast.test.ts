import { enableAutoUnmount, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";

import Toast from "../../registry/vue/ui/Toast.vue";
import Toaster from "../../registry/vue/ui/Toaster.vue";
import { clear, toast } from "../../registry/vue/ui/useToast";
import { EXIT_MS, EXPAND_DELAY, useToastTimers } from "../helpers";

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
const bubble = () =>
  item()!.querySelector<HTMLElement>("[data-slot='bubble']")!;
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
    await advance(0); // mount first, so the expand timer is armed
    await advance(EXPAND_DELAY); // the action lives in the body

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

describe("bubble layout", () => {
  const phase = () => item()!.dataset.phase;
  const body = () => item()!.querySelector<HTMLElement>("[data-slot='body']");
  const hasText = (text: string) => !!item()!.textContent?.includes(text);

  it("shows the title as a pill first, then opens up for the description", async () => {
    await mountToaster();
    toast("Backup completed", { description: "1,248 records archived" });
    await advance(0);

    expect(phase()).toBe("pill");
    expect(hasText("Backup completed")).toBe(true);
    expect(hasText("1,248 records archived")).toBe(false);

    await advance(EXPAND_DELAY);
    expect(phase()).toBe("card");
    expect(hasText("1,248 records archived")).toBe(true);
  });

  it("opens a pill right away when it is hovered", async () => {
    await mountToaster();
    toast("Backup completed", { description: "1,248 records archived" });
    await advance(0);

    item()!.dispatchEvent(new MouseEvent("mouseenter"));
    await advance(0);
    expect(phase()).toBe("card");
  });

  it("keeps a title-only toast as a pill", async () => {
    await mountToaster();
    toast("Copied");
    await advance(EXPAND_DELAY * 2);

    expect(phase()).toBe("pill");
    expect(body()).toBeNull();
  });

  it("renders the description in the body, below the header row", async () => {
    await mountToaster();
    toast("Backup completed", { description: "1,248 records archived" });
    await advance(0);
    await advance(EXPAND_DELAY);

    const header = item()!.querySelector("[data-slot='header']")!;
    expect(header.textContent).toContain("Backup completed");
    expect(header.textContent).not.toContain("1,248 records archived");
    expect(body()!.textContent).toContain("1,248 records archived");
  });

  it("colors the icon tile from the toast type", async () => {
    await mountToaster();
    toast.error("Connection lost");
    await advance(0);

    const tile = item()!.querySelector("[data-slot='icon']")!;
    expect(item()!.dataset.variant).toBe("minimal");
    expect(bubble().className).toContain("[--tone:var(--sapa-error)]");
    expect(tile.className).toContain("text-(--tone)");
  });
});

describe("countdown ring and progress bar", () => {
  const ring = () =>
    item()!.querySelector<SVGElement>("[data-slot='countdown']");
  const ringClass = () => ring()!.getAttribute("class") ?? "";
  const track = () =>
    document.querySelector<HTMLElement>("[role='progressbar']")!;

  it("puts the determinate bar inside the card body", async () => {
    await mountToaster();
    toast.progress("Uploading…", { value: 62 });
    await advance(0);
    await advance(EXPAND_DELAY);

    expect(item()!.querySelector("[data-slot='body']")!.contains(track())).toBe(
      true,
    );
    expect(track().getAttribute("aria-valuenow")).toBe("62");
    expect((track().firstElementChild as HTMLElement).style.width).toBe("62%");
  });

  it("clamps an out-of-range progress value", async () => {
    await mountToaster();
    toast.progress("Uploading…", { value: 140 });
    await advance(0);
    await advance(EXPAND_DELAY);

    expect(track().getAttribute("aria-valuenow")).toBe("100");
    expect((track().firstElementChild as HTMLElement).style.width).toBe("100%");
  });

  it("colors the countdown ring from the toast type", async () => {
    await mountToaster();
    toast.success("Saved", { duration: 4000 });
    await advance(0);

    expect(bubble().className).toContain("[--tone:var(--sapa-success)]");
    expect(ringClass()).toContain("stroke-(--tone)");
    expect(ring()!.style.animation).toContain("sapa-toast-ring");
  });

  it("falls back to a neutral ring for types with no semantic hue", async () => {
    await mountToaster();
    toast("Copied", { duration: 4000 });
    await advance(0);

    expect(bubble().className).toContain("[--tone:var(--foreground)]");
    expect(ringClass()).toContain("stroke-(--tone)");
  });

  it("hides the countdown ring when a progress value is shown", async () => {
    await mountToaster();
    toast.progress("Uploading…", { value: 40, duration: 4000 });
    await advance(0);

    expect(ring()).toBeNull();
  });
});

describe("color variants", () => {
  it("fills the bubble with the tone for solid", async () => {
    await mountToaster();
    toast.success("Saved", { variant: "solid" });
    await advance(0);

    expect(item()!.dataset.variant).toBe("solid");
    expect(bubble().className).toContain("bg-(--tone)");
    expect(bubble().className).toContain("text-(--tone-fg)");
  });

  it("washes the bubble in an opaque tint for subtle", async () => {
    await mountToaster();
    toast.warning("Heads up", { variant: "subtle" });
    await advance(0);

    expect(item()!.dataset.variant).toBe("subtle");
    expect(bubble().className).toContain("color-mix");
  });

  it("uses the Toaster default, which a toast can override", async () => {
    await mountToaster({ variant: "subtle" });
    toast("From the toaster");
    toast("Own choice", { variant: "solid" });
    await advance(0);

    const variants = [
      ...document.querySelectorAll<HTMLElement>("li[role='status']"),
    ].map((el) => el.dataset.variant);
    expect(variants.sort()).toEqual(["solid", "subtle"]);
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
