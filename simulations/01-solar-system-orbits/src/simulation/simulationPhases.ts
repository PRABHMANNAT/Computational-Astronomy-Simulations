import { DAY_SECONDS } from "../data/constants";
import type { OrbitalElementsSI, OrbitalState } from "../types/planet";
import type {
  OrbitCompletionReport,
  SimulationPhaseId,
  SimulationPhaseInfo
} from "../types/simulation";
import { aphelionDistance, perihelionDistance } from "../physics/orbitalElements";
import { specificOrbitalEnergy } from "../physics/orbitalEnergy";
import { angularMomentumVector, vectorMagnitude } from "../physics/angularMomentum";
import { TWO_PI } from "../data/constants";

export const PHASES: SimulationPhaseInfo[] = [
  {
    id: "initial-conditions",
    title: "Phase 1 · Initial conditions",
    summary: "The orbit is defined by its elements: a, e, i, Ω, ω and the epoch mean anomaly."
  },
  {
    id: "orbital-acceleration",
    title: "Phase 2 · Orbital acceleration",
    summary: "Solar gravity continuously bends the velocity vector toward the Sun, curving the path."
  },
  {
    id: "approaching-perihelion",
    title: "Phase 3 · Approaching perihelion",
    summary: "The planet accelerates as it approaches perihelion: kinetic energy rises as potential energy falls."
  },
  {
    id: "perihelion-passage",
    title: "Phase 4 · Perihelion passage",
    summary: "Closest approach: maximum speed, maximum gravitational force, peak kinetic energy."
  },
  {
    id: "moving-toward-aphelion",
    title: "Phase 5 · Moving toward aphelion",
    summary: "The planet decelerates while moving away from the Sun; potential energy is being restored."
  },
  {
    id: "aphelion-passage",
    title: "Phase 6 · Aphelion passage",
    summary: "Farthest point: minimum speed, minimum gravitational force, minimum kinetic energy."
  },
  {
    id: "orbit-completion",
    title: "Phase 7 · Orbit completion",
    summary: "One full revolution finished — compare measured against expected orbital behaviour."
  }
];

export function getPhaseInfo(id: SimulationPhaseId): SimulationPhaseInfo {
  return PHASES.find((phase) => phase.id === id) ?? PHASES[0];
}

/** Perihelion proximity tolerance: |r − r_p| / r_p < 1%. */
export const PERIHELION_TOLERANCE = 0.01;
/** Aphelion proximity tolerance: |r − r_a| / r_a < 1%. */
export const APHELION_TOLERANCE = 0.01;
/** "Approaching perihelion" threshold: r ≤ r_p + 20% of (r_a − r_p) while inbound. */
export const APPROACH_FRACTION = 0.2;

/**
 * Classifies the current instant of the selected planet's orbit into one of
 * the educational phases. Purely a function of the orbital state, so it is
 * directly unit-testable.
 */
export function detectPhase(
  state: OrbitalState,
  elements: OrbitalElementsSI,
  elapsedDaysSinceReset: number
): SimulationPhaseId {
  const rp = perihelionDistance(elements.semiMajorAxisM, elements.eccentricity);
  const ra = aphelionDistance(elements.semiMajorAxisM, elements.eccentricity);
  const periodDays = elements.orbitalPeriodS / DAY_SECONDS;

  if (Math.abs(state.radiusM - rp) / rp < PERIHELION_TOLERANCE) {
    return "perihelion-passage";
  }
  if (Math.abs(state.radiusM - ra) / ra < APHELION_TOLERANCE) {
    return "aphelion-passage";
  }
  if (Math.abs(elapsedDaysSinceReset) < 0.02 * periodDays) {
    return "initial-conditions";
  }
  if (state.radialVelocityMS < 0) {
    const approachThreshold = rp + APPROACH_FRACTION * (ra - rp);
    return state.radiusM <= approachThreshold ? "approaching-perihelion" : "orbital-acceleration";
  }
  return "moving-toward-aphelion";
}

/** Slow-motion factor applied near orbit extremes when the user enables auto slow-motion. */
export function slowMotionFactorForPhase(phase: SimulationPhaseId): number {
  return phase === "perihelion-passage" || phase === "aphelion-passage" ? 0.15 : 1;
}

interface TrackerSample {
  elapsedDays: number;
  state: OrbitalState;
}

/**
 * Accumulates per-frame samples for the selected planet and produces the
 * Phase-7 orbit-completion report once one full revolution has elapsed.
 */
