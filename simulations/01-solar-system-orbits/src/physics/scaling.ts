import type { DistanceScaleMode } from "../types/simulation";
import { clamp } from "../utils/numericalMethods";

/**
 * Visual scaling for the 3D scene. One scene unit corresponds to one *scaled*
 * astronomical unit. These functions are purely visual: physics always runs on
 * unscaled SI values.
 */

const NEPTUNE_APHELION_AU = 30.32;

/** Compression exponent used by the "compressed" mode (power-law radial compression). */
const COMPRESSION_EXPONENT = 0.55;

export function scaleDistanceAu(valueAu: number, mode: DistanceScaleMode): number {
  const magnitude = Math.abs(valueAu);
  const sign = Math.sign(valueAu);
  switch (mode) {
    case "linear":
    case "real":
      return valueAu;
    case "compressed":
      return sign * Math.pow(magnitude, COMPRESSION_EXPONENT);
    case "logarithmic":
      return sign * (Math.log1p(magnitude) / Math.log1p(NEPTUNE_APHELION_AU)) * 12;
    case "educational":
      // Compresses the outer system while keeping the inner system readable.
      return sign * (magnitude <= 2 ? magnitude : 2 + (magnitude - 2) * 0.28);
  }
}

/**
 * Scales a heliocentric position vector (in AU) by scaling its radial distance
 * while preserving direction, so orbit shapes stay smooth in every mode.
 */
export function scalePositionAu(
  position: { x: number; y: number; z: number },
  mode: DistanceScaleMode,
  distanceScale: number
): { x: number; y: number; z: number } {
  const radius = Math.hypot(position.x, position.y, position.z);
  if (radius === 0) {
    return { x: 0, y: 0, z: 0 };
  }
  const scaledRadius = scaleDistanceAu(radius, mode) * distanceScale;
  const factor = scaledRadius / radius;
  return { x: position.x * factor, y: position.y * factor, z: position.z * factor };
}

/**
 * Visual planet radius in scene units. Planet radii are enormously enlarged
 * relative to orbital distances; a real-scale Earth would be invisible.
 */
export function scalePlanetRadius(radiusKm: number, planetRadiusScale: number): number {
  const base = Math.max(0.035, Math.sqrt(radiusKm / 6371) * 0.09);
  return base * sanitizeScale(planetRadiusScale);
}

/** Visual Sun radius in scene units (also not to scale). */
export function scaleSunRadius(sunRadiusScale: number): number {
  return 0.32 * sanitizeScale(sunRadiusScale);
}

/** Guards against zero, negative or non-finite user-supplied scale factors. */
export function sanitizeScale(value: number, min = 0.05, max = 20): number {
  if (!Number.isFinite(value) || value <= 0) {
    return 1;
  }
  return clamp(value, min, max);
}
