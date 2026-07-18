"use client";

import { useMemo } from "react";
import { DAY_SECONDS, TWO_PI } from "../data/constants";
import { PLANETS } from "../data/planetaryData";
import { useOrbitalMeasurements } from "../hooks/useOrbitalMeasurements";
import { useSelectedPlanet } from "../hooks/useSelectedPlanet";
import { specificAngularMomentum } from "../physics/angularMomentum";
import {
  keplerThirdLawRatio,
  orbitalPeriodFromSemiMajorAxis,
  toOrbitalElementsSI
} from "../physics/orbitalElements";
import { orbitalStateAt } from "../physics/orbitalPosition";
import { classifyAccuracy } from "../physics/validation";
import { graphHistory } from "../hooks/useSimulationClock";
import { useSimulationStore } from "../simulation/simulationStore";
import type { AccuracyStatus } from "../types/simulation";
import { formatAdaptive, formatFixed, formatPercent } from "../utils/formatting";
import { auToMetres, metresToAu, msToKms } from "../utils/units";
import { polygonArea } from "../utils/numericalMethods";

export type MathSection = "elements" | "kepler" | "accuracy";

const GLOSSARY: Array<[string, string]> = [
  ["a", "semi-major axis — half the longest diameter of the ellipse"],
  ["b", "semi-minor axis, b = a√(1 − e²)"],
  ["c", "focus distance from the ellipse centre, c = a·e"],
  ["e", "eccentricity — 0 is a circle, values toward 1 are elongated"],
  ["E", "eccentric anomaly — auxiliary angle in Kepler's equation"],
  ["M", "mean anomaly — angle growing uniformly in time, M = n(t − t₀) + M₀"],
  ["ν", "true anomaly — actual angle from perihelion as seen from the Sun"],
  ["r", "heliocentric distance from the Sun's centre to the planet"],
  ["T", "orbital period — time for one full revolution"],
  ["μ", "standard gravitational parameter, μ = G·M☉"],
  ["h", "specific angular momentum, h = √[μa(1 − e²)]"],
  ["ε", "specific orbital energy, ε = −μ/(2a)"],
  ["Ω", "longitude of ascending node — where the orbit crosses the ecliptic going north"],
  ["ω", "argument of perihelion — angle from the node to perihelion"],
  ["i", "inclination — tilt of the orbital plane against the ecliptic"]
];

function statusBadge(status: AccuracyStatus) {
  return <span className={`accuracy-badge ${status}`}>{status}</span>;
}

