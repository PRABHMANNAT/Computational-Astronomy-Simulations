import type { PlanetaryData } from "../types/planet";

/**
 * Approximate mean orbital elements and bulk properties for the eight major planets.
 *
 * These are scientifically reasonable epoch-J2000-style mean values suitable for an
 * educational Keplerian two-body model. They are NOT continuously updated ephemerides
 * and must not be used for mission navigation or precision astronomy.
 *
 * Sources: NASA planetary fact sheets and standard mean-element tables (rounded).
 */
export const PLANETS: PlanetaryData[] = [
  {
    id: "mercury",
    name: "Mercury",
    symbol: "☿",
    color: "#b8b1a6",
    massKg: 3.3011e23,
    radiusKm: 2439.7,
    meanDensityKgM3: 5427,
    surfaceGravityMS2: 3.7,
    escapeVelocityKMS: 4.25,
    semiMajorAxisAU: 0.3871,
    eccentricity: 0.2056,
    inclinationDeg: 7.005,
    longitudeAscendingNodeDeg: 48.331,
    argumentOfPerihelionDeg: 29.124,
    meanAnomalyAtEpochDeg: 174.796,
    orbitalPeriodDays: 87.969,
    rotationPeriodHours: 1407.6,
    axialTiltDeg: 0.034,
    perihelionAU: 0.3075,
    aphelionAU: 0.4667,
    averageOrbitalVelocityKMS: 47.36,
    numberOfMoons: 0,
    description:
      "The innermost planet. Its orbit has the highest eccentricity of the eight major planets, which makes its perihelion speed-up clearly visible."
  },
  {
    id: "venus",
    name: "Venus",
    symbol: "♀",
    color: "#e6c27a",
    massKg: 4.8675e24,
    radiusKm: 6051.8,
    meanDensityKgM3: 5243,
    surfaceGravityMS2: 8.87,
    escapeVelocityKMS: 10.36,
    semiMajorAxisAU: 0.7233,
    eccentricity: 0.0068,
    inclinationDeg: 3.394,
    longitudeAscendingNodeDeg: 76.68,
    argumentOfPerihelionDeg: 54.884,
    meanAnomalyAtEpochDeg: 50.115,
    orbitalPeriodDays: 224.701,
    rotationPeriodHours: -5832.5,
    axialTiltDeg: 177.36,
    perihelionAU: 0.7184,
    aphelionAU: 0.7282,
    averageOrbitalVelocityKMS: 35.02,
    numberOfMoons: 0,
    description:
      "Venus follows the most circular orbit in the Solar System and rotates retrograde, so its day is longer than its year."
  },
  {
    id: "earth",
    name: "Earth",
    symbol: "⊕",
    color: "#4f9cff",
    massKg: 5.97237e24,
    radiusKm: 6371,
    meanDensityKgM3: 5514,
    surfaceGravityMS2: 9.81,
    escapeVelocityKMS: 11.19,
    semiMajorAxisAU: 1,
    eccentricity: 0.0167,
    inclinationDeg: 0,
    longitudeAscendingNodeDeg: 0,
    argumentOfPerihelionDeg: 102.937,
    meanAnomalyAtEpochDeg: 358.617,
    orbitalPeriodDays: 365.256,
    rotationPeriodHours: 23.934,
    axialTiltDeg: 23.44,
    perihelionAU: 0.9833,
    aphelionAU: 1.0167,
    averageOrbitalVelocityKMS: 29.78,
    numberOfMoons: 1,
    description:
      "Earth defines the astronomical unit and the ecliptic reference plane used by this simulation. Its orbit is nearly, but not exactly, circular."
  },
  {
    id: "mars",
    name: "Mars",
    symbol: "♂",
    color: "#d36b43",
    massKg: 6.4171e23,
    radiusKm: 3389.5,
    meanDensityKgM3: 3933,
    surfaceGravityMS2: 3.71,
    escapeVelocityKMS: 5.03,
    semiMajorAxisAU: 1.5237,
    eccentricity: 0.0934,
    inclinationDeg: 1.85,
    longitudeAscendingNodeDeg: 49.558,
    argumentOfPerihelionDeg: 286.502,
    meanAnomalyAtEpochDeg: 19.412,
    orbitalPeriodDays: 686.98,
    rotationPeriodHours: 24.623,
    axialTiltDeg: 25.19,
    perihelionAU: 1.3814,
    aphelionAU: 1.666,
    averageOrbitalVelocityKMS: 24.07,
    numberOfMoons: 2,
    description:
      "Mars has a noticeably eccentric orbit; the difference between its perihelion and aphelion distance is large enough to drive strong seasonal asymmetry."
  },
  {
    id: "jupiter",
    name: "Jupiter",
    symbol: "♃",
    color: "#d7b38c",
    massKg: 1.8982e27,
    radiusKm: 69911,
    meanDensityKgM3: 1326,
    surfaceGravityMS2: 24.79,
    escapeVelocityKMS: 59.5,
    semiMajorAxisAU: 5.2028,
    eccentricity: 0.0489,
    inclinationDeg: 1.303,
    longitudeAscendingNodeDeg: 100.464,
    argumentOfPerihelionDeg: 273.867,
    meanAnomalyAtEpochDeg: 20.02,
    orbitalPeriodDays: 4332.59,
    rotationPeriodHours: 9.925,
    axialTiltDeg: 3.13,
    perihelionAU: 4.9484,
    aphelionAU: 5.4572,
    averageOrbitalVelocityKMS: 13.07,
    numberOfMoons: 95,
    description:
      "Jupiter holds more mass than all other planets combined and takes almost twelve Earth years to complete one orbit."
  },
  {
    id: "saturn",
    name: "Saturn",
    symbol: "♄",
    color: "#e2c98f",
    massKg: 5.6834e26,
    radiusKm: 58232,
    meanDensityKgM3: 687,
    surfaceGravityMS2: 10.44,
    escapeVelocityKMS: 35.5,
    semiMajorAxisAU: 9.5388,
    eccentricity: 0.0565,
    inclinationDeg: 2.485,
    longitudeAscendingNodeDeg: 113.665,
    argumentOfPerihelionDeg: 339.392,
    meanAnomalyAtEpochDeg: 317.02,
    orbitalPeriodDays: 10759.22,
    rotationPeriodHours: 10.656,
    axialTiltDeg: 26.73,
    perihelionAU: 9.0004,
    aphelionAU: 10.0777,
    averageOrbitalVelocityKMS: 9.68,
    numberOfMoons: 146,
    description:
      "Saturn is the least dense planet; it would float in water. One Saturn orbit lasts about 29.5 Earth years."
  },
  {
    id: "uranus",
    name: "Uranus",
    symbol: "⛢",
    color: "#8bd7df",
    massKg: 8.681e25,
    radiusKm: 25362,
    meanDensityKgM3: 1271,
    surfaceGravityMS2: 8.87,
    escapeVelocityKMS: 21.3,
    semiMajorAxisAU: 19.1914,
    eccentricity: 0.0472,
    inclinationDeg: 0.773,
    longitudeAscendingNodeDeg: 74.006,
    argumentOfPerihelionDeg: 96.998,
    meanAnomalyAtEpochDeg: 142.238,
    orbitalPeriodDays: 30688.5,
    rotationPeriodHours: -17.24,
    axialTiltDeg: 97.77,
    perihelionAU: 18.2856,
    aphelionAU: 20.0972,
    averageOrbitalVelocityKMS: 6.8,
    numberOfMoons: 28,
    description:
      "Uranus rotates on its side with an axial tilt near 98 degrees and needs 84 Earth years for a single orbit."
  },
  {
    id: "neptune",
    name: "Neptune",
    symbol: "♆",
    color: "#4c6fff",
    massKg: 1.02413e26,
    radiusKm: 24622,
    meanDensityKgM3: 1638,
    surfaceGravityMS2: 11.15,
    escapeVelocityKMS: 23.5,
    semiMajorAxisAU: 30.0611,
    eccentricity: 0.0086,
    inclinationDeg: 1.77,
    longitudeAscendingNodeDeg: 131.784,
    argumentOfPerihelionDeg: 276.336,
    meanAnomalyAtEpochDeg: 256.228,
    orbitalPeriodDays: 60182,
    rotationPeriodHours: 16.11,
    axialTiltDeg: 28.32,
    perihelionAU: 29.8026,
    aphelionAU: 30.3196,
    averageOrbitalVelocityKMS: 5.43,
    numberOfMoons: 16,
    description:
      "Neptune, the outermost major planet, completes one orbit every 165 Earth years along a nearly circular path."
  }
];

export const PLANET_IDS = PLANETS.map((planet) => planet.id);

export function getPlanetById(id: string): PlanetaryData {
  const planet = PLANETS.find((entry) => entry.id === id);
  if (!planet) {
    throw new Error(`Unknown planet id: ${id}`);
  }
  return planet;
}
