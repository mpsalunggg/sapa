import { beforeEach, describe, expect, it, vi } from "vitest";

import { toast, toastStore } from "../registry/react/ui/toast-store";

const snap = () => toastStore.getSnapshot();
const byId = (id: string | number) => snap().find((t) => t.id === id);

beforeEach(() => {
  toastStore.dismiss();
});

describe("toast()", () => {
  it("adds a single toast with the default type", () => {
    const id = toast("Event created");

    expect(snap()).toHaveLength(1);
    expect(byId(id)).toMatchObject({ title: "Event created", type: "default" });
  });

  it("shows the newest toast first", () => {
    toast("first");
    const secondId = toast("second");

    expect(snap()[0]?.id).toBe(secondId);
  });

  it("applies options passed alongside the title", () => {
    const id = toast("With detail", { description: "extra line" });

    expect(byId(id)).toMatchObject({ description: "extra line" });
  });
});

describe("type helpers", () => {
  it.each([
    ["success", toast.success],
    ["error", toast.error],
    ["warning", toast.warning],
    ["info", toast.info],
    ["message", toast.message],
  ] as const)("toast.%s sets the matching type", (type, fn) => {
    const id = fn("hi");
    expect(byId(id)?.type).toBe(type === "message" ? "default" : type);
  });
});

describe("toast.loading", () => {
  it("uses the loading type and never auto-dismisses", () => {
    const id = toast.loading("Saving…");

    expect(byId(id)).toMatchObject({ type: "loading", duration: Infinity });
  });
});

describe("toast.custom", () => {
  it("stores the custom node under jsx", () => {
    const id = toast.custom("raw node");

    expect(byId(id)).toMatchObject({ jsx: "raw node" });
  });
});

describe("dismiss", () => {
  it("removes only the targeted toast and calls its onDismiss", () => {
    const onDismiss = vi.fn();
    const keep = toast("keep");
    const drop = toast("drop", { onDismiss });

    toastStore.dismiss(drop);

    expect(snap()).toHaveLength(1);
    expect(byId(keep)).toBeDefined();
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("clears every toast when called without an id", () => {
    const a = vi.fn();
    const b = vi.fn();
    toast("a", { onDismiss: a });
    toast("b", { onDismiss: b });

    toastStore.dismiss();

    expect(snap()).toHaveLength(0);
    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(1);
  });
});

describe("subscription", () => {
  it("notifies subscribers on add and dismiss, then stops after unsubscribe", () => {
    const listener = vi.fn();
    const unsubscribe = toastStore.subscribe(listener);

    toast("one");
    toastStore.dismiss();
    expect(listener).toHaveBeenCalledTimes(2);

    unsubscribe();
    toast("two");
    expect(listener).toHaveBeenCalledTimes(2);
  });
});

describe("update-in-place", () => {
  it("replaces the existing toast when reusing an id instead of appending", () => {
    const id = toast("before");
    toast("after", { id });

    expect(snap()).toHaveLength(1);
    expect(byId(id)?.title).toBe("after");
  });
});

describe("toast.promise", () => {
  it("starts as loading, then resolves to success with the mapped message", async () => {
    const id = toast.promise(Promise.resolve({ name: "avatar.png" }), {
      loading: "Uploading…",
      success: (data) => `${data.name} uploaded`,
      error: "Upload failed",
    });

    expect(byId(id)).toMatchObject({ type: "loading", title: "Uploading…" });

    await vi.waitFor(() =>
      expect(byId(id)).toMatchObject({
        type: "success",
        title: "avatar.png uploaded",
      }),
    );
    expect(snap()).toHaveLength(1);
  });

  it("transitions to error with the mapped message on rejection", async () => {
    const id = toast.promise(Promise.reject(new Error("network")), {
      loading: "Uploading…",
      success: "Done",
      error: (err) => `Failed: ${(err as Error).message}`,
    });

    await vi.waitFor(() =>
      expect(byId(id)).toMatchObject({
        type: "error",
        title: "Failed: network",
      }),
    );
  });
});
