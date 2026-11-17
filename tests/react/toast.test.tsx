import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Toast } from "../../registry/react/ui/toast";
import { toast, toastStore } from "../../registry/react/ui/toast-store";
import { Toaster } from "../../registry/react/ui/toaster";
import { EXIT_MS, EXPAND_DELAY, useToastTimers } from "../helpers";

beforeEach(() => {
  useToastTimers();
});

afterEach(() => {
  cleanup();
  toastStore.clear();
  vi.useRealTimers();
});

/** Advances timers inside act() so React flushes the state updates. */
const advance = (ms: number) =>
  act(() => {
    vi.advanceTimersByTime(ms);
  });

function mountToaster(props: Parameters<typeof Toaster>[0] = {}) {
  render(<Toaster {...props} />);
  advance(0);
}

const item = () => screen.queryByRole("status");
const bubble = () =>
  item()!.querySelector<HTMLElement>("[data-slot='bubble']")!;

// React builds onMouseEnter on top of mouseover and fires it on every element
// in the entered chain, so a stacked toast gets two pause() calls per hover.
// fireEvent.mouseEnter would only reach one element.
const hover = (el: Element) =>
  fireEvent.mouseOver(el, { relatedTarget: document.body });
const unhover = (el: Element) =>
  fireEvent.mouseOut(el, { relatedTarget: document.body });

describe("hover pauses the auto-dismiss timer", () => {
  it("does not consume the remaining time twice in stacked mode", () => {
    mountToaster();
    act(() => {
      toast("hi", { duration: 4000 });
    });

    advance(3000); // 1000 ms left on the clock
    const el = item()!;
    hover(el);
    advance(2000); // paused, so the remaining 1000 ms is untouched
    unhover(el);

    advance(900);
    expect(item()).not.toBeNull();

    advance(100 + EXIT_MS + 10);
    expect(item()).toBeNull();
  });

  it("survives a hover on the flat list layout too", () => {
    mountToaster({ expand: true });
    act(() => {
      toast("hi", { duration: 4000 });
    });

    advance(3000);
    const el = item()!;
    hover(el);
    advance(2000);
    unhover(el);

    advance(900);
    expect(item()).not.toBeNull();
  });
});

