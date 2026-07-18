import { describe, expect, it } from "vitest";
import { ASTRONOMICAL_UNIT_M, DAY_SECONDS } from "../src/data/constants";
import { getPlanetById, PLANETS } from "../src/data/planetaryData";
import { toOrbitalElementsSI } from "../src/physics/orbitalElements";
import { orbitalStateAt } from "../src/physics/orbitalPosition";
import {
  energyCrossCheckError,
  specificKineticEnergy,
  specificOrbitalEnergy,
  specificOrbitalEnergyFromSemiMajorAxis,
  specificPotentialEnergy,
  totalOrbitalEnergy
} from "../src/physics/orbitalEnergy";
import { visVivaSpeed } from "../src/physics/orbitalVelocity";

const AU = ASTRONOMICAL_UNIT_M;

describe("specific orbital energy", () => {
  it("is negative for every bound planetary orbit", () => {
    for (const planet of PLANETS) {
      const energy = specificOrbitalEnergyFromSemiMajorAxis(planet.semiMajorAxisAU * AU);
      expect(energy).toBeLessThan(0);
    }
  });

  it("matches v²/2 − μ/r against −μ/(2a)", () => {
    const a = 1.5237 * AU;
    const r = 1.45 * AU;
    const v = visVivaSpeed(r, a);
    const fromState = specificOrbitalEnergy(v, r);
    const fromGeometry = specificOrbitalEnergyFromSemiMajorAxis(a);
    expect(Math.abs(fromState - fromGeometry) / Math.abs(fromGeometry)).toBeLessThan(1e-10);
  });

  it("remains constant at multiple anomalies along a full orbit", () => {
    const mercury = toOrbitalElementsSI(getPlanetById("mercury"));
    const reference = specificOrbitalEnergyFromSemiMajorAxis(mercury.semiMajorAxisM);
    for (const days of [0, 10, 25, 44, 60, 75, 87]) {
      const state = orbitalStateAt(mercury, days * DAY_SECONDS);
      const energy = specificOrbitalEnergy(state.speedMS, state.radiusM);
      expect(Math.abs(energy - reference) / Math.abs(reference)).toBeLessThan(1e-9);
    }
  });

  it("keeps the cross-check error at machine precision for exact states", () => {
    const earth = toOrbitalElementsSI(getPlanetById("earth"));
    const state = orbitalStateAt(earth, 123 * DAY_SECONDS);
    const error = energyCrossCheckError(state.speedMS, state.radiusM, earth.semiMajorAxisM);
    expect(error).toBeLessThan(1e-9);
  });

  it("splits into kinetic and potential parts consistently", () => {
    const v = 30000;
    const r = 1 * AU;
    expect(specificKineticEnergy(v) + specificPotentialEnergy(r)).toBeCloseTo(
      specificOrbitalEnergy(v, r),
      6
    );
  });

  it("scales total energy with planet mass", () => {
    const epsilon = -4.4e8;
    expect(totalOrbitalEnergy(2, epsilon)).toBeCloseTo(2 * epsilon, 6);
  });

  it("rejects invalid geometry", () => {
    expect(() => specificPotentialEnergy(0)).toThrow();
    expect(() => specificOrbitalEnergyFromSemiMajorAxis(-1)).toThrow();
  });
});
