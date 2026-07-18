import { DAY_SECONDS, SOLAR_MU, TWO_PI } from "../data/constants";
import type { OrbitalElementsSI, PlanetaryData } from "../types/planet";
import { auToMetres, degToRad } from "../utils/units";
import { normalizeAngle } from "./keplerEquation";

/** Converts the display-friendly dataset (AU, degrees, days) into SI orbital elements. */
export function toOrbitalElementsSI(planet: PlanetaryData): OrbitalElementsSI {
  return {
    semiMajorAxisM: auToMetres(planet.semiMajorAxisAU),
    eccentricity: planet.eccentricity,
    inclinationRad: degToRad(planet.inclinationDeg),
    longitudeAscendingNodeRad: degToRad(planet.longitudeAscendingNodeDeg),
    argumentOfPerihelionRad: degToRad(planet.argumentOfPerihelionDeg),
    meanAnomalyAtEpochRad: degToRad(planet.meanAnomalyAtEpochDeg),
    orbitalPeriodS: planet.orbitalPeriodDays * DAY_SECONDS
  };
}

/** Mean angular motion n = 2π / T in radians per second. */
export function meanMotion(orbitalPeriodS: number): number {
  if (!(orbitalPeriodS > 0)) {
    throw new Error(`Orbital period must be positive, got ${orbitalPeriodS}`);
  }
  return TWO_PI / orbitalPeriodS;
}

/** Mean anomaly M(t) = M0 + n (t − t0), normalized to [0, 2π). */
export function meanAnomalyAt(
  meanAnomalyAtEpochRad: number,
  orbitalPeriodS: number,
  elapsedS: number
): number {
  return normalizeAngle(meanAnomalyAtEpochRad + meanMotion(orbitalPeriodS) * elapsedS);
}

export function perihelionDistance(semiMajorAxisM: number, eccentricity: number): number {
  return semiMajorAxisM * (1 - eccentricity);
}

export function aphelionDistance(semiMajorAxisM: number, eccentricity: number): number {
  return semiMajorAxisM * (1 + eccentricity);
}

/** Semi-minor axis b = a √(1 − e²). */
export function semiMinorAxis(semiMajorAxisM: number, eccentricity: number): number {
  return semiMajorAxisM * Math.sqrt(1 - eccentricity * eccentricity);
}

/** Distance from the ellipse centre to each focus, c = a e. */
export function focusDistance(semiMajorAxisM: number, eccentricity: number): number {
  return semiMajorAxisM * eccentricity;
}

/** Kepler's third law: T = 2π √(a³/μ), seconds. */
export function orbitalPeriodFromSemiMajorAxis(semiMajorAxisM: number, mu: number = SOLAR_MU): number {
  if (!(semiMajorAxisM > 0)) {
    throw new Error(`Semi-major axis must be positive, got ${semiMajorAxisM}`);
  }
  return TWO_PI * Math.sqrt(Math.pow(semiMajorAxisM, 3) / mu);
}

/** The third-law constant T²/a³ = 4π²/μ, s² m⁻³. */
export function keplerThirdLawRatio(orbitalPeriodS: number, semiMajorAxisM: number): number {
  return (orbitalPeriodS * orbitalPeriodS) / Math.pow(semiMajorAxisM, 3);
}
