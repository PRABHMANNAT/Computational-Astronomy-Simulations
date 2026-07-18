import { RELATIVE_ERROR_EPSILON } from "../data/constants";
import type { PlanetaryData } from "../types/planet";
import type { AccuracyStatus } from "../types/simulation";

/** relative error = |calculated − expected| / max(|expected|, ε). */
export function relativeError(calculated: number, expected: number): number {
  if (!Number.isFinite(calculated) || !Number.isFinite(expected)) {
    return Number.POSITIVE_INFINITY;
  }
  return Math.abs(calculated - expected) / Math.max(Math.abs(expected), RELATIVE_ERROR_EPSILON);
}

/**
 * Documented thresholds:
 * excellent < 1e-10, acceptable < 1e-7, warning < 1e-4, otherwise invalid.
 */
export function classifyAccuracy(error: number): AccuracyStatus {
  if (!Number.isFinite(error)) {
    return "invalid";
  }
  if (error < 1e-10) {
    return "excellent";
  }
  if (error < 1e-7) {
    return "acceptable";
  }
  if (error < 1e-4) {
    return "warning";
  }
  return "invalid";
}

/** Throws with a descriptive message when a dataset entry is physically impossible. */
export function validatePlanetaryData(planet: PlanetaryData): void {
  const failures: string[] = [];
  if (!(planet.massKg > 0)) {
    failures.push(`mass must be positive (got ${planet.massKg})`);
  }
  if (!(planet.radiusKm > 0)) {
    failures.push(`radius must be positive (got ${planet.radiusKm})`);
  }
  if (!(planet.semiMajorAxisAU > 0)) {
    failures.push(`semi-major axis must be positive (got ${planet.semiMajorAxisAU})`);
  }
  if (!(planet.eccentricity >= 0 && planet.eccentricity < 1)) {
    failures.push(`eccentricity must satisfy 0 <= e < 1 (got ${planet.eccentricity})`);
  }
  if (!(planet.orbitalPeriodDays > 0)) {
    failures.push(`orbital period must be positive (got ${planet.orbitalPeriodDays})`);
  }
  for (const [key, value] of Object.entries(planet)) {
    if (typeof value === "number" && !Number.isFinite(value)) {
      failures.push(`${key} is not finite`);
    }
  }
  if (failures.length > 0) {
    throw new Error(`Invalid planetary data for "${planet.id}": ${failures.join("; ")}`);
  }
}

export function isFiniteVector(vector: { x: number; y: number; z: number }): boolean {
  return Number.isFinite(vector.x) && Number.isFinite(vector.y) && Number.isFinite(vector.z);
}
