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
import { EXIT_MS, useToastTimers } from "../helpers";

beforeEach(() => {
  useToastTimers();
});

afterEach(() => {
  cleanup();
  toastStore.clear();
  vi.useRealTimers();
});

/** Advance timers inside act() so React flushes the resulting state updates. */
const advance = (ms: number) =>
  act(() => {
    vi.advanceTimersByTime(ms);
  });

/** Mount the toaster and let the enter animation frame run. */
function mountToaster(props: Parameters<typeof Toaster>[0] = {}) {
  render(<Toaster {...props} />);
  advance(0);
}

const item = () => screen.queryByRole("status");

/**
 * React implements onMouseEnter/onMouseLeave on top of mouseover/mouseout, and
 * dispatches them to every element in the entered chain — which is exactly why
 * a stacked toast receives two pause() calls per hover (its own handler plus
 * the group container's). fireEvent.mouseEnter would only hit one element.
 */
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
    advance(2000); // paused — must not eat into the remaining 1000 ms
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

    // Still mounted, but marked closing so the transition can run.
    expect(item()).not.toBeNull();
    expect(item()!.dataset.state).toBe("closing");
    expect(item()!.style.opacity).toBe("0");

    advance(EXIT_MS + 10);
    expect(item()).toBeNull();
  });

  it("calls onClosed with the reason for a standalone toast outside the store", () => {
    const onClosed = vi.fn();
    // The landing hero renders <Toast> directly, without ever adding it to the
    // store — the exit callback has to work there too.
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

describe("square layout", () => {
  it("renders the description as a sibling of the header, not inside it", () => {
    mountToaster();
    act(() => {
      toast("Backup completed", { description: "1,248 records archived" });
    });

    const root = item()!;
    const title = screen.getByText("Backup completed");
    const description = screen.getByText("1,248 records archived");

    // The header holds the tile + title; the description sits below it at the
    // card's full width. If it ever lands back inside the header row it would
    // be indented under the icon again.
    expect(description.parentElement).toBe(root);
    expect(title.parentElement).not.toBe(root);
    expect(title.parentElement!.contains(description)).toBe(false);
  });

  it("colors the icon tile from the toast type", () => {
    mountToaster();
    act(() => {
      toast.error("Connection lost");
    });

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

  it("pins the determinate bar to the card's bottom edge, not the content flow", () => {
    mountToaster();
    act(() => {
      toast.progress("Uploading…", { value: 62 });
    });

    const track = screen.getByRole("progressbar");
    expect(track.parentElement).toBe(item());
    expect(track.className).toContain("bottom-0");
    expect(track.getAttribute("aria-valuenow")).toBe("62");
    expect((track.firstElementChild as HTMLElement).style.width).toBe("62%");
  });

  it("clamps an out-of-range progress value", () => {
    mountToaster();
    act(() => {
      toast.progress("Uploading…", { value: 140 });
    });

    const track = screen.getByRole("progressbar");
    expect(track.getAttribute("aria-valuenow")).toBe("100");
    expect((track.firstElementChild as HTMLElement).style.width).toBe("100%");
  });

  it("colors the countdown bar from the toast type", () => {
    mountToaster();
    act(() => {
      toast.success("Saved", { duration: 4000 });
    });

    const [bar, ...rest] = bars();
    expect(rest).toHaveLength(0);
    expect(bar.className).toContain("bg-sapa-success");
    expect(bar.className).toContain("origin-left");
  });

  it("falls back to a neutral bar for types with no semantic hue", () => {
    mountToaster();
    act(() => {
      toast("Copied", { duration: 4000 });
    });

    expect(bars()[0].className).toContain("bg-foreground");
  });

  it("hides the countdown bar when a progress value owns the strip", () => {
    mountToaster();
    act(() => {
      // Both are set, so the two bars would otherwise stack on the same pixels.
      toast.progress("Uploading…", { value: 40, duration: 4000 });
    });

    const drawn = bars();
    expect(drawn).toHaveLength(1);
    expect(drawn[0]).toBe(screen.getByRole("progressbar"));
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
