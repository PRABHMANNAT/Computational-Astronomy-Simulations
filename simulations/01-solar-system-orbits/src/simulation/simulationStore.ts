import { create } from "zustand";
import { DAY_SECONDS, TWO_PI } from "../data/constants";
import { getPlanetById } from "../data/planetaryData";
import { getExperiment } from "../data/presets";
import { meanAnomalyAt, toOrbitalElementsSI } from "../physics/orbitalElements";
import { sanitizeScale } from "../physics/scaling";
import type {
  CameraViewId,
  ExperimentId,
  OrbitCompletionReport,
  ScalingSettings,
  SimulationPhaseId,
  UnitPreferences,
  VisualizationToggles
} from "../types/simulation";
import { clamp } from "../utils/numericalMethods";
import { clampSpeed, simulationClock } from "./simulationClock";

export type AnalysisTabId =
  | "overview"
  | "elements"
  | "position"
  | "forces"
  | "energy"
  | "momentum"
  | "kepler"
  | "comparison"
  | "accuracy"
  | "limitations";

const DEFAULT_TOGGLES: VisualizationToggles = {
  orbitPaths: true,
  planetLabels: true,
  planetTrails: false,
  grid: false,
  referenceAxes: false,
  orbitalPlane: false,
  forceVector: false,
  velocityVector: false,
  accelerationVector: false,
  angularMomentumVector: false,
  perihelionMarker: false,
  aphelionMarker: false,
  orbitalFoci: false,
  semiMajorAxis: false,
  equalAreaSectors: false,
  habitableZone: false,
  planetRotation: true,
  backgroundStars: true
};

const DEFAULT_SCALING: ScalingSettings = {
  mode: "compressed",
  distanceScale: 1,
  planetRadiusScale: 1,
  sunRadiusScale: 1,
  vectorScale: 1,
  trailLength: 200
};

const DEFAULT_UNITS: UnitPreferences = {
  distance: "au",
  time: "days",
  speed: "km/s",
  angle: "deg"
};

export interface SimulationStoreState {
  /** Throttled mirror of the authoritative clock, for UI panels only. */
  displayDays: number;
  isPlaying: boolean;
  timeDirection: 1 | -1;
  speedDaysPerSecond: number;
  slowMotionEnabled: boolean;
  selectedPlanetId: string;
  comparisonPlanetId: string;
  hiddenPlanetIds: string[];
  isolateSelectedOrbit: boolean;
  followSelectedPlanet: boolean;
  cameraView: CameraViewId;
  /** Incremented to ask the camera rig to re-focus on the selected planet. */
  cameraFocusRequest: number;
  toggles: VisualizationToggles;
  scaling: ScalingSettings;
  units: UnitPreferences;
  activeExperiment: ExperimentId | null;
  activeTab: AnalysisTabId;
  sectorCount: number;
  maxGraphSamples: number;
  phase: SimulationPhaseId;
  completionReport: OrbitCompletionReport | null;
  raceStartDays: number | null;

  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  reset: () => void;
  setSpeed: (daysPerSecond: number) => void;
  setTimeDirection: (direction: 1 | -1) => void;
  toggleReverse: () => void;
  setSlowMotionEnabled: (enabled: boolean) => void;
  stepForward: () => void;
  stepBackward: () => void;
  jumpToPerihelion: () => void;
  jumpToAphelion: () => void;
  jumpOnePeriod: () => void;
  jumpToRandomPosition: () => void;
  selectPlanet: (planetId: string) => void;
  setComparisonPlanet: (planetId: string) => void;
  togglePlanetHidden: (planetId: string) => void;
  resetPlanetVisibility: () => void;
  setIsolateSelectedOrbit: (isolate: boolean) => void;
  setFollowSelectedPlanet: (follow: boolean) => void;
  setCameraView: (view: CameraViewId) => void;
  focusCameraOnSelected: () => void;
  setToggle: (key: keyof VisualizationToggles, value: boolean) => void;
  setScaling: (partial: Partial<ScalingSettings>) => void;
  setUnits: (partial: Partial<UnitPreferences>) => void;
  applyExperiment: (id: ExperimentId) => void;
  clearExperiment: () => void;
  setActiveTab: (tab: AnalysisTabId) => void;
  setSectorCount: (count: number) => void;
  setMaxGraphSamples: (count: number) => void;
  setPhase: (phase: SimulationPhaseId) => void;
  setCompletionReport: (report: OrbitCompletionReport | null) => void;
  startRace: () => void;
  stopRace: () => void;
  /** Internal: called by the clock hook at a throttled cadence. */
  syncDisplayDays: (days: number) => void;
}

