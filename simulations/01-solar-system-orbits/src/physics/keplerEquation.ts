import { KEPLER_MAX_ITERATIONS, KEPLER_TOLERANCE, TWO_PI } from "../data/constants";
import type { KeplerSolution } from "../types/simulation";

/** Normalizes an angle in radians to the range [0, 2π). */
export function normalizeAngle(radians: number): number {
  const normalized = radians % TWO_PI;
  return normalized < 0 ? normalized + TWO_PI : normalized;
}

/**
 * Solves Kepler's equation M = E - e sin E for the eccentric anomaly E using
 * Newton-Raphson iteration.
 *
 * @param meanAnomalyRad mean anomaly M in radians (any finite value; normalized internally)
 * @param eccentricity   orbital eccentricity e, must satisfy 0 <= e < 1
 * @param tolerance      convergence tolerance on the residual |E - e sin E - M|
 * @param maxIterations  iteration cap that guarantees termination
 */
export function solveKeplerEquation(
  meanAnomalyRad: number,
  eccentricity: number,
  tolerance: number = KEPLER_TOLERANCE,
  maxIterations: number = KEPLER_MAX_ITERATIONS
): KeplerSolution {
  if (!Number.isFinite(meanAnomalyRad)) {
    throw new Error(`Mean anomaly must be finite, got ${meanAnomalyRad}`);
  }
  if (!Number.isFinite(eccentricity) || eccentricity < 0 || eccentricity >= 1) {
    throw new Error(`Eccentricity must satisfy 0 <= e < 1 for an ellipse, got ${eccentricity}`);
  }

  const meanAnomaly = normalizeAngle(meanAnomalyRad);

  // A high-eccentricity orbit converges more reliably from E0 = π.
  let eccentricAnomaly = eccentricity < 0.8 ? meanAnomaly : Math.PI;
  let residual = eccentricAnomaly - eccentricity * Math.sin(eccentricAnomaly) - meanAnomaly;
  let iterations = 0;

  while (Math.abs(residual) > tolerance && iterations < maxIterations) {
    const derivative = 1 - eccentricity * Math.cos(eccentricAnomaly);
    eccentricAnomaly -= residual / derivative;
    residual = eccentricAnomaly - eccentricity * Math.sin(eccentricAnomaly) - meanAnomaly;
    iterations += 1;
  }

  return {
    eccentricAnomalyRad: normalizeAngle(eccentricAnomaly),
    iterations,
    residual: Math.abs(residual),
    converged: Math.abs(residual) <= tolerance
  };
}

/**
 * True anomaly ν from eccentric anomaly E via the half-angle form, which is
 * numerically stable at every point of the orbit:
 * ν = 2 atan2(√(1+e) sin(E/2), √(1−e) cos(E/2))
 */
export function trueAnomalyFromEccentric(eccentricAnomalyRad: number, eccentricity: number): number {
  const halfE = eccentricAnomalyRad / 2;
  return normalizeAngle(
    2 *
      Math.atan2(
        Math.sqrt(1 + eccentricity) * Math.sin(halfE),
        Math.sqrt(1 - eccentricity) * Math.cos(halfE)
      )
  );
}

/** Inverse of {@link trueAnomalyFromEccentric}. */
export function eccentricFromTrueAnomaly(trueAnomalyRad: number, eccentricity: number): number {
  const halfNu = trueAnomalyRad / 2;
  return normalizeAngle(
    2 *
      Math.atan2(
        Math.sqrt(1 - eccentricity) * Math.sin(halfNu),
        Math.sqrt(1 + eccentricity) * Math.cos(halfNu)
      )
  );
}
