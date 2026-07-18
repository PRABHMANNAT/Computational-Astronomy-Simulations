import { describe, expect, it } from "vitest";
import { planets } from "../src/data/planets";
import {
  calculateMeanAnomaly,
  calculatePlanetPosition,
  solveEccentricAnomaly
} from "../src/physics/orbits";

describe("solar system orbital calculations", () => {
  it("returns the same orbital phase after one orbital period", () => {
    const earth = planets.find((planet) => planet.name === "Earth");
    expect(earth).toBeDefined();

    const start = calculatePlanetPosition(0, earth!.elements);
    const afterOnePeriod = calculatePlanetPosition(earth!.elements.orbitalPeriodDays, earth!.elements);

    expect(afterOnePeriod.xAu).toBeCloseTo(start.xAu, 6);
    expect(afterOnePeriod.yAu).toBeCloseTo(start.yAu, 6);
  });

  it("keeps planet radius within perihelion and aphelion bounds", () => {
    for (const planet of planets) {
      const position = calculatePlanetPosition(planet.elements.orbitalPeriodDays * 0.37, planet.elements);
      const perihelion = planet.elements.semiMajorAxisAu * (1 - planet.elements.eccentricity);
      const aphelion = planet.elements.semiMajorAxisAu * (1 + planet.elements.eccentricity);

      expect(position.radiusAu).toBeGreaterThanOrEqual(perihelion - 1e-8);
      expect(position.radiusAu).toBeLessThanOrEqual(aphelion + 1e-8);
    }
  });

  it("solves Kepler's equation for elliptical orbits", () => {
    const eccentricity = 0.2056;
    const mean = calculateMeanAnomaly(22, 87.969);
    const eccentric = solveEccentricAnomaly(mean, eccentricity);
    const reconstructedMean = eccentric - eccentricity * Math.sin(eccentric);

    expect(reconstructedMean).toBeCloseTo(mean, 8);
  });
});
