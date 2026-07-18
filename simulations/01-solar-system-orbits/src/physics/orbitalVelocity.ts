import { GRAVITATIONAL_CONSTANT, SOLAR_MASS_KG, SOLAR_MU } from "../data/constants";

/**
 * Vis-viva equation: v = √[μ (2/r − 1/a)], m/s.
 * Rejects non-physical inputs instead of returning NaN.
 */
export function visVivaSpeed(radiusM: number, semiMajorAxisM: number, mu: number = SOLAR_MU): number {
  if (!(radiusM > 0)) {
    throw new Error(`Radius must be positive, got ${radiusM}`);
  }
  if (!(semiMajorAxisM > 0)) {
    throw new Error(`Semi-major axis must be positive, got ${semiMajorAxisM}`);
  }
  const squared = mu * (2 / radiusM - 1 / semiMajorAxisM);
  if (squared <= 0 || !Number.isFinite(squared)) {
    throw new Error(
      `Vis-viva produced a non-physical v² = ${squared} for r = ${radiusM}, a = ${semiMajorAxisM}`
    );
  }
  return Math.sqrt(squared);
}

/** Theoretical maximum speed at perihelion: v_p = √[μ (1+e) / (a (1−e))]. */
export function perihelionSpeed(
  semiMajorAxisM: number,
  eccentricity: number,
  mu: number = SOLAR_MU
): number {
  return Math.sqrt((mu * (1 + eccentricity)) / (semiMajorAxisM * (1 - eccentricity)));
}

/** Theoretical minimum speed at aphelion: v_a = √[μ (1−e) / (a (1+e))]. */
export function aphelionSpeed(
  semiMajorAxisM: number,
  eccentricity: number,
  mu: number = SOLAR_MU
): number {
  return Math.sqrt((mu * (1 - eccentricity)) / (semiMajorAxisM * (1 + eccentricity)));
}

/** Mean circular-orbit speed at radius r: v = √(μ/r). Educational comparison only. */
export function circularOrbitSpeed(radiusM: number, mu: number = SOLAR_MU): number {
  if (!(radiusM > 0)) {
    throw new Error(`Radius must be positive, got ${radiusM}`);
  }
  return Math.sqrt(mu / radiusM);
}

/** Magnitude of the Sun's gravitational pull on the planet: F = G M☉ m / r², newtons. */
export function gravitationalForce(planetMassKg: number, radiusM: number): number {
  if (!(radiusM > 0)) {
    throw new Error(`Radius must be positive, got ${radiusM}`);
  }
  return (GRAVITATIONAL_CONSTANT * SOLAR_MASS_KG * planetMassKg) / (radiusM * radiusM);
}

/** Gravitational acceleration toward the Sun: a_g = μ / r², m/s². */
export function gravitationalAcceleration(radiusM: number, mu: number = SOLAR_MU): number {
  if (!(radiusM > 0)) {
    throw new Error(`Radius must be positive, got ${radiusM}`);
  }
  return mu / (radiusM * radiusM);
}

/**
 * Centripetal interpretation a_c ≈ v²/r for a nearly circular orbit.
 * For an exactly circular orbit this equals gravitationalAcceleration;
 * for an ellipse the two differ because motion has a radial component.
 */
export function centripetalAcceleration(speedMS: number, radiusM: number): number {
  if (!(radiusM > 0)) {
    throw new Error(`Radius must be positive, got ${radiusM}`);
  }
  return (speedMS * speedMS) / radiusM;
}
