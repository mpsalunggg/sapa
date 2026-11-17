// jsdom lacks both APIs and <Toast>/<Toaster> use them on mount. They are set on
// window directly, not with vi.stubGlobal, so vi.unstubAllGlobals() in a test
// does not remove them for the rest of the file.

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

Object.defineProperty(window, "ResizeObserver", {
  writable: true,
  configurable: true,
  value: ResizeObserverStub,
});

Object.defineProperty(window, "matchMedia", {
  writable: true,
  configurable: true,
  value: (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList,
});

// Motion runs springs on its own frame loop. Tests only need the end state, so
// every animation jumps straight to it.
import { MotionGlobalConfig } from "motion/react";
import { motionGlobalConfig } from "motion-v";

MotionGlobalConfig.skipAnimations = true;
motionGlobalConfig.skipAnimations = true;