describe("close paths", () => {
  it("fires onDismiss once even when close is triggered twice", () => {
    const onDismiss = vi.fn();
    mountToaster();
    act(() => {
      toast("hi", { onDismiss });
    });

    const close = screen.getByRole("button", { name: "Close" });
    fireEvent.click(close);
    fireEvent.click(close);
    advance(EXIT_MS + 10);

    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(item()).toBeNull();
  });

  it("does not call onAutoClose when the user closes the toast", () => {
    const onAutoClose = vi.fn();
    const onDismiss = vi.fn();
    mountToaster();
    act(() => {
      toast("hi", { onAutoClose, onDismiss });
    });

    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    advance(EXIT_MS + 10);

    expect(onAutoClose).not.toHaveBeenCalled();
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("calls onAutoClose when the duration runs out", () => {
    const onAutoClose = vi.fn();
    mountToaster();
    act(() => {
      toast("hi", { duration: 1000, onAutoClose });
    });

    advance(1000 + EXIT_MS + 10);

    expect(onAutoClose).toHaveBeenCalledTimes(1);
    expect(item()).toBeNull();
  });

  it("treats an action click as a user close, not an auto close", () => {
    const onAutoClose = vi.fn();
    const onClick = vi.fn();
    mountToaster();
    act(() => {
      toast("hi", { action: { label: "Undo", onClick }, onAutoClose });
    });
    advance(EXPAND_DELAY); // the action lives in the body

    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    advance(EXIT_MS + 10);

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onAutoClose).not.toHaveBeenCalled();
    expect(item()).toBeNull();
  });
});

describe("programmatic dismiss", () => {
  it("plays the exit animation before removing the toast", () => {
    mountToaster();
    let id!: string | number;
    act(() => {
      id = toast("hi");
    });

    act(() => {
      toast.dismiss(id);
    });

    // Still mounted, marked closing so the exit animation can run.
    expect(item()).not.toBeNull();
    expect(item()!.dataset.state).toBe("closing");
    expect(item()!.style.opacity).toBe("0");

    advance(EXIT_MS + 10);
    expect(item()).toBeNull();
  });

  it("calls onClosed with the reason for a standalone toast outside the store", () => {
    const onClosed = vi.fn();
    // The landing hero renders <Toast> without the store, and the exit callback
    // has to work there too.
    render(
      <Toast
        toast={{
          id: "solo",
          type: "default",
          title: "hi",
          duration: 1000,
          createdAt: Date.now(),
        }}
        onClosed={onClosed}
      />,
    );
    advance(0);

    advance(1000 + EXIT_MS + 10);
    expect(onClosed).toHaveBeenCalledWith("timeout");
  });
});

describe("bubble layout", () => {
  const phase = () => item()!.dataset.phase;
  const body = () => item()!.querySelector<HTMLElement>("[data-slot='body']");

  it("shows the title as a pill first, then opens up for the description", () => {
    mountToaster();
    act(() => {
      toast("Backup completed", { description: "1,248 records archived" });
    });

    expect(phase()).toBe("pill");
    expect(screen.getByText("Backup completed")).toBeTruthy();
    expect(screen.queryByText("1,248 records archived")).toBeNull();

    advance(EXPAND_DELAY);
    expect(phase()).toBe("card");
    expect(screen.getByText("1,248 records archived")).toBeTruthy();
  });

  it("opens a pill right away when it is hovered", () => {
    mountToaster();
    act(() => {
      toast("Backup completed", { description: "1,248 records archived" });
    });

    hover(item()!);
    expect(phase()).toBe("card");
  });

  it("keeps a title-only toast as a pill", () => {
    mountToaster();
    act(() => {
      toast("Copied");
    });

    advance(EXPAND_DELAY * 2);
    expect(phase()).toBe("pill");
    expect(body()).toBeNull();
  });

  it("renders the description in the body, below the header row", () => {
    mountToaster();
    act(() => {
      toast("Backup completed", { description: "1,248 records archived" });
    });
    advance(EXPAND_DELAY);

    const header = item()!.querySelector("[data-slot='header']")!;
    const description = screen.getByText("1,248 records archived");

    expect(header.contains(screen.getByText("Backup completed"))).toBe(true);
    expect(header.contains(description)).toBe(false);
    expect(body()!.contains(description)).toBe(true);
  });

  it("colors the icon tile from the toast type", () => {
    mountToaster();
    act(() => {
      toast.error("Connection lost");
    });

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

  it("puts the determinate bar inside the card body", () => {
    mountToaster();
    act(() => {
      toast.progress("Uploading…", { value: 62 });
    });
    advance(EXPAND_DELAY);

    const track = screen.getByRole("progressbar");
    expect(item()!.querySelector("[data-slot='body']")!.contains(track)).toBe(
      true,
    );
    expect(track.getAttribute("aria-valuenow")).toBe("62");
    expect((track.firstElementChild as HTMLElement).style.width).toBe("62%");
  });

  it("clamps an out-of-range progress value", () => {
    mountToaster();
    act(() => {
      toast.progress("Uploading…", { value: 140 });
    });
    advance(EXPAND_DELAY);

    const track = screen.getByRole("progressbar");
    expect(track.getAttribute("aria-valuenow")).toBe("100");
    expect((track.firstElementChild as HTMLElement).style.width).toBe("100%");
  });

  it("colors the countdown ring from the toast type", () => {
    mountToaster();
    act(() => {
      toast.success("Saved", { duration: 4000 });
    });

    expect(bubble().className).toContain("[--tone:var(--sapa-success)]");
    expect(ringClass()).toContain("stroke-(--tone)");
    expect(ring()!.style.animation).toContain("sapa-toast-ring");
  });

  it("falls back to a neutral ring for types with no semantic hue", () => {
    mountToaster();
    act(() => {
      toast("Copied", { duration: 4000 });
    });

    expect(bubble().className).toContain("[--tone:var(--foreground)]");
    expect(ringClass()).toContain("stroke-(--tone)");
  });

  it("hides the countdown ring when a progress value is shown", () => {
    mountToaster();
    act(() => {
      toast.progress("Uploading…", { value: 40, duration: 4000 });
    });

    expect(ring()).toBeNull();
  });
});

describe("color variants", () => {
  it("fills the bubble with the tone for solid", () => {
    mountToaster();
    act(() => {
      toast.success("Saved", { variant: "solid" });
    });

    expect(item()!.dataset.variant).toBe("solid");
    expect(bubble().className).toContain("bg-(--tone)");
    expect(bubble().className).toContain("text-(--tone-fg)");
  });

  it("washes the bubble in an opaque tint for subtle", () => {
    mountToaster();
    act(() => {
      toast.warning("Heads up", { variant: "subtle" });
    });

    expect(item()!.dataset.variant).toBe("subtle");
    expect(bubble().className).toContain("color-mix");
  });

  it("uses the Toaster default, which a toast can override", () => {
    mountToaster({ variant: "subtle" });
    act(() => {
      toast("From the toaster");
      toast("Own choice", { variant: "solid" });
    });

    const variants = screen
      .getAllByRole("status")
      .map((el) => (el as HTMLElement).dataset.variant);
    expect(variants.sort()).toEqual(["solid", "subtle"]);
  });
});

describe("stacked markup", () => {
  it("keeps the list element free of non-li children", () => {
    mountToaster();
    act(() => {
      toast("hi");
    });

    const list = document.querySelector("ol")!;
    for (const child of list.children) {
      expect(child.tagName).toBe("LI");
    }
  });
});
