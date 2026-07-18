import {
  calculateOrbitalPosition,
  meanAnomaly,
  solveKeplerEquation,
  type OrbitalElements,
  type OrbitalPosition
} from "@astro-sim/orbital-mechanics";

export type { OrbitalElements, OrbitalPosition };

export function calculatePlanetPosition(elapsedDays: number, elements: OrbitalElements) {
  return calculateOrbitalPosition(elapsedDays, elements);
}

export function calculateMeanAnomaly(
  elapsedDays: number,
  orbitalPeriodDays: number,
  phaseRadians = 0
) {
  return meanAnomaly(elapsedDays, orbitalPeriodDays, phaseRadians);
}

export function solveEccentricAnomaly(meanAnomalyRadians: number, eccentricity: number) {
  return solveKeplerEquation(meanAnomalyRadians, eccentricity);
}
