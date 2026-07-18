import { describe, expect, it } from "vitest";
import { ASTRONOMICAL_UNIT_M, DAY_SECONDS, SOLAR_MU } from "../src/data/constants";
import { getPlanetById } from "../src/data/planetaryData";
import { toOrbitalElementsSI } from "../src/physics/orbitalElements";
import { orbitalStateAt } from "../src/physics/orbitalPosition";
import {
  aphelionSpeed,
  centripetalAcceleration,
  circularOrbitSpeed,
  gravitationalAcceleration,
  gravitationalForce,
  perihelionSpeed,
  visVivaSpeed
} from "../src/physics/orbitalVelocity";

const AU = ASTRONOMICAL_UNIT_M;

describe("vis-viva equation", () => {
  it("produces a positive finite speed for valid inputs", () => {
    const speed = visVivaSpeed(1 * AU, 1 * AU);
    expect(Number.isFinite(speed)).toBe(true);
    expect(speed).toBeGreaterThan(0);
  });

  it("puts Earth's average speed in a scientifically reasonable range", () => {
    const speed = visVivaSpeed(1 * AU, 1 * AU);
    expect(speed / 1000).toBeGreaterThan(29);
    expect(speed / 1000).toBeLessThan(30.5);
  });

  it("makes perihelion speed exceed aphelion speed", () => {
    const a = 0.3871 * AU;
    const e = 0.2056;
    expect(perihelionSpeed(a, e)).toBeGreaterThan(aphelionSpeed(a, e));
  });

  it("matches perihelion/aphelion closed forms at orbit extremes", () => {
    const a = 1.5237 * AU;
    const e = 0.0934;
    expect(visVivaSpeed(a * (1 - e), a)).toBeCloseTo(perihelionSpeed(a, e), 6);
    expect(visVivaSpeed(a * (1 + e), a)).toBeCloseTo(aphelionSpeed(a, e), 6);
  });

  it("matches the velocity magnitude from the state-vector pipeline", () => {
    const mercury = toOrbitalElementsSI(getPlanetById("mercury"));
    for (const days of [0, 11, 22, 44, 66, 87]) {
      const state = orbitalStateAt(mercury, days * DAY_SECONDS);
      const expected = visVivaSpeed(state.radiusM, mercury.semiMajorAxisM);
      expect(Math.abs(state.speedMS - expected) / expected).toBeLessThan(1e-9);
    }
  });

  it("rejects invalid radii", () => {
    expect(() => visVivaSpeed(0, 1 * AU)).toThrow();
    expect(() => visVivaSpeed(-1, 1 * AU)).toThrow();
    expect(() => visVivaSpeed(Number.NaN, 1 * AU)).toThrow();
  });
});

describe("gravitational force and acceleration", () => {
  it("follows the inverse-square law", () => {
    const massKg = 5.97237e24;
    const forceAt1 = gravitationalForce(massKg, 1 * AU);
    const forceAt2 = gravitationalForce(massKg, 2 * AU);
    expect(forceAt1 / forceAt2).toBeCloseTo(4, 6);
  });

  it("computes roughly 3.5e22 N for the Sun-Earth pair", () => {
    const force = gravitationalForce(5.97237e24, 1 * AU);
    expect(force).toBeGreaterThan(3.4e22);
    expect(force).toBeLessThan(3.7e22);
  });

  it("matches centripetal acceleration for a circular orbit", () => {
    const r = 1 * AU;
    const v = circularOrbitSpeed(r);
    expect(centripetalAcceleration(v, r)).toBeCloseTo(gravitationalAcceleration(r), 10);
  });

  it("uses SOLAR_MU consistently", () => {
    expect(gravitationalAcceleration(1 * AU)).toBeCloseTo(SOLAR_MU / (AU * AU), 12);
  });

  it("rejects non-positive radii", () => {
    expect(() => gravitationalForce(1e24, 0)).toThrow();
    expect(() => gravitationalAcceleration(-1)).toThrow();
    expect(() => centripetalAcceleration(1000, 0)).toThrow();
  });
});
