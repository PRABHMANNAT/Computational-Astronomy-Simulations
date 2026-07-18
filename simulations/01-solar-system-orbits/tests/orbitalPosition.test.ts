import { describe, expect, it } from "vitest";
import { ASTRONOMICAL_UNIT_M, DAY_SECONDS } from "../src/data/constants";
import { getPlanetById } from "../src/data/planetaryData";
import {
  aphelionDistance,
  meanAnomalyAt,
  meanMotion,
  orbitalPeriodFromSemiMajorAxis,
  perihelionDistance,
  toOrbitalElementsSI
} from "../src/physics/orbitalElements";
import {
  orbitalStateAt,
  positionInOrbitalPlane,
  radiusFromEccentricAnomaly,
  radiusFromTrueAnomaly,
  rotateToHeliocentric
} from "../src/physics/orbitalPosition";
import { degToRad, radToDeg } from "../src/utils/units";

const AU = ASTRONOMICAL_UNIT_M;

describe("radius equations", () => {
  const a = 1.5237 * AU;
  const e = 0.0934;

  it("gives a(1-e) at perihelion (E = 0)", () => {
    expect(radiusFromEccentricAnomaly(a, e, 0)).toBeCloseTo(perihelionDistance(a, e), 6);
  });

  it("gives a(1+e) at aphelion (E = π)", () => {
    expect(radiusFromEccentricAnomaly(a, e, Math.PI)).toBeCloseTo(aphelionDistance(a, e), 6);
  });

  it("agrees between the eccentric-anomaly and true-anomaly forms", () => {
    const earth = toOrbitalElementsSI(getPlanetById("earth"));
    for (const days of [0, 50, 123.4, 200, 300, 365]) {
      const state = orbitalStateAt(earth, days * DAY_SECONDS);
      const crossCheck = radiusFromTrueAnomaly(
        earth.semiMajorAxisM,
        earth.eccentricity,
        state.trueAnomalyRad
      );
      expect(Math.abs(state.radiusM - crossCheck) / state.radiusM).toBeLessThan(1e-10);
    }
  });
});

describe("coordinate transformations", () => {
  it("keeps a zero-inclination orbit in the z = 0 plane", () => {
    const earth = toOrbitalElementsSI(getPlanetById("earth"));
    for (const days of [0, 91, 182, 273]) {
      const state = orbitalStateAt(earth, days * DAY_SECONDS);
      expect(Math.abs(state.positionM.z)).toBeLessThan(1e-3);
    }
  });

  it("produces non-zero z for an inclined orbit", () => {
    const mercury = toOrbitalElementsSI(getPlanetById("mercury"));
    let maxZ = 0;
    for (let day = 0; day < 88; day += 4) {
      const state = orbitalStateAt(mercury, day * DAY_SECONDS);
      maxZ = Math.max(maxZ, Math.abs(state.positionM.z));
    }
    expect(maxZ).toBeGreaterThan(0.01 * AU);
  });

  it("preserves radial distance under rotation", () => {
    const vector = { x: 1.2 * AU, y: -0.4 * AU, z: 0 };
    const rotated = rotateToHeliocentric(vector, degToRad(7), degToRad(48.3), degToRad(29.1));
    const before = Math.hypot(vector.x, vector.y, vector.z);
    const after = Math.hypot(rotated.x, rotated.y, rotated.z);
    expect(after).toBeCloseTo(before, 6);
  });

  it("converts degrees and radians correctly", () => {
    expect(degToRad(180)).toBeCloseTo(Math.PI, 12);
    expect(radToDeg(Math.PI / 2)).toBeCloseTo(90, 12);
    expect(radToDeg(degToRad(123.456))).toBeCloseTo(123.456, 10);
  });
});

describe("mean motion and orbital period", () => {
  it("computes Earth's period as approximately one sidereal year", () => {
    const computedS = orbitalPeriodFromSemiMajorAxis(1 * AU);
    const computedDays = computedS / DAY_SECONDS;
    expect(computedDays).toBeGreaterThan(364.5);
    expect(computedDays).toBeLessThan(366);
  });

  it("scales periods approximately as a^(3/2)", () => {
    const periodAt1 = orbitalPeriodFromSemiMajorAxis(1 * AU);
    const periodAt4 = orbitalPeriodFromSemiMajorAxis(4 * AU);
    expect(periodAt4 / periodAt1).toBeCloseTo(8, 6);
  });

  it("gives Neptune a longer period than Jupiter", () => {
    const jupiter = orbitalPeriodFromSemiMajorAxis(5.2028 * AU);
    const neptune = orbitalPeriodFromSemiMajorAxis(30.0611 * AU);
    expect(neptune).toBeGreaterThan(jupiter);
  });

  it("normalizes the mean anomaly to [0, 2π)", () => {
    const periodS = 100 * DAY_SECONDS;
    const anomaly = meanAnomalyAt(6, periodS, 250 * DAY_SECONDS);
    expect(anomaly).toBeGreaterThanOrEqual(0);
    expect(anomaly).toBeLessThan(2 * Math.PI);
  });

  it("rejects a non-positive orbital period", () => {
    expect(() => meanMotion(0)).toThrow();
    expect(() => meanMotion(-5)).toThrow();
  });
});

describe("orbital state", () => {
  it("returns to the same position after one full period", () => {
    const mars = toOrbitalElementsSI(getPlanetById("mars"));
    const start = orbitalStateAt(mars, 0);
    const afterOnePeriod = orbitalStateAt(mars, mars.orbitalPeriodS);
    expect(afterOnePeriod.positionM.x).toBeCloseTo(start.positionM.x, 0);
    expect(afterOnePeriod.positionM.y).toBeCloseTo(start.positionM.y, 0);
    expect(afterOnePeriod.positionM.z).toBeCloseTo(start.positionM.z, 0);
  });

  it("keeps the radius between perihelion and aphelion", () => {
    const mercury = toOrbitalElementsSI(getPlanetById("mercury"));
    const rp = perihelionDistance(mercury.semiMajorAxisM, mercury.eccentricity);
    const ra = aphelionDistance(mercury.semiMajorAxisM, mercury.eccentricity);
    for (let day = 0; day < 88; day += 1) {
      const state = orbitalStateAt(mercury, day * DAY_SECONDS);
      expect(state.radiusM).toBeGreaterThanOrEqual(rp - 1);
      expect(state.radiusM).toBeLessThanOrEqual(ra + 1);
    }
  });

  it("matches perifocal geometry at perihelion", () => {
    const planar = positionInOrbitalPlane(1 * AU, 0.5, 0);
    expect(planar.x).toBeCloseTo(0.5 * AU, 3);
    expect(planar.y).toBeCloseTo(0, 6);
  });
});
