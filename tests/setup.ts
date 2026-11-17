// jsdom implements neither API, and both <Toast>/<Toaster> touch them on mount.
// They are defined straight on window rather than via vi.stubGlobal so that a
// test calling vi.unstubAllGlobals() does not strip them for the rest of the file.

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

// Motion drives the bubble's springs off its own frame loop; in jsdom we only
// care about the end state, so let every animation jump straight to it.
import { MotionGlobalConfig } from "motion/react";
import { motionGlobalConfig } from "motion-v";

MotionGlobalConfig.skipAnimations = true;
motionGlobalConfig.skipAnimations = true;
