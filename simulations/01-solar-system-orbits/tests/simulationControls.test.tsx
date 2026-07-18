// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { DAY_SECONDS } from "../src/data/constants";
import { getPlanetById } from "../src/data/planetaryData";
import { meanAnomalyAt, toOrbitalElementsSI } from "../src/physics/orbitalElements";
import {
  SimulationClock,
  clampSpeed,
  MAX_SPEED_DAYS_PER_SECOND
} from "../src/simulation/simulationClock";
import { simulationClock } from "../src/simulation/simulationClock";
import { useSimulationStore } from "../src/simulation/simulationStore";
import { SimulationControls } from "../src/components/SimulationControls";

function selectedMeanAnomaly(): number {
  const planet = getPlanetById(useSimulationStore.getState().selectedPlanetId);
  const elements = toOrbitalElementsSI(planet);
  return meanAnomalyAt(
    elements.meanAnomalyAtEpochRad,
    elements.orbitalPeriodS,
    simulationClock.elapsedDays * DAY_SECONDS
  );
}

beforeEach(() => {
  cleanup();
  simulationClock.reset();
  useSimulationStore.getState().reset();
  useSimulationStore.setState({ selectedPlanetId: "earth", isPlaying: true });
});

describe("simulation clock", () => {
  it("advances simulated time while playing", () => {
    const clock = new SimulationClock();
    clock.advance(0.016, 30, 1);
    expect(clock.elapsedDays).toBeCloseTo(0.48, 6);
  });

  it("decreases simulated time in reverse mode", () => {
    const clock = new SimulationClock();
    clock.setElapsedDays(100);
    clock.advance(0.016, 30, -1);
    expect(clock.elapsedDays).toBeLessThan(100);
  });

  it("clamps runaway frame deltas", () => {
    const clock = new SimulationClock();
    clock.advance(45, 365, 1); // e.g. returning from a background tab
    expect(clock.elapsedDays).toBeLessThanOrEqual(365 * 0.1 + 1e-9);
  });

  it("bounds custom speeds", () => {
    expect(clampSpeed(1e9)).toBe(MAX_SPEED_DAYS_PER_SECOND);
    expect(clampSpeed(-5)).toBe(1);
    expect(clampSpeed(Number.NaN)).toBe(1);
  });
});

describe("simulation store actions", () => {
  it("pause stops the playing flag so the frame loop stops advancing", () => {
    useSimulationStore.getState().pause();
    expect(useSimulationStore.getState().isPlaying).toBe(false);
    // The frame loop gates on isPlaying, so paused time never advances.
  });

  it("reset restores initial conditions", () => {
    simulationClock.setElapsedDays(500);
    useSimulationStore.getState().reset();
    expect(simulationClock.elapsedDays).toBe(0);
    expect(useSimulationStore.getState().displayDays).toBe(0);
    expect(useSimulationStore.getState().phase).toBe("initial-conditions");
  });

  it("jump-to-perihelion moves the mean anomaly to zero", () => {
    simulationClock.setElapsedDays(123.4);
    useSimulationStore.getState().jumpToPerihelion();
    const anomaly = selectedMeanAnomaly();
    const wrapped = Math.min(anomaly, 2 * Math.PI - anomaly);
    expect(wrapped).toBeLessThan(1e-6);
  });

  it("jump-to-aphelion moves the mean anomaly to π", () => {
    useSimulationStore.getState().jumpToAphelion();
    expect(selectedMeanAnomaly()).toBeCloseTo(Math.PI, 6);
  });

  it("planet selection does not reset simulation time", () => {
    simulationClock.setElapsedDays(250);
    useSimulationStore.getState().selectPlanet("mars");
    expect(simulationClock.elapsedDays).toBe(250);
    expect(useSimulationStore.getState().selectedPlanetId).toBe("mars");
  });

  it("rejects unknown planet ids", () => {
    expect(() => useSimulationStore.getState().selectPlanet("pluto")).toThrow();
  });

  it("steps forward and backward by a fraction of the selected orbit", () => {
    const period = getPlanetById("earth").orbitalPeriodDays;
    useSimulationStore.getState().stepForward();
    expect(simulationClock.elapsedDays).toBeCloseTo(period / 360, 9);
    useSimulationStore.getState().stepBackward();
    expect(simulationClock.elapsedDays).toBeCloseTo(0, 9);
  });

  it("sanitizes invalid scaling input", () => {
    useSimulationStore.getState().setScaling({ distanceScale: -3 });
    expect(useSimulationStore.getState().scaling.distanceScale).toBeGreaterThan(0);
  });
});

describe("SimulationControls component", () => {
  it("renders the time controls and toggles play state", () => {
    render(<SimulationControls />);
    const pauseButton = screen.getByRole("button", { name: /pause simulation/i });
    fireEvent.click(pauseButton);
    expect(useSimulationStore.getState().isPlaying).toBe(false);
    expect(screen.getByRole("button", { name: /play simulation/i })).toBeDefined();
  });

  it("selects a planet from the planet list", () => {
    render(<SimulationControls />);
    fireEvent.click(screen.getByRole("button", { name: /♃ Jupiter/ }));
    expect(useSimulationStore.getState().selectedPlanetId).toBe("jupiter");
  });

  it("applies a preset experiment", () => {
    render(<SimulationControls />);
    fireEvent.click(screen.getByRole("button", { name: /Mercury's eccentric orbit/i }));
    const state = useSimulationStore.getState();
    expect(state.activeExperiment).toBe("mercury-eccentric");
    expect(state.selectedPlanetId).toBe("mercury");
    expect(state.hiddenPlanetIds).not.toContain("mercury");
    expect(state.hiddenPlanetIds).toContain("earth");
  });

  it("keeps reverse control reachable by keyboard", () => {
    render(<SimulationControls />);
    const reverse = screen.getByRole("button", { name: "Reverse" });
    reverse.focus();
    expect(document.activeElement).toBe(reverse);
    fireEvent.click(reverse);
    expect(useSimulationStore.getState().timeDirection).toBe(-1);
  });
});
