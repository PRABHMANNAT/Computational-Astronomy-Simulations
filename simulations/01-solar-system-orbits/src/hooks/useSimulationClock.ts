"use client";

import { useEffect } from "react";
import { DAY_SECONDS } from "../data/constants";
import { getPlanetById } from "../data/planetaryData";
import { toOrbitalElementsSI } from "../physics/orbitalElements";
import { orbitalStateAt } from "../physics/orbitalPosition";
import { gravitationalForce } from "../physics/orbitalVelocity";
import {
  specificKineticEnergy,
  specificOrbitalEnergy,
  specificPotentialEnergy
} from "../physics/orbitalEnergy";
import { OrbitTracker, detectPhase } from "../simulation/simulationPhases";
import { simulationClock } from "../simulation/simulationClock";
import { useSimulationStore } from "../simulation/simulationStore";
import type { GraphSample } from "../types/simulation";
import { RingBuffer } from "../utils/numericalMethods";
import { metresToAu, msToKms, radToDeg } from "../utils/units";

/**
 * Bounded time-series storage for the graph panel. Kept outside React state so
 * per-frame writes never trigger renders; the graph panel polls it at ~2 Hz.
 */
class GraphHistory {
  private buffer = new RingBuffer<GraphSample>(600);
  version = 0;

  configure(capacity: number): void {
    if (capacity !== this.buffer.capacity) {
      const existing = this.buffer.toArray().slice(-capacity);
      this.buffer = new RingBuffer<GraphSample>(capacity);
      existing.forEach((sample) => this.buffer.push(sample));
    }
  }

  push(sample: GraphSample): void {
    this.buffer.push(sample);
    this.version += 1;
  }

  clear(): void {
    this.buffer.clear();
    this.version += 1;
  }

  get size(): number {
    return this.buffer.size;
  }

  toArray(): GraphSample[] {
    return this.buffer.toArray();
  }
}

export const graphHistory = new GraphHistory();

const UI_SYNC_INTERVAL_MS = 120;

/**
 * Root-level hook that mirrors the authoritative clock into UI state at a
 * throttled cadence and runs phase detection, orbit tracking and graph
 * sampling. Mount exactly once.
 */
export function useSimulationClock(): number {
  const selectedPlanetId = useSimulationStore((state) => state.selectedPlanetId);
  const maxGraphSamples = useSimulationStore((state) => state.maxGraphSamples);
  const displayDays = useSimulationStore((state) => state.displayDays);

  useEffect(() => {
    graphHistory.configure(maxGraphSamples);
  }, [maxGraphSamples]);

  useEffect(() => {
    graphHistory.clear();
    const planet = getPlanetById(selectedPlanetId);
    const elements = toOrbitalElementsSI(planet);
    const tracker = new OrbitTracker(planet.id, planet.orbitalPeriodDays);
    let lastUiSync = 0;
    let lastSampleDays = Number.NaN;

    const processTick = (elapsedDays: number) => {
      const now = performance.now();
      if (now - lastUiSync < UI_SYNC_INTERVAL_MS) {
        return;
      }
      lastUiSync = now;

      const store = useSimulationStore.getState();
      store.syncDisplayDays(elapsedDays);

      let state;
      try {
        state = orbitalStateAt(elements, elapsedDays * DAY_SECONDS);
      } catch {
        return; // non-finite clock values are rejected upstream; stay safe here
      }

      const phase = detectPhase(state, elements, elapsedDays);
      if (phase !== store.phase) {
        store.setPhase(phase);
      }

      const report = tracker.addSample({ elapsedDays, state });
      if (report) {
        store.setCompletionReport(report);
      }

      if (Number.isNaN(lastSampleDays) || Math.abs(elapsedDays - lastSampleDays) > 1e-9) {
        lastSampleDays = elapsedDays;
        graphHistory.push({
          timeDays: elapsedDays,
          radiusAU: metresToAu(state.radiusM),
          speedKMS: msToKms(state.speedMS),
          kineticJPerKg: specificKineticEnergy(state.speedMS),
          potentialJPerKg: specificPotentialEnergy(state.radiusM),
          totalJPerKg: specificOrbitalEnergy(state.speedMS, state.radiusM),
          forceN: gravitationalForce(planet.massKg, state.radiusM),
          trueAnomalyDeg: radToDeg(state.trueAnomalyRad)
        });
      }
    };

    processTick(simulationClock.elapsedDays);
    const unsubscribe = simulationClock.subscribe(processTick);
    return unsubscribe;
  }, [selectedPlanetId]);

  return displayDays;
}
