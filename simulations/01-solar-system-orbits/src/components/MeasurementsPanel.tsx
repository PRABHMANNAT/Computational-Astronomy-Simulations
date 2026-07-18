"use client";

import { useOrbitalMeasurements } from "../hooks/useOrbitalMeasurements";
import { useSimulationStore } from "../simulation/simulationStore";
import { getPhaseInfo } from "../simulation/simulationPhases";
import type { AngleUnit, DistanceUnit, SpeedUnit, TimeUnit } from "../types/simulation";
import { formatAdaptive, formatFixed, formatSimulatedTime } from "../utils/formatting";
import {
  DISTANCE_UNIT_LABEL,
  TIME_UNIT_LABEL,
  convertAngle,
  convertDistance,
  convertSpeed,
  convertTimeFromDays
} from "../utils/units";

/** Live measurement table for the selected planet with unit selectors. */
export function MeasurementsPanel() {
  const m = useOrbitalMeasurements();
  const units = useSimulationStore((state) => state.units);
  const setUnits = useSimulationStore((state) => state.setUnits);
  const phase = useSimulationStore((state) => state.phase);

  const distance = (metres: number) =>
    `${formatAdaptive(convertDistance(metres, units.distance), 5)} ${DISTANCE_UNIT_LABEL[units.distance]}`;
  const speed = (metresPerSecond: number) =>
    `${formatAdaptive(convertSpeed(metresPerSecond, units.speed), 4)} ${units.speed}`;
  const angle = (radians: number) =>
    `${formatFixed(convertAngle(radians, units.angle), units.angle === "deg" ? 3 : 5)} ${units.angle === "deg" ? "°" : "rad"}`;

  return (
    <div className="analysis-panel">
      <section className="panel-section" aria-label="Unit selectors">
        <strong>Units</strong>
        <div className="unit-row">
          <label className="select-field">
            Distance
            <select
              value={units.distance}
              onChange={(event) => setUnits({ distance: event.currentTarget.value as DistanceUnit })}
            >
              <option value="au">AU</option>
              <option value="km">km</option>
              <option value="m">m</option>
            </select>
          </label>
          <label className="select-field">
            Time
            <select
              value={units.time}
              onChange={(event) => setUnits({ time: event.currentTarget.value as TimeUnit })}
            >
              <option value="hours">hours</option>
              <option value="days">days</option>
              <option value="years">years</option>
            </select>
          </label>
          <label className="select-field">
            Speed
            <select
              value={units.speed}
              onChange={(event) => setUnits({ speed: event.currentTarget.value as SpeedUnit })}
            >
              <option value="km/s">km/s</option>
              <option value="m/s">m/s</option>
            </select>
          </label>
          <label className="select-field">
            Angle
            <select
              value={units.angle}
              onChange={(event) => setUnits({ angle: event.currentTarget.value as AngleUnit })}
            >
              <option value="deg">degrees</option>
              <option value="rad">radians</option>
            </select>
          </label>
        </div>
      </section>

      <section className="panel-section" aria-label="Live measurements">
        <strong>Live measurements — {m.planet.name}</strong>
        <div className="info-grid">
          <span>Elapsed simulated time</span>
          <span>
            {formatAdaptive(convertTimeFromDays(m.elapsedDays, units.time), 4)}{" "}
            {TIME_UNIT_LABEL[units.time]} ({formatSimulatedTime(m.elapsedDays)})
          </span>
          <span>Mean anomaly M</span>
          <span>{angle(m.state.meanAnomalyRad)}</span>
          <span>Eccentric anomaly E</span>
          <span>{angle(m.state.eccentricAnomalyRad)}</span>
          <span>True anomaly ν</span>
          <span>{angle(m.state.trueAnomalyRad)}</span>
          <span>Heliocentric X</span>
          <span>{distance(m.state.positionM.x)}</span>
          <span>Heliocentric Y</span>
          <span>{distance(m.state.positionM.y)}</span>
          <span>Heliocentric Z</span>
          <span>{distance(m.state.positionM.z)}</span>
          <span>Distance from Sun r</span>
          <span>{distance(m.state.radiusM)}</span>
          <span>Orbital speed v</span>
          <span>{speed(m.state.speedMS)}</span>
          <span>Radial velocity</span>
          <span>{speed(m.state.radialVelocityMS)}</span>
          <span>Transverse velocity</span>
          <span>{speed(m.state.transverseVelocityMS)}</span>
          <span>Gravitational force F</span>
          <span>{formatAdaptive(m.gravitationalForceN)} N</span>
          <span>Gravitational acceleration</span>
          <span>{formatAdaptive(m.gravitationalAccelerationMS2, 5)} m/s²</span>
          <span>Specific kinetic energy</span>
          <span>{formatAdaptive(m.kineticJPerKg)} J/kg</span>
          <span>Specific potential energy</span>
          <span>{formatAdaptive(m.potentialJPerKg)} J/kg</span>
          <span>Specific orbital energy ε</span>
          <span>{formatAdaptive(m.specificEnergyJPerKg)} J/kg</span>
          <span>Total orbital energy</span>
          <span>{formatAdaptive(m.totalEnergyJ)} J</span>
          <span>Specific angular momentum h</span>
          <span>{formatAdaptive(m.angularMomentumM2S)} m²/s</span>
          <span>Orbital phase</span>
          <span>{getPhaseInfo(phase).title.replace(/Phase \d · /, "")}</span>
          <span>Kepler iterations</span>
          <span>{m.state.keplerIterations}</span>
          <span>Kepler residual</span>
          <span>{formatAdaptive(m.state.keplerResidual)}</span>
        </div>
        <p className="disclosure">
          All quantities are computed from the ideal two-body Keplerian model at the current
          simulated instant. Negative radial velocity means the planet is approaching the Sun.
        </p>
      </section>
    </div>
  );
}
