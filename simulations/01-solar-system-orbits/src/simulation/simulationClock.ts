import { clamp, isFiniteNumber } from "../utils/numericalMethods";

/**
 * The authoritative simulation clock. It lives outside React state so the 3D
 * scene can advance it every animation frame without triggering React
 * re-renders; UI panels subscribe at a throttled cadence instead.
 */

/** Real frame deltas above this are clamped (tab switches, debugger pauses). */
export const MAX_FRAME_SECONDS = 0.1;

/** Bounds for the user-supplied custom speed, simulated days per real second. */
export const MIN_SPEED_DAYS_PER_SECOND = 1 / 24 / 60; // one simulated minute per second
export const MAX_SPEED_DAYS_PER_SECOND = 3653; // ten simulated years per second

export interface SpeedPreset {
  label: string;
  daysPerSecond: number;
}

export const SPEED_PRESETS: SpeedPreset[] = [
  { label: "1 hour / s", daysPerSecond: 1 / 24 },
  { label: "1 day / s", daysPerSecond: 1 },
  { label: "7 days / s", daysPerSecond: 7 },
  { label: "30 days / s", daysPerSecond: 30 },
  { label: "365 days / s", daysPerSecond: 365 }
];

export function clampSpeed(daysPerSecond: number): number {
  if (!isFiniteNumber(daysPerSecond) || daysPerSecond <= 0) {
    return 1;
  }
  return clamp(daysPerSecond, MIN_SPEED_DAYS_PER_SECOND, MAX_SPEED_DAYS_PER_SECOND);
}

type ClockListener = (elapsedDays: number) => void;

export class SimulationClock {
  private elapsedDaysInternal = 0;
  private listeners = new Set<ClockListener>();

  get elapsedDays(): number {
    return this.elapsedDaysInternal;
  }

  setElapsedDays(days: number): void {
    if (!isFiniteNumber(days)) {
      throw new Error(`Elapsed days must be finite, got ${days}`);
    }
    this.elapsedDaysInternal = days;
    for (const listener of this.listeners) {
      listener(days);
    }
  }

  /**
   * Advances simulated time by one real frame. The real delta is clamped so a
   * background tab returning after minutes cannot multiply into an unstable
   * jump at high simulation speeds.
   */
  advance(
    dtRealSeconds: number,
    speedDaysPerSecond: number,
    direction: 1 | -1,
    slowMotionFactor = 1
  ): void {
    if (!isFiniteNumber(dtRealSeconds) || dtRealSeconds <= 0) {
      return;
    }
    const dt = Math.min(dtRealSeconds, MAX_FRAME_SECONDS);
    const speed = clampSpeed(speedDaysPerSecond) * clamp(slowMotionFactor, 0.001, 1);
    this.setElapsedDays(this.elapsedDaysInternal + dt * speed * direction);
  }

  reset(): void {
    this.setElapsedDays(0);
  }

  subscribe(listener: ClockListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

/** Shared singleton used by the running application (tests construct their own). */
export const simulationClock = new SimulationClock();