/** Orbital-element, Kepler-law and numerical-accuracy analysis. */
export function MathematicalAnalysisPanel({ section }: { section: MathSection }) {
  const m = useOrbitalMeasurements();
  const { planet, elements } = useSelectedPlanet();
  const sectorCount = useSimulationStore((state) => state.sectorCount);
  const setSectorCount = useSimulationStore((state) => state.setSectorCount);
  const speedDaysPerSecond = useSimulationStore((state) => state.speedDaysPerSecond);

  const secondLaw = useMemo(() => {
    const periodS = elements.orbitalPeriodS;
    const h = specificAngularMomentum(elements.semiMajorAxisM, elements.eccentricity);
    const exactAreaM2 = (h / 2) * (periodS / sectorCount);
    const epochOffsetS = ((TWO_PI - elements.meanAnomalyAtEpochRad) / TWO_PI) * periodS;
    const samplesPerSector = 96;
    const sectors: Array<{ areaM2: number; startSpeedKMS: number }> = [];
    for (let sector = 0; sector < sectorCount; sector += 1) {
      const points: Array<{ x: number; y: number }> = [{ x: 0, y: 0 }];
      let startSpeed = 0;
      for (let sample = 0; sample <= samplesPerSector; sample += 1) {
        const t = epochOffsetS + ((sector + sample / samplesPerSector) / sectorCount) * periodS;
        const state = orbitalStateAt(elements, t);
        if (sample === 0) {
          startSpeed = state.speedMS;
        }
        // Project onto the orbital plane using the perifocal radius/true anomaly.
        points.push({
          x: state.radiusM * Math.cos(state.trueAnomalyRad),
          y: state.radiusM * Math.sin(state.trueAnomalyRad)
        });
      }
      sectors.push({ areaM2: polygonArea(points), startSpeedKMS: msToKms(startSpeed) });
    }
    const areas = sectors.map((sector) => sector.areaM2);
    const maxDeviation =
      (Math.max(...areas) - Math.min(...areas)) / (areas.reduce((s, v) => s + v, 0) / areas.length);
    return { sectors, exactAreaM2, maxDeviation };
  }, [elements, sectorCount]);

  const thirdLaw = useMemo(() => {
    const rows = PLANETS.map((entry) => {
      const si = toOrbitalElementsSI(entry);
      const computedPeriodDays = orbitalPeriodFromSemiMajorAxis(si.semiMajorAxisM) / DAY_SECONDS;
      const ratioYr2Au3 =
        Math.pow(entry.orbitalPeriodDays / 365.25, 2) / Math.pow(entry.semiMajorAxisAU, 3);
      return {
        planet: entry,
        ratioYr2Au3,
        computedPeriodDays,
        differencePercent:
          (Math.abs(computedPeriodDays - entry.orbitalPeriodDays) / entry.orbitalPeriodDays) * 100
      };
    });
    const averageRatio = rows.reduce((sum, row) => sum + row.ratioYr2Au3, 0) / rows.length;
    return { rows, averageRatio };
  }, []);

  if (section === "elements") {
    return (
      <div className="analysis-panel">
        <section className="panel-section">
          <strong>Orbital elements — {planet.name} (approximate mean values, fixed epoch)</strong>
          <div className="info-grid">
            <span>Semi-major axis a</span>
            <span>{formatFixed(planet.semiMajorAxisAU, 4)} AU</span>
            <span>Eccentricity e</span>
            <span>{formatFixed(planet.eccentricity, 4)}</span>
            <span>Inclination i</span>
            <span>{formatFixed(planet.inclinationDeg, 3)}°</span>
            <span>Longitude of node Ω</span>
            <span>{formatFixed(planet.longitudeAscendingNodeDeg, 3)}°</span>
            <span>Argument of perihelion ω</span>
            <span>{formatFixed(planet.argumentOfPerihelionDeg, 3)}°</span>
            <span>Mean anomaly at epoch M₀</span>
            <span>{formatFixed(planet.meanAnomalyAtEpochDeg, 3)}°</span>
            <span>Orbital period T</span>
            <span>{formatFixed(planet.orbitalPeriodDays, 3)} d</span>
            <span>Semi-minor axis b</span>
            <span>{formatFixed(metresToAu(m.semiMinorAxisM), 4)} AU</span>
            <span>Focus distance c = a·e</span>
            <span>{formatFixed(metresToAu(m.focusDistanceM), 4)} AU</span>
            <span>Perihelion a(1−e)</span>
            <span>{formatFixed(metresToAu(m.perihelionM), 4)} AU</span>
            <span>Aphelion a(1+e)</span>
            <span>{formatFixed(metresToAu(m.aphelionM), 4)} AU</span>
          </div>
          <p className="disclosure">
            The solver chain each frame: M = M₀ + n(t − t₀) → Kepler's equation M = E − e·sin E
            (Newton–Raphson) → ν = 2·atan2(√(1+e)·sin(E/2), √(1−e)·cos(E/2)) → r = a(1 − e·cos E) →
            rotation by ω, i, Ω into heliocentric coordinates. Current solve: E ={" "}
            {formatFixed(m.state.eccentricAnomalyRad, 6)} rad in {m.state.keplerIterations}{" "}
            iterations, residual {formatAdaptive(m.state.keplerResidual)}.
          </p>
        </section>
      </div>
    );
  }

  if (section === "kepler") {
    return (
      <div className="analysis-panel">
        <section className="panel-section">
          <strong>First law — elliptical orbits with the Sun at one focus</strong>
          <p className="disclosure">
            Each planet traces an ellipse, not a circle, and the Sun occupies one focus — not the
            geometric centre. For {planet.name}: b = {formatFixed(metresToAu(m.semiMinorAxisM), 4)}{" "}
            AU and the Sun sits c = {formatFixed(metresToAu(m.focusDistanceM), 4)} AU away from the
            ellipse centre. Enable "Orbital foci" and "Semi-major axis" in the controls to mark the
            two foci (the second one is empty) and the apse line on the 3D view.
          </p>
        </section>

        <section className="panel-section">
          <strong>Second law — equal areas in equal times (dA/dt = h/2)</strong>
          <div className="range-field">
            <label>
              <span>Sectors (equal time intervals)</span>
              <span>{sectorCount}</span>
            </label>
            <input
              type="range"
              min={4}
              max={12}
              step={1}
              value={sectorCount}
              onChange={(event) => setSectorCount(Number(event.currentTarget.value))}
              aria-label="Number of equal-time sectors"
            />
          </div>
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Sector</th>
                  <th>Numeric area (m²)</th>
                  <th>vs exact h/2·Δt</th>
                  <th>Speed at start (km/s)</th>
                </tr>
              </thead>
              <tbody>
                {secondLaw.sectors.map((sector, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{formatAdaptive(sector.areaM2)}</td>
                    <td>
                      {formatPercent(
                        Math.abs(sector.areaM2 - secondLaw.exactAreaM2) / secondLaw.exactAreaM2,
                        4
                      )}
                    </td>
                    <td>{formatFixed(sector.startSpeedKMS, 3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="disclosure">
            Every sector spans the same time interval T/{sectorCount}, yet near perihelion the arc
            is long and fast while near aphelion it is short and slow — the swept areas stay equal
            (max sector-to-sector deviation {formatPercent(secondLaw.maxDeviation, 4)}, from
            numerical sampling). Enable "Equal-area sectors" to draw them on the orbit.
          </p>
        </section>

        <section className="panel-section">
          <strong>Third law — T² = 4π²·a³/μ</strong>
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Planet</th>
                  <th>T²/a³ (yr²/AU³)</th>
                  <th>Dataset T (d)</th>
                  <th>Computed T (d)</th>
                  <th>Difference</th>
                </tr>
              </thead>
              <tbody>
                {thirdLaw.rows.map((row) => (
                  <tr key={row.planet.id}>
                    <td>{row.planet.name}</td>
                    <td>{formatFixed(row.ratioYr2Au3, 5)}</td>
                    <td>{formatFixed(row.planet.orbitalPeriodDays, 2)}</td>
                    <td>{formatFixed(row.computedPeriodDays, 2)}</td>
                    <td>{formatFixed(row.differencePercent, 4)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="disclosure">
            System-wide average T²/a³ = {formatFixed(thirdLaw.averageRatio, 5)} yr²/AU³ (exactly 1
            for an idealized Earth two-body orbit). The SI constant is 4π²/μ ={" "}
            {formatAdaptive(keplerThirdLawRatio(orbitalPeriodFromSemiMajorAxis(auToMetres(1)), auToMetres(1)))}{" "}
            s²/m³ for every planet — see the T² vs a³ graph for the straight-line comparison.
          </p>
        </section>

        <section className="panel-section">
          <strong>Formula glossary</strong>
          <div className="info-grid">
            {GLOSSARY.map(([symbol, meaning]) => (
              <GlossaryRow key={symbol} symbol={symbol} meaning={meaning} />
            ))}
          </div>
        </section>
      </div>
    );
  }

  const energyStatus = classifyAccuracy(m.energyErrorRelative);
  const hStatus = classifyAccuracy(m.angularMomentumErrorRelative);
  const radiusStatus = classifyAccuracy(m.radiusCrossCheckError);
  const keplerStatus = classifyAccuracy(m.state.keplerResidual);
  const floatWarning =
    [m.state.radiusM, m.state.speedMS, m.specificEnergyJPerKg, m.angularMomentumM2S].every(
      Number.isFinite
    ) === false;

  return (
    <div className="analysis-panel">
      <section className="panel-section">
        <strong>Numerical accuracy</strong>
        <div className="info-grid">
          <span>Kepler residual</span>
          <span>
            {formatAdaptive(m.state.keplerResidual)} {statusBadge(keplerStatus)}
          </span>
          <span>Solver iterations</span>
          <span>{m.state.keplerIterations}</span>
          <span>Energy cross-check error</span>
          <span>
            {formatAdaptive(m.energyErrorRelative)} {statusBadge(energyStatus)}
          </span>
          <span>Angular-momentum error</span>
          <span>
            {formatAdaptive(m.angularMomentumErrorRelative)} {statusBadge(hStatus)}
          </span>
          <span>Radius-equation error</span>
          <span>
            {formatAdaptive(m.radiusCrossCheckError)} {statusBadge(radiusStatus)}
          </span>
          <span>Dataset vs Kepler period</span>
          <span>
            {formatFixed(m.periodDatasetDays, 3)} d vs {formatFixed(m.periodComputedDays, 3)} d (
            {formatPercent(m.periodErrorRelative, 4)})
          </span>
          <span>Floating-point state</span>
          <span>{floatWarning ? statusBadge("invalid") : "all values finite"}</span>
          <span>Graph samples stored</span>
          <span>{graphHistory.size}</span>
          <span>Simulation speed</span>
          <span>{formatFixed(speedDaysPerSecond, 3)} simulated d / real s</span>
          <span>UI time step</span>
          <span>≈ 120 ms per measurement update</span>
        </div>
        <p className="disclosure">
          relative error = |calculated − expected| / max(|expected|, 10⁻³⁰). Thresholds: excellent
          &lt; 10⁻¹⁰, acceptable &lt; 10⁻⁷, warning &lt; 10⁻⁴, otherwise invalid. The dataset-period
          difference is expected: published mean orbital periods include planetary perturbations
          that the pure two-body formula T = 2π√(a³/μ) ignores.
        </p>
      </section>
    </div>
  );
}

function GlossaryRow({ symbol, meaning }: { symbol: string; meaning: string }) {
  return (
    <>
      <span className="glossary-symbol">{symbol}</span>
      <span>{meaning}</span>
    </>
  );
}
