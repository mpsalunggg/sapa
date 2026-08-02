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
