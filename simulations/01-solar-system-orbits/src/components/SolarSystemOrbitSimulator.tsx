"use client";

import { useSimulationClock } from "../hooks/useSimulationClock";
import { getPhaseInfo } from "../simulation/simulationPhases";
import { useSimulationStore, type AnalysisTabId } from "../simulation/simulationStore";
import { formatSimulatedTime } from "../utils/formatting";
import { ComparisonPanel } from "./ComparisonPanel";
import { MathematicalAnalysisPanel } from "./MathematicalAnalysisPanel";
import { MeasurementsPanel } from "./MeasurementsPanel";
import { OrbitalGraphPanel } from "./OrbitalGraphPanel";
import { PhaseTimeline } from "./PhaseTimeline";
import { PhysicsAnalysisPanel } from "./PhysicsAnalysisPanel";
import { PlanetInformationPanel } from "./PlanetInformationPanel";
import { ScientificLimitations } from "./ScientificLimitations";
import { SimulationControls } from "./SimulationControls";
import { SimulationErrorBoundary } from "./SimulationErrorBoundary";
import { SolarSystemScene } from "./SolarSystemScene";

const TABS: Array<{ id: AnalysisTabId; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "elements", label: "Orbital Elements" },
  { id: "position", label: "Position & Motion" },
  { id: "forces", label: "Forces & Acceleration" },
  { id: "energy", label: "Energy" },
  { id: "momentum", label: "Angular Momentum" },
  { id: "kepler", label: "Kepler's Laws" },
  { id: "comparison", label: "Comparison" },
  { id: "accuracy", label: "Numerical Accuracy" },
  { id: "limitations", label: "Limitations" }
];

function AnalysisTabContent({ tab }: { tab: AnalysisTabId }) {
  switch (tab) {
    case "overview":
      return (
        <>
          <PlanetInformationPanel />
          <OrbitalGraphPanel />
        </>
      );
    case "elements":
      return <MathematicalAnalysisPanel section="elements" />;
    case "position":
      return <MeasurementsPanel />;
    case "forces":
      return <PhysicsAnalysisPanel section="forces" />;
    case "energy":
      return (
        <>
          <PhysicsAnalysisPanel section="energy" />
          <OrbitalGraphPanel />
        </>
      );
    case "momentum":
      return <PhysicsAnalysisPanel section="momentum" />;
    case "kepler":
      return <MathematicalAnalysisPanel section="kepler" />;
    case "comparison":
      return <ComparisonPanel />;
    case "accuracy":
      return <MathematicalAnalysisPanel section="accuracy" />;
    case "limitations":
      return <ScientificLimitations />;
  }
}

/**
 * The complete Solar System Orbit Simulator: 3D laboratory, controls,
 * measurements, phase timeline and the tabbed analysis dashboard.
 */
export function SolarSystemOrbitSimulator() {
  const elapsedDays = useSimulationClock();
  const phase = useSimulationStore((state) => state.phase);
  const isPlaying = useSimulationStore((state) => state.isPlaying);
  const togglePlay = useSimulationStore((state) => state.togglePlay);
  const activeTab = useSimulationStore((state) => state.activeTab);
  const setActiveTab = useSimulationStore((state) => state.setActiveTab);

  return (
    <SimulationErrorBoundary label="the simulator">
      <div className="orbit-lab">
        <div className="lab-status-bar" role="status">
          <span>
            Simulated time: <strong>{formatSimulatedTime(elapsedDays)}</strong>
          </span>
          <span className="phase-inline">{getPhaseInfo(phase).title}</span>
          <button className="control-button" type="button" onClick={togglePlay}>
            {isPlaying ? "Pause" : "Play"}
          </button>
          <span className="disclosure">
            Planet sizes enlarged & distances scaled for visibility — educational two-body model,
            not an ephemeris.
          </span>
        </div>

        <div className="lab-main">
          <SimulationErrorBoundary label="the control panel">
            <SimulationControls />
          </SimulationErrorBoundary>

          <div className="canvas-stage" aria-label="Interactive 3D solar system">
            <SimulationErrorBoundary
              label="the 3D view"
              fallback={
                <div className="webgl-fallback" role="alert">
                  <strong>The 3D view failed to render.</strong>
                  <p>The analysis panels below continue to work.</p>
                </div>
              }
            >
              <SolarSystemScene />
            </SimulationErrorBoundary>
          </div>

          <div className="lab-right">
            <SimulationErrorBoundary label="the measurements panel">
              <MeasurementsPanel />
            </SimulationErrorBoundary>
            <SimulationErrorBoundary label="the phase timeline">
              <PhaseTimeline />
            </SimulationErrorBoundary>
          </div>
        </div>

        <div className="lab-bottom">
          <div className="tab-strip" role="tablist" aria-label="Analysis dashboard">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={tab.id === activeTab}
                className={tab.id === activeTab ? "tab-button active" : "tab-button"}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="tab-content" role="tabpanel">
            <SimulationErrorBoundary label="the analysis dashboard">
              <AnalysisTabContent tab={activeTab} />
            </SimulationErrorBoundary>
          </div>
        </div>
      </div>
    </SimulationErrorBoundary>
  );
}
