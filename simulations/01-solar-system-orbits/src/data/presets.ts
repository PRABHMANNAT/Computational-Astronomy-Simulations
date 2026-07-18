import type {
  DistanceScaleMode,
  ExperimentId,
  VisualizationToggles
} from "../types/simulation";

export interface ExperimentPreset {
  id: ExperimentId;
  title: string;
  description: string;
  /** "all" keeps every planet visible; otherwise only the listed ids render. */
  visiblePlanetIds: string[] | "all";
  selectedPlanetId?: string;
  speedDaysPerSecond?: number;
  scalingMode?: DistanceScaleMode;
  toggles?: Partial<VisualizationToggles>;
  slowMotionEnabled?: boolean;
  /** Analysis tab the experiment opens so the relevant graphs are in view. */
  focusTab?: string;
}

export const EXPERIMENTS: ExperimentPreset[] = [
  {
    id: "mercury-eccentric",
    title: "A · Mercury's eccentric orbit",
    description:
      "Mercury alone with perihelion/aphelion markers, velocity and force graphs, and slow motion around perihelion.",
    visiblePlanetIds: ["mercury"],
    selectedPlanetId: "mercury",
    speedDaysPerSecond: 7,
    scalingMode: "linear",
    slowMotionEnabled: true,
    toggles: { perihelionMarker: true, aphelionMarker: true, orbitalFoci: true, velocityVector: true },
    focusTab: "position"
  },
  {
    id: "earth-circular",
    title: "B · Earth's nearly circular orbit",
    description:
      "Earth alone: compare the approximate circular-orbit speed √(μ/r) with the exact vis-viva speed over one year.",
    visiblePlanetIds: ["earth"],
    selectedPlanetId: "earth",
    speedDaysPerSecond: 7,
    scalingMode: "linear",
    toggles: { perihelionMarker: true, aphelionMarker: true },
    focusTab: "position"
  },
  {
    id: "inner-vs-outer",
    title: "C · Inner versus outer planets",
    description:
      "Mercury, Earth, Jupiter and Neptune with distance compression enabled to compare orbital periods directly.",
    visiblePlanetIds: ["mercury", "earth", "jupiter", "neptune"],
    selectedPlanetId: "earth",
    speedDaysPerSecond: 30,
    scalingMode: "compressed",
    focusTab: "comparison"
  },
  {
    id: "kepler-second-law",
    title: "D · Kepler's second law",
    description:
      "Equal-time area sectors on the selected orbit: equal areas swept in equal intervals, faster motion near perihelion.",
    visiblePlanetIds: ["mercury"],
    selectedPlanetId: "mercury",
    speedDaysPerSecond: 7,
    scalingMode: "linear",
    toggles: { equalAreaSectors: true, perihelionMarker: true, aphelionMarker: true },
    focusTab: "kepler"
  },
  {
    id: "kepler-third-law",
    title: "E · Kepler's third law",
    description: "All planets with the T² versus a³ comparison graph and proportional regression.",
    visiblePlanetIds: "all",
    speedDaysPerSecond: 365,
    scalingMode: "compressed",
    focusTab: "kepler"
  },
  {
    id: "energy-exchange",
    title: "F · Energy exchange",
    description:
      "An eccentric orbit trading kinetic and potential energy while total energy stays constant.",
    visiblePlanetIds: ["mercury"],
    selectedPlanetId: "mercury",
    speedDaysPerSecond: 7,
    scalingMode: "linear",
    focusTab: "energy"
  }
];

export function getExperiment(id: ExperimentId): ExperimentPreset {
  const experiment = EXPERIMENTS.find((entry) => entry.id === id);
  if (!experiment) {
    throw new Error(`Unknown experiment id: ${id}`);
  }
  return experiment;
}
