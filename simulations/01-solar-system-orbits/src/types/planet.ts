export interface PlanetaryData {
  id: string;
  name: string;
  symbol: string;
  color: string;
  massKg: number;
  radiusKm: number;
  meanDensityKgM3: number;
  surfaceGravityMS2: number;
  escapeVelocityKMS: number;
  semiMajorAxisAU: number;
  eccentricity: number;
  inclinationDeg: number;
  longitudeAscendingNodeDeg: number;
  argumentOfPerihelionDeg: number;
  meanAnomalyAtEpochDeg: number;
  orbitalPeriodDays: number;
  rotationPeriodHours: number;
  axialTiltDeg: number;
  perihelionAU: number;
  aphelionAU: number;
  averageOrbitalVelocityKMS: number;
  numberOfMoons: number;
  description: string;
}

/** Classical Keplerian orbital elements expressed in SI units (metres, radians, seconds). */
export interface OrbitalElementsSI {
  semiMajorAxisM: number;
  eccentricity: number;
  inclinationRad: number;
  longitudeAscendingNodeRad: number;
  argumentOfPerihelionRad: number;
  meanAnomalyAtEpochRad: number;
  orbitalPeriodS: number;
}

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

/** Full instantaneous orbital state of one body around the Sun, SI units. */
export interface OrbitalState {
  timeS: number;
  meanAnomalyRad: number;
  eccentricAnomalyRad: number;
  trueAnomalyRad: number;
  radiusM: number;
  positionM: Vector3D;
  velocityMS: Vector3D;
  speedMS: number;
  radialVelocityMS: number;
  transverseVelocityMS: number;
  keplerIterations: number;
  keplerResidual: number;
  keplerConverged: boolean;
}
