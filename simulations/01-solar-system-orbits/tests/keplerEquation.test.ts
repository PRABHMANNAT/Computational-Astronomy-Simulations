import { describe, expect, it } from "vitest";
import {
  eccentricFromTrueAnomaly,
  normalizeAngle,
  solveKeplerEquation,
  trueAnomalyFromEccentric
} from "../src/physics/keplerEquation";
import { KEPLER_MAX_ITERATIONS, TWO_PI } from "../src/data/constants";

describe("solveKeplerEquation", () => {
  it("returns E = M for a circular orbit (e = 0)", () => {
    for (const meanAnomaly of [0, 0.5, 1.7, Math.PI, 5.9]) {
      const solution = solveKeplerEquation(meanAnomaly, 0);
      expect(solution.eccentricAnomalyRad).toBeCloseTo(meanAnomaly, 12);
      expect(solution.converged).toBe(true);
    }
  });

  it("converges for an Earth-like eccentricity", () => {
    const solution = solveKeplerEquation(2.3, 0.0167);
    expect(solution.converged).toBe(true);
    expect(solution.residual).toBeLessThanOrEqual(1e-12);
    const reconstructed =
      solution.eccentricAnomalyRad - 0.0167 * Math.sin(solution.eccentricAnomalyRad);
    expect(reconstructed).toBeCloseTo(2.3, 10);
  });

  it("converges for a Mercury-like eccentricity", () => {
    const solution = solveKeplerEquation(0.8, 0.2056);
    expect(solution.converged).toBe(true);
    expect(solution.residual).toBeLessThanOrEqual(1e-12);
  });

  it("converges for a very high eccentricity", () => {
    const solution = solveKeplerEquation(0.1, 0.95);
    expect(solution.converged).toBe(true);
  });

  it("handles mean anomalies near 0, π and 2π", () => {
    for (const meanAnomaly of [0, 1e-9, Math.PI - 1e-9, Math.PI, Math.PI + 1e-9, TWO_PI - 1e-9, TWO_PI]) {
      const solution = solveKeplerEquation(meanAnomaly, 0.3);
      expect(solution.converged).toBe(true);
      const reconstructed =
        solution.eccentricAnomalyRad - 0.3 * Math.sin(solution.eccentricAnomalyRad);
      expect(normalizeAngle(reconstructed)).toBeCloseTo(normalizeAngle(meanAnomaly), 8);
    }
  });

  it("keeps the residual below the requested tolerance", () => {
    const solution = solveKeplerEquation(1.234, 0.4, 1e-12);
    expect(solution.residual).toBeLessThanOrEqual(1e-12);
  });

  it("never exceeds the iteration cap", () => {
    const solution = solveKeplerEquation(3.05, 0.99);
    expect(solution.iterations).toBeLessThanOrEqual(KEPLER_MAX_ITERATIONS);
  });

  it("rejects invalid eccentricities instead of looping forever", () => {
    expect(() => solveKeplerEquation(1, -0.1)).toThrow();
    expect(() => solveKeplerEquation(1, 1)).toThrow();
    expect(() => solveKeplerEquation(1, 1.5)).toThrow();
    expect(() => solveKeplerEquation(1, Number.NaN)).toThrow();
  });

  it("rejects a non-finite mean anomaly", () => {
    expect(() => solveKeplerEquation(Number.POSITIVE_INFINITY, 0.1)).toThrow();
    expect(() => solveKeplerEquation(Number.NaN, 0.1)).toThrow();
  });
});

describe("true anomaly conversions", () => {
  it("matches the eccentric anomaly on a circular orbit", () => {
    expect(trueAnomalyFromEccentric(1.2, 0)).toBeCloseTo(1.2, 12);
  });

  it("round-trips through eccentricFromTrueAnomaly", () => {
    for (const eccentricAnomaly of [0.3, 1.5, 3.0, 4.8, 6.1]) {
      const nu = trueAnomalyFromEccentric(eccentricAnomaly, 0.2056);
      expect(eccentricFromTrueAnomaly(nu, 0.2056)).toBeCloseTo(eccentricAnomaly, 10);
    }
  });

  it("is zero at perihelion and π at aphelion", () => {
    expect(trueAnomalyFromEccentric(0, 0.5)).toBeCloseTo(0, 12);
    expect(trueAnomalyFromEccentric(Math.PI, 0.5)).toBeCloseTo(Math.PI, 12);
  });
});

describe("normalizeAngle", () => {
  it("maps angles into [0, 2π)", () => {
    expect(normalizeAngle(-0.1)).toBeCloseTo(TWO_PI - 0.1, 12);
    expect(normalizeAngle(TWO_PI + 0.25)).toBeCloseTo(0.25, 12);
    expect(normalizeAngle(0)).toBe(0);
  });
});
