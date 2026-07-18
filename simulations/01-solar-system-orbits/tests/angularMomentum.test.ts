import { describe, expect, it } from "vitest";
import { ASTRONOMICAL_UNIT_M, DAY_SECONDS, SOLAR_MU } from "../src/data/constants";
import { getPlanetById } from "../src/data/planetaryData";
import { toOrbitalElementsSI } from "../src/physics/orbitalElements";
import { orbitalStateAt } from "../src/physics/orbitalPosition";
import {
  angularMomentumCrossCheckError,
  angularMomentumVector,
  arealVelocity,
  specificAngularMomentum,
  vectorMagnitude
} from "../src/physics/angularMomentum";

const AU = ASTRONOMICAL_UNIT_M;

describe("specific angular momentum", () => {
  it("matches the analytical closed form h = √[μ a (1 − e²)]", () => {
    const a = 1 * AU;
    const e = 0.0167;
    const expected = Math.sqrt(SOLAR_MU * a * (1 - e * e));
    expect(specificAngularMomentum(a, e)).toBeCloseTo(expected, 6);
  });

  it("agrees between vector-based and analytical values", () => {
    const mars = toOrbitalElementsSI(getPlanetById("mars"));
    const state = orbitalStateAt(mars, 200 * DAY_SECONDS);
    const error = angularMomentumCrossCheckError(
      state.positionM,
      state.velocityMS,
      mars.semiMajorAxisM,
      mars.eccentricity
    );
    expect(error).toBeLessThan(1e-9);
  });

  it("remains constant throughout the orbit", () => {
    const mercury = toOrbitalElementsSI(getPlanetById("mercury"));
    const reference = specificAngularMomentum(mercury.semiMajorAxisM, mercury.eccentricity);
    for (const days of [0, 15, 30, 44, 58, 73, 87]) {
      const state = orbitalStateAt(mercury, days * DAY_SECONDS);
      const h = vectorMagnitude(angularMomentumVector(state.positionM, state.velocityMS));
      expect(Math.abs(h - reference) / reference).toBeLessThan(1e-9);
    }
  });

  it("points perpendicular to both position and velocity", () => {
    const earth = toOrbitalElementsSI(getPlanetById("earth"));
    const state = orbitalStateAt(earth, 90 * DAY_SECONDS);
    const h = angularMomentumVector(state.positionM, state.velocityMS);
    const dotWithR = h.x * state.positionM.x + h.y * state.positionM.y + h.z * state.positionM.z;
    const dotWithV = h.x * state.velocityMS.x + h.y * state.velocityMS.y + h.z * state.velocityMS.z;
    const scale = vectorMagnitude(h) * state.radiusM;
    expect(Math.abs(dotWithR) / scale).toBeLessThan(1e-9);
    expect(Math.abs(dotWithV) / (vectorMagnitude(h) * state.speedMS)).toBeLessThan(1e-9);
  });

  it("gives areal velocity h/2 (Kepler's second law)", () => {
    expect(arealVelocity(10)).toBe(5);
  });

  it("rejects invalid inputs", () => {
    expect(() => specificAngularMomentum(-1, 0.1)).toThrow();
    expect(() => specificAngularMomentum(1 * AU, 1.2)).toThrow();
  });
});
