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

describe("square layout", () => {
  it("renders the description as a sibling of the header, not inside it", async () => {
    await mountToaster();
    toast("Backup completed", { description: "1,248 records archived" });
    await advance(0);

    const root = item()!;
    // The header row's textContent equals the title too (the tile holds no
    // text), so take the *last* match — the innermost element in tree order.
    const byText = (text: string) =>
      [...root.querySelectorAll("div")]
        .filter((d) => d.textContent?.trim() === text)
        .pop()!;
    const title = byText("Backup completed");
    const description = byText("1,248 records archived");

    // The header holds the tile + title; the description sits below it at the
    // card's full width. If it ever lands back inside the header row it would
    // be indented under the icon again.
    expect(description.parentElement).toBe(root);
    expect(title.parentElement).not.toBe(root);
    expect(title.parentElement!.contains(description)).toBe(false);
  });

  it("colors the icon tile from the toast type", async () => {
    await mountToaster();
    toast.error("Connection lost");
    await advance(0);

    const tile = item()!.querySelector("span.rounded-\\[8px\\]")!;
    expect(tile.className).toContain("bg-sapa-error/10");
    expect(tile.className).toContain("text-sapa-error");
  });
});

describe("bottom-edge bars", () => {
  /** Every bar — countdown or determinate — is a direct child of the <li>. */
  const bars = () =>
    [...item()!.children].filter((el) =>
      el.className.includes("bottom-0"),
    ) as HTMLElement[];
  const track = () =>
    document.querySelector<HTMLElement>("[role='progressbar']")!;

  it("pins the determinate bar to the card's bottom edge, not the content flow", async () => {
    await mountToaster();
    toast.progress("Uploading…", { value: 62 });
    await advance(0);

    expect(track().parentElement).toBe(item());
    expect(track().className).toContain("bottom-0");
    expect(track().getAttribute("aria-valuenow")).toBe("62");
    expect((track().firstElementChild as HTMLElement).style.width).toBe("62%");
  });

  it("clamps an out-of-range progress value", async () => {
    await mountToaster();
    toast.progress("Uploading…", { value: 140 });
    await advance(0);

    expect(track().getAttribute("aria-valuenow")).toBe("100");
    expect((track().firstElementChild as HTMLElement).style.width).toBe("100%");
  });

  it("colors the countdown bar from the toast type", async () => {
    await mountToaster();
    toast.success("Saved", { duration: 4000 });
    await advance(0);

    const [bar, ...rest] = bars();
    expect(rest).toHaveLength(0);
    expect(bar.className).toContain("bg-sapa-success");
    expect(bar.className).toContain("origin-left");
  });

  it("falls back to a neutral bar for types with no semantic hue", async () => {
    await mountToaster();
    toast("Copied", { duration: 4000 });
    await advance(0);

    expect(bars()[0].className).toContain("bg-foreground");
  });

  it("hides the countdown bar when a progress value owns the strip", async () => {
    await mountToaster();
    // Both are set, so the two bars would otherwise stack on the same pixels.
    toast.progress("Uploading…", { value: 40, duration: 4000 });
    await advance(0);

    const drawn = bars();
    expect(drawn).toHaveLength(1);
    expect(drawn[0]).toBe(track());
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
