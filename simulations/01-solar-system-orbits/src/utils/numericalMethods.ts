/** Small numerical helpers kept free of React and Three.js so they stay unit-testable. */

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function isFiniteNumber(value: number): boolean {
  return typeof value === "number" && Number.isFinite(value);
}

/**
 * Fixed-capacity ring buffer used for graph time series so long simulations
 * never grow memory without bound.
 */
export class RingBuffer<T> {
  private buffer: T[] = [];
  private start = 0;

  constructor(public readonly capacity: number) {
    if (!Number.isInteger(capacity) || capacity <= 0) {
      throw new Error(`Ring buffer capacity must be a positive integer, got ${capacity}`);
    }
  }

  get size(): number {
    return this.buffer.length;
  }

  push(item: T): void {
    if (this.buffer.length < this.capacity) {
      this.buffer.push(item);
      return;
    }
    this.buffer[this.start] = item;
    this.start = (this.start + 1) % this.capacity;
  }

  clear(): void {
    this.buffer = [];
    this.start = 0;
  }

  /** Returns items oldest-first. */
  toArray(): T[] {
    if (this.buffer.length < this.capacity) {
      return [...this.buffer];
    }
    return [...this.buffer.slice(this.start), ...this.buffer.slice(0, this.start)];
  }
}

/**
 * Signed area of a polygon via the shoelace formula. Used to numerically
 * cross-check Kepler's second-law sector areas against h/2 * dt.
 */
export function polygonArea(points: Array<{ x: number; y: number }>): number {
  let sum = 0;
  for (let index = 0; index < points.length; index += 1) {
    const current = points[index];
    const next = points[(index + 1) % points.length];
    sum += current.x * next.y - next.x * current.y;
  }
  return Math.abs(sum) / 2;
}

/** Simple least-squares fit of y = m x through the origin (for the T^2 vs a^3 comparison). */
export function proportionalFit(points: Array<{ x: number; y: number }>): number {
  let numerator = 0;
  let denominator = 0;
  for (const point of points) {
    numerator += point.x * point.y;
    denominator += point.x * point.x;
  }
  return denominator === 0 ? 0 : numerator / denominator;
}
