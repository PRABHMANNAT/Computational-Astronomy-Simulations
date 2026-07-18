import { TWO_PI } from "@astro-sim/physics-engine";

export interface OrbitalElements {
  semiMajorAxisAu: number;
  eccentricity: number;
  orbitalPeriodDays: number;
  phaseRadians?: number;
}

export interface OrbitalPosition {
  xAu: number;
  yAu: number;
  radiusAu: number;
  trueAnomalyRadians: number;
  eccentricAnomalyRadians: number;
}

export function normalizeRadians(radians: number) {
  return ((radians % TWO_PI) + TWO_PI) % TWO_PI;
}

export function meanAnomaly(elapsedDays: number, orbitalPeriodDays: number, phaseRadians = 0) {
  return normalizeRadians((TWO_PI * elapsedDays) / orbitalPeriodDays + phaseRadians);
}

export function solveKeplerEquation(meanAnomalyRadians: number, eccentricity: number, iterations = 8) {
  let eccentricAnomaly = eccentricity < 0.8 ? meanAnomalyRadians : Math.PI;

  for (let index = 0; index < iterations; index += 1) {
    const numerator =
      eccentricAnomaly - eccentricity * Math.sin(eccentricAnomaly) - meanAnomalyRadians;
    const denominator = 1 - eccentricity * Math.cos(eccentricAnomaly);
    eccentricAnomaly -= numerator / denominator;
  }

  return normalizeRadians(eccentricAnomaly);
}

export function calculateOrbitalPosition(
  elapsedDays: number,
  elements: OrbitalElements
): OrbitalPosition {
  const anomaly = meanAnomaly(elapsedDays, elements.orbitalPeriodDays, elements.phaseRadians);
  const eccentricAnomaly = solveKeplerEquation(anomaly, elements.eccentricity);
  const xAu = elements.semiMajorAxisAu * (Math.cos(eccentricAnomaly) - elements.eccentricity);
  const yAu =
    elements.semiMajorAxisAu *
    Math.sqrt(1 - elements.eccentricity * elements.eccentricity) *
    Math.sin(eccentricAnomaly);
  const radiusAu = Math.hypot(xAu, yAu);
  const trueAnomalyRadians = Math.atan2(yAu, xAu);

  return {
    xAu,
    yAu,
    radiusAu,
    trueAnomalyRadians: normalizeRadians(trueAnomalyRadians),
    eccentricAnomalyRadians: eccentricAnomaly
  };
}
