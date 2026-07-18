import type { OrbitalElementsSI, OrbitalState, Vector3D } from "../types/planet";
import {
  normalizeAngle,
  solveKeplerEquation,
  trueAnomalyFromEccentric
} from "./keplerEquation";
import { meanAnomalyAt, meanMotion } from "./orbitalElements";

/** Instantaneous Sun–planet distance from the eccentric anomaly: r = a (1 − e cos E). */
export function radiusFromEccentricAnomaly(
  semiMajorAxisM: number,
  eccentricity: number,
  eccentricAnomalyRad: number
): number {
  return semiMajorAxisM * (1 - eccentricity * Math.cos(eccentricAnomalyRad));
}

/** Cross-validation form using the true anomaly: r = a (1 − e²) / (1 + e cos ν). */
export function radiusFromTrueAnomaly(
  semiMajorAxisM: number,
  eccentricity: number,
  trueAnomalyRad: number
): number {
  return (
    (semiMajorAxisM * (1 - eccentricity * eccentricity)) /
    (1 + eccentricity * Math.cos(trueAnomalyRad))
  );
}

/** Perifocal (orbital-plane) position: x toward perihelion, z = 0. */
export function positionInOrbitalPlane(
  semiMajorAxisM: number,
  eccentricity: number,
  eccentricAnomalyRad: number
): Vector3D {
  return {
    x: semiMajorAxisM * (Math.cos(eccentricAnomalyRad) - eccentricity),
    y:
      semiMajorAxisM *
      Math.sqrt(1 - eccentricity * eccentricity) *
      Math.sin(eccentricAnomalyRad),
    z: 0
  };
}

/**
 * Rotates a perifocal vector into heliocentric ecliptic coordinates using the
 * classical sequence Rz(−Ω) Rx(−i) Rz(−ω), i.e. the standard transformation
 *
 *   x = X[cosΩ cos(ω+ν) − sinΩ sin(ω+ν) cos i] ...
 *
 * expressed as a composition of axis rotations so it applies to both position
 * and velocity vectors.
 */
export function rotateToHeliocentric(
  perifocal: Vector3D,
  inclinationRad: number,
  longitudeAscendingNodeRad: number,
  argumentOfPerihelionRad: number
): Vector3D {
  const cosO = Math.cos(longitudeAscendingNodeRad);
  const sinO = Math.sin(longitudeAscendingNodeRad);
  const cosI = Math.cos(inclinationRad);
  const sinI = Math.sin(inclinationRad);
  const cosW = Math.cos(argumentOfPerihelionRad);
  const sinW = Math.sin(argumentOfPerihelionRad);

  // Rz(ω) applied in the orbital plane.
  const x1 = perifocal.x * cosW - perifocal.y * sinW;
  const y1 = perifocal.x * sinW + perifocal.y * cosW;
  const z1 = perifocal.z;

  // Rx(i) tilts the orbital plane.
  const x2 = x1;
  const y2 = y1 * cosI - z1 * sinI;
  const z2 = y1 * sinI + z1 * cosI;

  // Rz(Ω) orients the ascending node.
  return {
    x: x2 * cosO - y2 * sinO,
    y: x2 * sinO + y2 * cosO,
    z: z2
  };
}

function vectorMagnitude(vector: Vector3D): number {
  return Math.hypot(vector.x, vector.y, vector.z);
}

/**
 * Computes the full Keplerian two-body orbital state (anomalies, position and
 * velocity in heliocentric ecliptic coordinates) at elapsed time t seconds
 * from the dataset epoch.
 */
export function orbitalStateAt(elements: OrbitalElementsSI, elapsedS: number): OrbitalState {
  const {
    semiMajorAxisM: a,
    eccentricity: e,
    inclinationRad,
    longitudeAscendingNodeRad,
    argumentOfPerihelionRad,
    meanAnomalyAtEpochRad,
    orbitalPeriodS
  } = elements;

  const meanAnomalyRad = meanAnomalyAt(meanAnomalyAtEpochRad, orbitalPeriodS, elapsedS);
  const kepler = solveKeplerEquation(meanAnomalyRad, e);
  const E = kepler.eccentricAnomalyRad;
  const trueAnomalyRad = trueAnomalyFromEccentric(E, e);
  const radiusM = radiusFromEccentricAnomaly(a, e, E);

  const perifocalPosition = positionInOrbitalPlane(a, e, E);

  // Perifocal velocity from the time derivative of the position:
  // vx = −(n a² / r) sin E, vy = (n a² / r) √(1−e²) cos E.
  const n = meanMotion(orbitalPeriodS);
  const speedFactor = (n * a * a) / radiusM;
  const perifocalVelocity: Vector3D = {
    x: -speedFactor * Math.sin(E),
    y: speedFactor * Math.sqrt(1 - e * e) * Math.cos(E),
    z: 0
  };

  const positionM = rotateToHeliocentric(
    perifocalPosition,
    inclinationRad,
    longitudeAscendingNodeRad,
    argumentOfPerihelionRad
  );
  const velocityMS = rotateToHeliocentric(
    perifocalVelocity,
    inclinationRad,
    longitudeAscendingNodeRad,
    argumentOfPerihelionRad
  );

  const speedMS = vectorMagnitude(velocityMS);
  const radialVelocityMS =
    (positionM.x * velocityMS.x + positionM.y * velocityMS.y + positionM.z * velocityMS.z) /
    radiusM;
  const transverseVelocityMS = Math.sqrt(
    Math.max(0, speedMS * speedMS - radialVelocityMS * radialVelocityMS)
  );

  return {
    timeS: elapsedS,
    meanAnomalyRad,
    eccentricAnomalyRad: E,
    trueAnomalyRad: normalizeAngle(trueAnomalyRad),
    radiusM,
    positionM,
    velocityMS,
    speedMS,
    radialVelocityMS,
    transverseVelocityMS,
    keplerIterations: kepler.iterations,
    keplerResidual: kepler.residual,
    keplerConverged: kepler.converged
  };
}
