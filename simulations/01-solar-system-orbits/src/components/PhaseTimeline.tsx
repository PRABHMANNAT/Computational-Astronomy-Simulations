"use client";

import { PHASES, getPhaseInfo } from "../simulation/simulationPhases";
import { useSimulationStore } from "../simulation/simulationStore";
import {
  completionReportToCsv,
  completionReportToJson
} from "../simulation/simulationPhases";
import { formatAdaptive, formatFixed } from "../utils/formatting";
import { metresToAu, msToKms } from "../utils/units";

function download(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

/** Phase timeline strip plus the Phase-7 orbit-completion report. */
export function PhaseTimeline() {
  const phase = useSimulationStore((state) => state.phase);
  const report = useSimulationStore((state) => state.completionReport);
  const info = getPhaseInfo(phase);

  return (
    <section className="panel-section" aria-label="Simulation phases">
      <strong>Orbit phases</strong>
      <ol className="phase-strip">
        {PHASES.map((entry, index) => (
          <li
            key={entry.id}
            className={entry.id === phase ? "phase-chip active" : "phase-chip"}
            aria-current={entry.id === phase}
          >
            {index + 1}
          </li>
        ))}
      </ol>
      <p className="phase-title">{info.title}</p>
      <p className="disclosure">{info.summary}</p>

      {report ? (
        <div className="completion-report" role="status">
          <strong>Orbit completed — {report.planetId}</strong>
          <div className="info-grid">
            <span>Simulated period</span>
            <span>{formatFixed(report.simulatedPeriodDays, 2)} d</span>
            <span>Expected period</span>
            <span>{formatFixed(report.expectedPeriodDays, 2)} d</span>
            <span>Timing error</span>
            <span>{formatFixed(report.timingErrorPercent, 4)}%</span>
            <span>Energy drift</span>
            <span>{formatAdaptive(report.energyConservationError)}</span>
            <span>Ang. momentum drift</span>
            <span>{formatAdaptive(report.angularMomentumConservationError)}</span>
            <span>Min distance</span>
            <span>{formatFixed(metresToAu(report.minDistanceM), 4)} AU</span>
            <span>Max distance</span>
            <span>{formatFixed(metresToAu(report.maxDistanceM), 4)} AU</span>
            <span>Min speed</span>
            <span>{formatFixed(msToKms(report.minSpeedMS), 3)} km/s</span>
            <span>Max speed</span>
            <span>{formatFixed(msToKms(report.maxSpeedMS), 3)} km/s</span>
            <span>Samples</span>
            <span>{report.sampleCount}</span>
            <span>Avg Kepler iterations</span>
            <span>{formatFixed(report.averageKeplerIterations, 2)}</span>
            <span>Max residual</span>
            <span>{formatAdaptive(report.maxKeplerResidual)}</span>
          </div>
          <div className="button-row">
            <button
              className="control-button"
              type="button"
              onClick={() =>
                download(
                  `orbit-report-${report.planetId}.json`,
                  completionReportToJson(report),
                  "application/json"
                )
              }
            >
              Export JSON
            </button>
            <button
              className="control-button"
              type="button"
              onClick={() =>
                download(
                  `orbit-report-${report.planetId}.csv`,
                  completionReportToCsv(report),
                  "text/csv"
                )
              }
            >
              Export CSV
            </button>
          </div>
        </div>
      ) : (
        <p className="disclosure">
          Complete one full orbit of the selected planet to generate the accuracy report.
        </p>
      )}
    </section>
  );
}
