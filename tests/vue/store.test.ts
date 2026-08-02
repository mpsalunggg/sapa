import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { clear, dismiss, toast, toasts } from "../../registry/vue/ui/useToast";
import { EXIT_MS, useToastTimers } from "../helpers";

const byId = (id: string | number) => toasts.find((t) => t.id === id);

beforeEach(() => {
  useToastTimers();
  clear();
});

afterEach(() => {
  clear();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("parity with the React store", () => {
  it("adds a toast with the default type and newest-first ordering", () => {
    toast("first");
    const second = toast("second");

    expect(toasts).toHaveLength(2);
    expect(toasts[0]?.id).toBe(second);
    expect(byId(second)).toMatchObject({ title: "second", type: "default" });
  });

  it.each([
    ["success", toast.success],
    ["error", toast.error],
    ["warning", toast.warning],
    ["info", toast.info],
  ] as const)("toast.%s sets the matching type", (type, fn) => {
    expect(byId(fn("hi"))?.type).toBe(type);
  });

  it("keeps loading and progress toasts alive until dismissed", () => {
    expect(byId(toast.loading("Saving…"))?.duration).toBe(Infinity);
    expect(byId(toast.progress("Uploading…", { value: 25 }))).toMatchObject({
      duration: Infinity,
      progress: 25,
    });
  });

  it("updates in place when an id is reused", () => {
    const id = toast("before");
    toast("after", { id });

    expect(toasts).toHaveLength(1);
    expect(byId(id)?.title).toBe("after");
  });

  it("resolves a promise toast to success", async () => {
    const id = toast.promise(Promise.resolve("ok"), {
      loading: "Uploading…",
      success: (data) => `${data} uploaded`,
      error: "failed",
    });
    expect(byId(id)?.type).toBe("loading");

    await vi.waitFor(() =>
      expect(byId(id)).toMatchObject({ type: "success", title: "ok uploaded" }),
    );
  });
});

describe("id allocation", () => {
  it("never reuses an id the caller already claimed", () => {
    toast("explicit", { id: 1 });
    const auto = toast("auto");

    expect(auto).not.toBe(1);
    expect(toasts).toHaveLength(2);
  });
});

describe("dismiss", () => {
  it("marks the toast as closing before removing it", () => {
    const onDismiss = vi.fn();
    const id = toast("bye", { onDismiss });

    dismiss(id);
    expect(byId(id)?.closing).toBe(true);
    expect(onDismiss).not.toHaveBeenCalled();

    vi.advanceTimersByTime(EXIT_MS + 10);
    expect(byId(id)).toBeUndefined();
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("only calls onAutoClose for the timeout reason", () => {
    const onAutoClose = vi.fn();
    const timedOut = toast("a", { onAutoClose });
    const userClosed = toast("b", { onAutoClose });

    dismiss(timedOut, "timeout");
    dismiss(userClosed, "user");
    vi.advanceTimersByTime(EXIT_MS + 10);

    expect(onAutoClose).toHaveBeenCalledTimes(1);
  });

  it("ignores a repeated dismiss of the same toast", () => {
    const onDismiss = vi.fn();
    const id = toast("bye", { onDismiss });

    dismiss(id);
    dismiss(id);
    vi.advanceTimersByTime(EXIT_MS + 10);

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("clear() empties the queue immediately without callbacks", () => {
    const onDismiss = vi.fn();
    toast("a", { onDismiss });

    clear();

    expect(toasts).toHaveLength(0);
    expect(onDismiss).not.toHaveBeenCalled();
  });
});

describe("server rendering", () => {
  it("does not queue toasts when there is no window", () => {
    vi.stubGlobal("window", undefined);

    toast("ssr");

    expect(toasts).toHaveLength(0);
  });
});
