import { vi } from "vitest";

/** Exit-animation delay the stores wait before removing a closing toast. */
export const EXIT_MS = 320;

/** How long a bubble stays a pill before it opens up to show its body. */
export const EXPAND_DELAY = 450;

/**
 * `Date.now()` must be faked too: the pause/resume math subtracts wall-clock
 * elapsed time. `requestAnimationFrame` drives the enter animation.
 */
export const FAKE_TIMERS = [
  "setTimeout",
  "clearTimeout",
  "setInterval",
  "clearInterval",
  "Date",
  "performance",
  "requestAnimationFrame",
  "cancelAnimationFrame",
] as const;

export const useToastTimers = () =>
  vi.useFakeTimers({ toFake: [...FAKE_TIMERS] });
