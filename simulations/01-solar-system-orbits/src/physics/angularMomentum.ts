import { RELATIVE_ERROR_EPSILON, SOLAR_MU } from "../data/constants";
import type { Vector3D } from "../types/planet";

/** Analytical specific angular momentum of an ellipse: h = √[μ a (1 − e²)], m²/s. */
export function specificAngularMomentum(
  semiMajorAxisM: number,
  eccentricity: number,
  mu: number = SOLAR_MU
): number {
  if (!(semiMajorAxisM > 0)) {
    throw new Error(`Semi-major axis must be positive, got ${semiMajorAxisM}`);
  }
  if (eccentricity < 0 || eccentricity >= 1) {
    throw new Error(`Eccentricity must satisfy 0 <= e < 1, got ${eccentricity}`);
  }
  return Math.sqrt(mu * semiMajorAxisM * (1 - eccentricity * eccentricity));
}

/** Specific angular momentum vector from state vectors: h⃗ = r⃗ × v⃗, m²/s. */
export function angularMomentumVector(positionM: Vector3D, velocityMS: Vector3D): Vector3D {
  return {
    x: positionM.y * velocityMS.z - positionM.z * velocityMS.y,
    y: positionM.z * velocityMS.x - positionM.x * velocityMS.z,
    z: positionM.x * velocityMS.y - positionM.y * velocityMS.x
  };
}

export function vectorMagnitude(vector: Vector3D): number {
  return Math.hypot(vector.x, vector.y, vector.z);
}

/** Relative difference between the analytical and vector-based magnitudes. */
export function angularMomentumCrossCheckError(
  positionM: Vector3D,
  velocityMS: Vector3D,
  semiMajorAxisM: number,
  eccentricity: number,
  mu: number = SOLAR_MU
): number {
  const analytical = specificAngularMomentum(semiMajorAxisM, eccentricity, mu);
  const fromVectors = vectorMagnitude(angularMomentumVector(positionM, velocityMS));
  return Math.abs(analytical - fromVectors) / Math.max(analytical, RELATIVE_ERROR_EPSILON);
}

/** Areal velocity dA/dt = h/2, m²/s (constant in the two-body problem — Kepler's second law). */
export function arealVelocity(specificAngularMomentumM2S: number): number {
  return specificAngularMomentumM2S / 2;
}