export class OrbitTracker {
  private startDays: number | null = null;
  private startMeanAnomaly = 0;
  private accumulatedAngle = 0;
  private previousMeanAnomaly = 0;
  private minRadius = Number.POSITIVE_INFINITY;
  private maxRadius = 0;
  private minSpeed = Number.POSITIVE_INFINITY;
  private maxSpeed = 0;
  private minEnergy = Number.POSITIVE_INFINITY;
  private maxEnergy = Number.NEGATIVE_INFINITY;
  private minH = Number.POSITIVE_INFINITY;
  private maxH = 0;
  private iterationSum = 0;
  private maxResidual = 0;
  private samples = 0;

  constructor(
    private readonly planetId: string,
    private readonly expectedPeriodDays: number
  ) {}

  reset(): void {
    this.startDays = null;
    this.accumulatedAngle = 0;
    this.minRadius = Number.POSITIVE_INFINITY;
    this.maxRadius = 0;
    this.minSpeed = Number.POSITIVE_INFINITY;
    this.maxSpeed = 0;
    this.minEnergy = Number.POSITIVE_INFINITY;
    this.maxEnergy = Number.NEGATIVE_INFINITY;
    this.minH = Number.POSITIVE_INFINITY;
    this.maxH = 0;
    this.iterationSum = 0;
    this.maxResidual = 0;
    this.samples = 0;
  }

  /** Returns a completion report exactly once per completed revolution, else null. */
  addSample({ elapsedDays, state }: TrackerSample): OrbitCompletionReport | null {
    if (this.startDays === null) {
      this.startDays = elapsedDays;
      this.startMeanAnomaly = state.meanAnomalyRad;
      this.previousMeanAnomaly = state.meanAnomalyRad;
    }

    let deltaM = state.meanAnomalyRad - this.previousMeanAnomaly;
    if (deltaM > Math.PI) {
      deltaM -= TWO_PI;
    } else if (deltaM < -Math.PI) {
      deltaM += TWO_PI;
    }
    this.accumulatedAngle += deltaM;
    this.previousMeanAnomaly = state.meanAnomalyRad;

    this.minRadius = Math.min(this.minRadius, state.radiusM);
    this.maxRadius = Math.max(this.maxRadius, state.radiusM);
    this.minSpeed = Math.min(this.minSpeed, state.speedMS);
    this.maxSpeed = Math.max(this.maxSpeed, state.speedMS);
    const energy = specificOrbitalEnergy(state.speedMS, state.radiusM);
    this.minEnergy = Math.min(this.minEnergy, energy);
    this.maxEnergy = Math.max(this.maxEnergy, energy);
    const h = vectorMagnitude(angularMomentumVector(state.positionM, state.velocityMS));
    this.minH = Math.min(this.minH, h);
    this.maxH = Math.max(this.maxH, h);
    this.iterationSum += state.keplerIterations;
    this.maxResidual = Math.max(this.maxResidual, state.keplerResidual);
    this.samples += 1;

    if (Math.abs(this.accumulatedAngle) >= TWO_PI) {
      const simulatedPeriodDays = Math.abs(elapsedDays - this.startDays);
      const report: OrbitCompletionReport = {
        planetId: this.planetId,
        simulatedPeriodDays,
        expectedPeriodDays: this.expectedPeriodDays,
        timingErrorPercent:
          (Math.abs(simulatedPeriodDays - this.expectedPeriodDays) / this.expectedPeriodDays) * 100,
        energyConservationError:
          Math.abs(this.maxEnergy - this.minEnergy) / Math.abs((this.maxEnergy + this.minEnergy) / 2),
        angularMomentumConservationError:
          (this.maxH - this.minH) / ((this.maxH + this.minH) / 2),
        minDistanceM: this.minRadius,
        maxDistanceM: this.maxRadius,
        minSpeedMS: this.minSpeed,
        maxSpeedMS: this.maxSpeed,
        sampleCount: this.samples,
        averageKeplerIterations: this.samples > 0 ? this.iterationSum / this.samples : 0,
        maxKeplerResidual: this.maxResidual
      };
      this.reset();
      return report;
    }
    return null;
  }
}

/** Serializes a completion report for the JSON export button. */
export function completionReportToJson(report: OrbitCompletionReport): string {
  return JSON.stringify(report, null, 2);
}

/** Serializes a completion report for the CSV export button. */
export function completionReportToCsv(report: OrbitCompletionReport): string {
  const entries = Object.entries(report);
  const header = entries.map(([key]) => key).join(",");
  const row = entries.map(([, value]) => String(value)).join(",");
  return `${header}\n${row}`;
}
