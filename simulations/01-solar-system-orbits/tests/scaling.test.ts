import { describe, expect, it } from "vitest";
import {
  sanitizeScale,
  scaleDistanceAu,
  scalePlanetRadius,
  scalePositionAu,
  scaleSunRadius
} from "../src/physics/scaling";
import { classifyAccuracy, relativeError, validatePlanetaryData } from "../src/physics/validation";
import { getPlanetById, PLANETS } from "../src/data/planetaryData";
import { RingBuffer, polygonArea, proportionalFit } from "../src/utils/numericalMethods";

describe("distance scaling", () => {
  it("keeps linear mode unchanged", () => {
    expect(scaleDistanceAu(5.2, "linear")).toBeCloseTo(5.2, 12);
    expect(scaleDistanceAu(-1.4, "linear")).toBeCloseTo(-1.4, 12);
  });

  it("compresses the outer system more than the inner system", () => {
    const innerRatio = scaleDistanceAu(1, "compressed") / 1;
    const outerRatio = scaleDistanceAu(30, "compressed") / 30;
    expect(outerRatio).toBeLessThan(innerRatio);
  });

  it("keeps ordering monotonic in every mode", () => {
    for (const mode of ["linear", "compressed", "logarithmic", "educational", "real"] as const) {
      let previous = 0;
      for (const au of [0.4, 0.7, 1, 1.5, 5.2, 9.5, 19.2, 30]) {
        const scaled = scaleDistanceAu(au, mode);
        expect(scaled).toBeGreaterThan(previous);
        previous = scaled;
      }
    }
  });

  it("preserves direction when scaling positions", () => {
    const scaled = scalePositionAu({ x: 3, y: 4, z: 0 }, "compressed", 1);
    expect(scaled.x / scaled.y).toBeCloseTo(3 / 4, 10);
  });

  it("handles the origin without dividing by zero", () => {
    const scaled = scalePositionAu({ x: 0, y: 0, z: 0 }, "logarithmic", 1);
    expect(scaled).toEqual({ x: 0, y: 0, z: 0 });
  });
});

describe("scale sanitization", () => {
  it("rejects negative, zero and non-finite scales", () => {
    expect(sanitizeScale(-2)).toBe(1);
    expect(sanitizeScale(0)).toBe(1);
    expect(sanitizeScale(Number.NaN)).toBe(1);
    expect(sanitizeScale(Number.POSITIVE_INFINITY)).toBe(1);
  });

  it("clamps extreme values", () => {
    expect(sanitizeScale(1000)).toBeLessThanOrEqual(20);
    expect(sanitizeScale(1e-9)).toBeGreaterThanOrEqual(0.05);
  });

  it("keeps planet and sun radii positive", () => {
    expect(scalePlanetRadius(6371, 1)).toBeGreaterThan(0);
    expect(scalePlanetRadius(2439, -5)).toBeGreaterThan(0);
    expect(scaleSunRadius(1)).toBeGreaterThan(0);
  });
});

describe("validation", () => {
  it("computes relative error with a safe epsilon", () => {
    expect(relativeError(1.0000001, 1)).toBeCloseTo(1e-7, 8);
    expect(Number.isFinite(relativeError(1e-20, 0))).toBe(true);
    expect(relativeError(Number.NaN, 1)).toBe(Number.POSITIVE_INFINITY);
  });

  it("classifies accuracy statuses at the documented thresholds", () => {
    expect(classifyAccuracy(1e-12)).toBe("excellent");
    expect(classifyAccuracy(1e-8)).toBe("acceptable");
    expect(classifyAccuracy(1e-5)).toBe("warning");
    expect(classifyAccuracy(1e-3)).toBe("invalid");
    expect(classifyAccuracy(Number.POSITIVE_INFINITY)).toBe("invalid");
  });

  it("accepts the shipped planetary dataset", () => {
    for (const planet of PLANETS) {
      expect(() => validatePlanetaryData(planet)).not.toThrow();
    }
  });

  it("rejects corrupted planetary data", () => {
    const broken = { ...getPlanetById("earth"), eccentricity: 1.4, massKg: -1 };
    expect(() => validatePlanetaryData(broken)).toThrow(/eccentricity/);
  });
});

describe("numerical helpers", () => {
  it("bounds ring buffer memory and preserves order", () => {
    const buffer = new RingBuffer<number>(3);
    [1, 2, 3, 4, 5].forEach((value) => buffer.push(value));
    expect(buffer.size).toBe(3);
    expect(buffer.toArray()).toEqual([3, 4, 5]);
  });

  it("rejects invalid ring buffer capacity", () => {
    expect(() => new RingBuffer(0)).toThrow();
    expect(() => new RingBuffer(-1)).toThrow();
  });

  it("computes polygon areas with the shoelace formula", () => {
    const unitSquare = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 0, y: 1 }
    ];
    expect(polygonArea(unitSquare)).toBeCloseTo(1, 12);
  });

  it("fits a proportional relation through the origin", () => {
    const slope = proportionalFit([
      { x: 1, y: 2 },
      { x: 2, y: 4 },
      { x: 3, y: 6 }
    ]);
    expect(slope).toBeCloseTo(2, 10);
  });
});
