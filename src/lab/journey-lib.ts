/* The pure part of the journey demo: where a job is after `elapsedMs`, step by step. Tested by tests/journey-lib.test.mjs. */

export interface JourneyState {
  /** The step in progress (or the one that failed); `count` once everything is done. */
  current: number;
  /** How far the current step is, 0–1. */
  value: number;
  /** The step that failed, if one did: the journey stops there. */
  failed: number | null;
  done: boolean;
}

/** Each step takes `stepMs`; a failing step stops at 60 % of its own time. `failAt` is a step index, or -1 for none. */
export function journeyAt(elapsedMs: number, count: number, stepMs: number, failAt = -1): JourneyState {
  const step = Math.max(1, stepMs);
  const total = count * step;
  const t = Math.max(0, elapsedMs);
  if (failAt >= 0 && failAt < count && t >= failAt * step + step * 0.6)
    return { current: failAt, value: 0.6, failed: failAt, done: false };
  if (t >= total) return { current: count, value: 1, failed: null, done: true };
  const current = Math.floor(t / step);
  return { current, value: (t - current * step) / step, failed: null, done: false };
}