/** Days until the selected planet next reaches the given target mean anomaly. */
function daysToMeanAnomaly(planetId: string, targetRad: number): number {
  const planet = getPlanetById(planetId);
  const elements = toOrbitalElementsSI(planet);
  const currentM = meanAnomalyAt(
    elements.meanAnomalyAtEpochRad,
    elements.orbitalPeriodS,
    simulationClock.elapsedDays * DAY_SECONDS
  );
  const deltaM = (((targetRad - currentM) % TWO_PI) + TWO_PI) % TWO_PI;
  return (deltaM / TWO_PI) * planet.orbitalPeriodDays;
}

function jumpBy(days: number, set: (partial: Partial<SimulationStoreState>) => void): void {
  simulationClock.setElapsedDays(simulationClock.elapsedDays + days);
  set({ displayDays: simulationClock.elapsedDays, completionReport: null });
}

export const useSimulationStore = create<SimulationStoreState>((set, get) => ({
  displayDays: 0,
  isPlaying: true,
  timeDirection: 1,
  speedDaysPerSecond: 7,
  slowMotionEnabled: false,
  selectedPlanetId: "earth",
  comparisonPlanetId: "mars",
  hiddenPlanetIds: [],
  isolateSelectedOrbit: false,
  followSelectedPlanet: false,
  cameraView: "default",
  cameraFocusRequest: 0,
  toggles: DEFAULT_TOGGLES,
  scaling: DEFAULT_SCALING,
  units: DEFAULT_UNITS,
  activeExperiment: null,
  activeTab: "overview",
  sectorCount: 8,
  maxGraphSamples: 600,
  phase: "initial-conditions",
  completionReport: null,
  raceStartDays: null,

  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  reset: () => {
    simulationClock.reset();
    set({
      displayDays: 0,
      isPlaying: false,
      timeDirection: 1,
      phase: "initial-conditions",
      completionReport: null,
      raceStartDays: null
    });
  },
  setSpeed: (daysPerSecond) => set({ speedDaysPerSecond: clampSpeed(daysPerSecond) }),
  setTimeDirection: (direction) => set({ timeDirection: direction }),
  toggleReverse: () => set((state) => ({ timeDirection: state.timeDirection === 1 ? -1 : 1 })),
  setSlowMotionEnabled: (enabled) => set({ slowMotionEnabled: enabled }),
  stepForward: () => {
    const planet = getPlanetById(get().selectedPlanetId);
    jumpBy(planet.orbitalPeriodDays / 360, set);
  },
  stepBackward: () => {
    const planet = getPlanetById(get().selectedPlanetId);
    jumpBy(-planet.orbitalPeriodDays / 360, set);
  },
  jumpToPerihelion: () => {
    jumpBy(daysToMeanAnomaly(get().selectedPlanetId, 0), set);
  },
  jumpToAphelion: () => {
    jumpBy(daysToMeanAnomaly(get().selectedPlanetId, Math.PI), set);
  },
  jumpOnePeriod: () => {
    jumpBy(getPlanetById(get().selectedPlanetId).orbitalPeriodDays, set);
  },
  jumpToRandomPosition: () => {
    jumpBy(Math.random() * getPlanetById(get().selectedPlanetId).orbitalPeriodDays, set);
  },
  selectPlanet: (planetId) => {
    getPlanetById(planetId); // validates the id
    set({ selectedPlanetId: planetId, completionReport: null });
  },
  setComparisonPlanet: (planetId) => {
    getPlanetById(planetId);
    set({ comparisonPlanetId: planetId });
  },
  togglePlanetHidden: (planetId) =>
    set((state) => ({
      hiddenPlanetIds: state.hiddenPlanetIds.includes(planetId)
        ? state.hiddenPlanetIds.filter((id) => id !== planetId)
        : [...state.hiddenPlanetIds, planetId]
    })),
  resetPlanetVisibility: () => set({ hiddenPlanetIds: [], isolateSelectedOrbit: false }),
  setIsolateSelectedOrbit: (isolate) => set({ isolateSelectedOrbit: isolate }),
  setFollowSelectedPlanet: (follow) => set({ followSelectedPlanet: follow }),
  setCameraView: (view) => set({ cameraView: view }),
  focusCameraOnSelected: () =>
    set((state) => ({ cameraFocusRequest: state.cameraFocusRequest + 1 })),
  setToggle: (key, value) =>
    set((state) => ({ toggles: { ...state.toggles, [key]: value } })),
  setScaling: (partial) =>
    set((state) => {
      const next = { ...state.scaling, ...partial };
      return {
        scaling: {
          ...next,
          distanceScale: sanitizeScale(next.distanceScale, 0.05, 5),
          planetRadiusScale: sanitizeScale(next.planetRadiusScale),
          sunRadiusScale: sanitizeScale(next.sunRadiusScale),
          vectorScale: sanitizeScale(next.vectorScale),
          trailLength: clamp(Math.round(next.trailLength) || 200, 10, 2000)
        }
      };
    }),
  setUnits: (partial) => set((state) => ({ units: { ...state.units, ...partial } })),
  applyExperiment: (id) => {
    const experiment = getExperiment(id);
    const state = get();
    const allIds = ["mercury", "venus", "earth", "mars", "jupiter", "saturn", "uranus", "neptune"];
    const hidden =
      experiment.visiblePlanetIds === "all"
        ? []
        : allIds.filter((planetId) => !experiment.visiblePlanetIds.includes(planetId));
    set({
      activeExperiment: id,
      hiddenPlanetIds: hidden,
      selectedPlanetId: experiment.selectedPlanetId ?? state.selectedPlanetId,
      speedDaysPerSecond: experiment.speedDaysPerSecond ?? state.speedDaysPerSecond,
      slowMotionEnabled: experiment.slowMotionEnabled ?? state.slowMotionEnabled,
      scaling: experiment.scalingMode
        ? { ...state.scaling, mode: experiment.scalingMode }
        : state.scaling,
      toggles: { ...state.toggles, ...experiment.toggles },
      activeTab: (experiment.focusTab as AnalysisTabId) ?? state.activeTab,
      isPlaying: true,
      completionReport: null
    });
  },
  clearExperiment: () =>
    set({
      activeExperiment: null,
      hiddenPlanetIds: [],
      toggles: DEFAULT_TOGGLES,
      scaling: DEFAULT_SCALING,
      slowMotionEnabled: false
    }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSectorCount: (count) => set({ sectorCount: clamp(Math.round(count) || 8, 4, 12) }),
  setMaxGraphSamples: (count) => set({ maxGraphSamples: clamp(Math.round(count) || 600, 100, 5000) }),
  setPhase: (phase) => set({ phase }),
  setCompletionReport: (report) => set({ completionReport: report }),
  startRace: () => {
    const planet = getPlanetById(get().selectedPlanetId);
    const days = daysToMeanAnomaly(get().selectedPlanetId, 0);
    void planet;
    jumpBy(days, set);
    set({ raceStartDays: simulationClock.elapsedDays, isPlaying: true });
  },
  stopRace: () => set({ raceStartDays: null }),
  syncDisplayDays: (days) => set({ displayDays: days })
}));
