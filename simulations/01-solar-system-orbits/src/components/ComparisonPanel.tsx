"use client";

import { useMemo } from "react";
import { DAY_SECONDS } from "../data/constants";
import { PLANETS, getPlanetById } from "../data/planetaryData";
import { specificAngularMomentum } from "../physics/angularMomentum";
import { toOrbitalElementsSI } from "../physics/orbitalElements";
import { orbitalStateAt } from "../physics/orbitalPosition";
import { specificOrbitalEnergyFromSemiMajorAxis } from "../physics/orbitalEnergy";
import { aphelionSpeed, gravitationalForce, perihelionSpeed } from "../physics/orbitalVelocity";
import { useSimulationStore } from "../simulation/simulationStore";
import type { PlanetaryData } from "../types/planet";
import { formatAdaptive, formatFixed } from "../utils/formatting";
import { metresToAu, msToKms } from "../utils/units";

interface ComparisonColumn {
  planet: PlanetaryData;
  currentDistanceAU: number;
  currentSpeedKMS: number;
  perihelionSpeedKMS: number;
  aphelionSpeedKMS: number;
  currentForceN: number;
  specificEnergyJPerKg: number;
  angularMomentumM2S: number;
  orbitsCompletedSinceRace: number | null;
}

function buildColumn(planetId: string, displayDays: number, raceStartDays: number | null): ComparisonColumn {
  const planet = getPlanetById(planetId);
  const elements = toOrbitalElementsSI(planet);
  const state = orbitalStateAt(elements, displayDays * DAY_SECONDS);
  return {
    planet,
    currentDistanceAU: metresToAu(state.radiusM),
    currentSpeedKMS: msToKms(state.speedMS),
    perihelionSpeedKMS: msToKms(perihelionSpeed(elements.semiMajorAxisM, elements.eccentricity)),
    aphelionSpeedKMS: msToKms(aphelionSpeed(elements.semiMajorAxisM, elements.eccentricity)),
    currentForceN: gravitationalForce(planet.massKg, state.radiusM),
    specificEnergyJPerKg: specificOrbitalEnergyFromSemiMajorAxis(elements.semiMajorAxisM),
    angularMomentumM2S: specificAngularMomentum(elements.semiMajorAxisM, elements.eccentricity),
    orbitsCompletedSinceRace:
      raceStartDays === null ? null : (displayDays - raceStartDays) / planet.orbitalPeriodDays
  };
}

/** Side-by-side comparison of two planets plus the perihelion race mode. */
export function ComparisonPanel() {
  const selectedPlanetId = useSimulationStore((state) => state.selectedPlanetId);
  const comparisonPlanetId = useSimulationStore((state) => state.comparisonPlanetId);
  const setComparisonPlanet = useSimulationStore((state) => state.setComparisonPlanet);
  const displayDays = useSimulationStore((state) => state.displayDays);
  const raceStartDays = useSimulationStore((state) => state.raceStartDays);
  const startRace = useSimulationStore((state) => state.startRace);
  const stopRace = useSimulationStore((state) => state.stopRace);

  const columns = useMemo(
    () => [
      buildColumn(selectedPlanetId, displayDays, raceStartDays),
      buildColumn(comparisonPlanetId, displayDays, raceStartDays)
    ],
    [selectedPlanetId, comparisonPlanetId, displayDays, raceStartDays]
  );

  const rows: Array<[string, (column: ComparisonColumn) => string]> = [
    ["Mass", (c) => `${formatAdaptive(c.planet.massKg)} kg`],
    ["Radius", (c) => `${formatFixed(c.planet.radiusKm, 0)} km`],
    ["Density", (c) => `${formatFixed(c.planet.meanDensityKgM3, 0)} kg/m³`],
    ["Surface gravity", (c) => `${formatFixed(c.planet.surfaceGravityMS2, 2)} m/s²`],
    ["Escape velocity", (c) => `${formatFixed(c.planet.escapeVelocityKMS, 2)} km/s`],
    ["Semi-major axis", (c) => `${formatFixed(c.planet.semiMajorAxisAU, 4)} AU`],
    ["Eccentricity", (c) => formatFixed(c.planet.eccentricity, 4)],
    ["Inclination", (c) => `${formatFixed(c.planet.inclinationDeg, 3)}°`],
    ["Orbital period", (c) => `${formatFixed(c.planet.orbitalPeriodDays, 1)} d`],
    ["Rotation period", (c) => `${formatFixed(c.planet.rotationPeriodHours, 2)} h`],
    ["Axial tilt", (c) => `${formatFixed(c.planet.axialTiltDeg, 2)}°`],
    ["Current distance", (c) => `${formatFixed(c.currentDistanceAU, 4)} AU`],
    ["Current speed", (c) => `${formatFixed(c.currentSpeedKMS, 3)} km/s`],
    ["Perihelion velocity", (c) => `${formatFixed(c.perihelionSpeedKMS, 3)} km/s`],
    ["Aphelion velocity", (c) => `${formatFixed(c.aphelionSpeedKMS, 3)} km/s`],
    ["Force from Sun", (c) => `${formatAdaptive(c.currentForceN)} N`],
    ["Specific energy ε", (c) => `${formatAdaptive(c.specificEnergyJPerKg)} J/kg`],
    ["Specific ang. momentum", (c) => `${formatAdaptive(c.angularMomentumM2S)} m²/s`]
  ];

  return (
    <div className="analysis-panel">
      <section className="panel-section">
        <strong>Planet comparison</strong>
        <label className="select-field">
          Compare {columns[0].planet.name} with
          <select
            value={comparisonPlanetId}
            onChange={(event) => setComparisonPlanet(event.currentTarget.value)}
          >
            {PLANETS.filter((planet) => planet.id !== selectedPlanetId).map((planet) => (
              <option key={planet.id} value={planet.id}>
                {planet.name}
              </option>
            ))}
          </select>
        </label>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Quantity</th>
                {columns.map((column) => (
                  <th key={column.planet.id}>
                    {column.planet.symbol} {column.planet.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(([label, render]) => (
                <tr key={label}>
                  <td>{label}</td>
                  {columns.map((column) => (
                    <td key={column.planet.id}>{render(column)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="disclosure">
          Both orbits stay visible in the 3D view (unless hidden), so the comparison is
          synchronized with the scene. Values marked with the current time update live.
        </p>
      </section>

      <section className="panel-section">
        <strong>Race mode</strong>
        <div className="button-row">
          {raceStartDays === null ? (
            <button className="control-button primary" type="button" onClick={startRace}>
              Start race at perihelion
            </button>
          ) : (
            <button className="control-button" type="button" onClick={stopRace}>
              Stop race
            </button>
          )}
        </div>
        {raceStartDays !== null ? (
          <div className="info-grid">
            <span>Race time</span>
            <span>{formatFixed(displayDays - raceStartDays, 1)} simulated days</span>
            {columns.map((column) => (
              <RaceRow key={column.planet.id} column={column} />
            ))}
          </div>
        ) : null}
        <p className="disclosure">
          The race starts the selected planet at its perihelion and counts completed orbits for
          both planets. On screen the inner planet appears to sweep around faster only because its
          orbital period is shorter — each planet always moves according to its own period, not a
          shared angular rate.
        </p>
      </section>
    </div>
  );
}

function RaceRow({ column }: { column: ComparisonColumn }) {
  return (
    <>
      <span>{column.planet.name} orbits completed</span>
      <span>
        {column.orbitsCompletedSinceRace === null
          ? "—"
          : formatFixed(Math.max(0, column.orbitsCompletedSinceRace), 3)}
      </span>
    </>
  );
}
