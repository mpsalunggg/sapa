import { vi } from "vitest";

/** Exit-animation delay the stores wait before removing a closing toast. */
export const EXIT_MS = 320;

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
