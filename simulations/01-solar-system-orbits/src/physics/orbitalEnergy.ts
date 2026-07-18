import { RELATIVE_ERROR_EPSILON, SOLAR_MU } from "../data/constants";

/** Specific kinetic energy v²/2, J/kg. */
export function specificKineticEnergy(speedMS: number): number {
  return (speedMS * speedMS) / 2;
}

/** Specific gravitational potential energy −μ/r, J/kg (zero at infinity). */
export function specificPotentialEnergy(radiusM: number, mu: number = SOLAR_MU): number {
  if (!(radiusM > 0)) {
    throw new Error(`Radius must be positive, got ${radiusM}`);
  }
  return -mu / radiusM;
}

/** Specific orbital energy from the state: ε = v²/2 − μ/r, J/kg. */
export function specificOrbitalEnergy(
  speedMS: number,
  radiusM: number,
  mu: number = SOLAR_MU
): number {
  return specificKineticEnergy(speedMS) + specificPotentialEnergy(radiusM, mu);
}

/** Specific orbital energy of a bound ellipse from geometry alone: ε = −μ/(2a), J/kg. */
export function specificOrbitalEnergyFromSemiMajorAxis(
  semiMajorAxisM: number,
  mu: number = SOLAR_MU
): number {
  if (!(semiMajorAxisM > 0)) {
    throw new Error(`Semi-major axis must be positive, got ${semiMajorAxisM}`);
  }
  return -mu / (2 * semiMajorAxisM);
}

/** Total orbital mechanical energy E = m ε, joules. */
export function totalOrbitalEnergy(planetMassKg: number, specificEnergyJPerKg: number): number {
  return planetMassKg * specificEnergyJPerKg;
}

/**
 * Relative disagreement between the state-based and geometry-based energy
 * formulas. Should stay near machine precision for a valid Keplerian state.
 */
export function energyCrossCheckError(
  speedMS: number,
  radiusM: number,
  semiMajorAxisM: number,
  mu: number = SOLAR_MU
): number {
  const fromState = specificOrbitalEnergy(speedMS, radiusM, mu);
  const fromGeometry = specificOrbitalEnergyFromSemiMajorAxis(semiMajorAxisM, mu);
  return (
    Math.abs(fromState - fromGeometry) /
    Math.max(Math.abs(fromGeometry), RELATIVE_ERROR_EPSILON)
  );
}
