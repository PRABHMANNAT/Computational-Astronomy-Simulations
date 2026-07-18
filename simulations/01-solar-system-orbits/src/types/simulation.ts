export interface KeplerSolution {
  eccentricAnomalyRad: number;
  iterations: number;
  residual: number;
  converged: boolean;
}

export type SimulationPhaseId =
  | "initial-conditions"
  | "orbital-acceleration"
  | "approaching-perihelion"
  | "perihelion-passage"
  | "moving-toward-aphelion"
  | "aphelion-passage"
  | "orbit-completion";

export interface SimulationPhaseInfo {
  id: SimulationPhaseId;
  title: string;
  summary: string;
}

export type DistanceScaleMode = "linear" | "compressed" | "logarithmic" | "educational" | "real";

export type DistanceUnit = "km" | "m" | "au";
export type TimeUnit = "hours" | "days" | "years";
export type SpeedUnit = "m/s" | "km/s";
export type AngleUnit = "deg" | "rad";

export interface UnitPreferences {
  distance: DistanceUnit;
  time: TimeUnit;
  speed: SpeedUnit;
  angle: AngleUnit;
}

export interface VisualizationToggles {
  orbitPaths: boolean;
  planetLabels: boolean;
  planetTrails: boolean;
  grid: boolean;
  referenceAxes: boolean;
  orbitalPlane: boolean;
  forceVector: boolean;
  velocityVector: boolean;
  accelerationVector: boolean;
  angularMomentumVector: boolean;
  perihelionMarker: boolean;
  aphelionMarker: boolean;
  orbitalFoci: boolean;
  semiMajorAxis: boolean;
  equalAreaSectors: boolean;
  habitableZone: boolean;
  planetRotation: boolean;
  backgroundStars: boolean;
}

export interface ScalingSettings {
  mode: DistanceScaleMode;
  distanceScale: number;
  planetRadiusScale: number;
  sunRadiusScale: number;
  vectorScale: number;
  trailLength: number;
}

export type CameraViewId =
  | "default"
  | "top"
  | "side"
  | "ecliptic"
  | "selected-orbit";

export type AccuracyStatus = "excellent" | "acceptable" | "warning" | "invalid";

export interface AccuracyReading {
  label: string;
  relativeError: number;
  status: AccuracyStatus;
}

/** Summary generated when the selected planet completes one simulated orbit. */
export interface OrbitCompletionReport {
  planetId: string;
  simulatedPeriodDays: number;
  expectedPeriodDays: number;
  timingErrorPercent: number;
  energyConservationError: number;
  angularMomentumConservationError: number;
  minDistanceM: number;
  maxDistanceM: number;
  minSpeedMS: number;
  maxSpeedMS: number;
  sampleCount: number;
  averageKeplerIterations: number;
  maxKeplerResidual: number;
}

export type ExperimentId =
  | "mercury-eccentric"
  | "earth-circular"
  | "inner-vs-outer"
  | "kepler-second-law"
  | "kepler-third-law"
  | "energy-exchange";

export interface GraphSample {
  timeDays: number;
  radiusAU: number;
  speedKMS: number;
  kineticJPerKg: number;
  potentialJPerKg: number;
  totalJPerKg: number;
  forceN: number;
  trueAnomalyDeg: number;
}
