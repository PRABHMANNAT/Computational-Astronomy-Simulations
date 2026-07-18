import type { OrbitalElements } from "@astro-sim/orbital-mechanics";

export interface PlanetRecord {
  name: string;
  color: string;
  radiusEarth: number;
  massEarth: number;
  elements: OrbitalElements;
  summary: string;
}

export const solarSystemPlanets: PlanetRecord[] = [
  {
    name: "Mercury",
    color: "#b8b1a6",
    radiusEarth: 0.383,
    massEarth: 0.055,
    elements: { semiMajorAxisAu: 0.387, eccentricity: 0.2056, orbitalPeriodDays: 87.969, phaseRadians: 0.2 },
    summary: "The innermost planet has the fastest orbit and the most eccentric path among the major planets."
  },
  {
    name: "Venus",
    color: "#e6c27a",
    radiusEarth: 0.949,
    massEarth: 0.815,
    elements: { semiMajorAxisAu: 0.723, eccentricity: 0.0068, orbitalPeriodDays: 224.701, phaseRadians: 1.0 },
    summary: "Venus follows a nearly circular orbit and is similar to Earth in size."
  },
  {
    name: "Earth",
    color: "#4f9cff",
    radiusEarth: 1,
    massEarth: 1,
    elements: { semiMajorAxisAu: 1, eccentricity: 0.0167, orbitalPeriodDays: 365.256, phaseRadians: 1.8 },
    summary: "Earth defines the astronomical unit and provides the baseline for relative mass and radius."
  },
  {
    name: "Mars",
    color: "#d36b43",
    radiusEarth: 0.532,
    massEarth: 0.107,
    elements: { semiMajorAxisAu: 1.524, eccentricity: 0.0934, orbitalPeriodDays: 686.98, phaseRadians: 2.5 },
    summary: "Mars has a visibly eccentric orbit compared with Earth and Venus."
  },
  {
    name: "Jupiter",
    color: "#d7b38c",
    radiusEarth: 11.21,
    massEarth: 317.8,
    elements: { semiMajorAxisAu: 5.203, eccentricity: 0.0489, orbitalPeriodDays: 4332.59, phaseRadians: 3.0 },
    summary: "Jupiter dominates planetary mass and moves slowly through a broad outer orbit."
  },
  {
    name: "Saturn",
    color: "#e2c98f",
    radiusEarth: 9.45,
    massEarth: 95.2,
    elements: { semiMajorAxisAu: 9.537, eccentricity: 0.0565, orbitalPeriodDays: 10759.22, phaseRadians: 3.6 },
    summary: "Saturn's long orbital period makes its motion gradual at dashboard time scales."
  },
  {
    name: "Uranus",
    color: "#8bd7df",
    radiusEarth: 4.01,
    massEarth: 14.5,
    elements: { semiMajorAxisAu: 19.191, eccentricity: 0.0472, orbitalPeriodDays: 30688.5, phaseRadians: 4.2 },
    summary: "Uranus is an ice giant with an orbital period of roughly 84 Earth years."
  },
  {
    name: "Neptune",
    color: "#4c6fff",
    radiusEarth: 3.88,
    massEarth: 17.1,
    elements: { semiMajorAxisAu: 30.07, eccentricity: 0.0086, orbitalPeriodDays: 60182, phaseRadians: 4.8 },
    summary: "Neptune anchors the outer edge of this simplified major-planet view."
  }
];
