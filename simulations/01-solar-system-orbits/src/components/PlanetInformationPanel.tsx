"use client";

import { useOrbitalMeasurements } from "../hooks/useOrbitalMeasurements";
import { formatAdaptive, formatFixed, formatPercent, formatSimulatedTime } from "../utils/formatting";
import { metresToAu, msToKms } from "../utils/units";

/** Overview panel: dataset facts plus perihelion/aphelion situation analysis. */
export function PlanetInformationPanel() {
  const m = useOrbitalMeasurements();
  const { planet } = m;

  return (
    <div className="analysis-panel">
      <section className="panel-section">
        <strong>
          {planet.symbol} {planet.name}
        </strong>
        <p className="disclosure">{planet.description}</p>
        <div className="info-grid">
          <span>Mass</span>
          <span>{formatAdaptive(planet.massKg)} kg</span>
          <span>Radius</span>
          <span>{formatFixed(planet.radiusKm, 0)} km</span>
          <span>Mean density</span>
          <span>{formatFixed(planet.meanDensityKgM3, 0)} kg/m³</span>
          <span>Surface gravity</span>
          <span>{formatFixed(planet.surfaceGravityMS2, 2)} m/s²</span>
          <span>Escape velocity</span>
          <span>{formatFixed(planet.escapeVelocityKMS, 2)} km/s</span>
          <span>Rotation period</span>
          <span>{formatFixed(planet.rotationPeriodHours, 2)} h</span>
          <span>Axial tilt</span>
          <span>{formatFixed(planet.axialTiltDeg, 2)}°</span>
          <span>Moons</span>
          <span>{planet.numberOfMoons}</span>
          <span>Orbital period</span>
          <span>{formatFixed(planet.orbitalPeriodDays, 2)} d</span>
          <span>Mean orbital speed</span>
          <span>{formatFixed(planet.averageOrbitalVelocityKMS, 2)} km/s</span>
        </div>
      </section>

      <section className="panel-section">
        <strong>Perihelion and aphelion (approximate mean elements)</strong>
        <div className="info-grid">
          <span>Current distance</span>
          <span>{formatFixed(metresToAu(m.state.radiusM), 5)} AU</span>
          <span>Perihelion distance</span>
          <span>{formatFixed(metresToAu(m.perihelionM), 5)} AU</span>
          <span>Aphelion distance</span>
          <span>{formatFixed(metresToAu(m.aphelionM), 5)} AU</span>
          <span>Position between extremes</span>
          <span>{formatPercent(m.radialFraction)}</span>
          <span>Radial motion</span>
          <span>{m.movingTowardSun ? "Moving toward the Sun" : "Moving away from the Sun"}</span>
          <span>Since last perihelion</span>
          <span>≈ {formatSimulatedTime(m.daysSincePerihelion)}</span>
          <span>Until next perihelion</span>
          <span>≈ {formatSimulatedTime(m.daysUntilPerihelion)}</span>
          <span>Current speed</span>
          <span>{formatFixed(msToKms(m.state.speedMS), 3)} km/s</span>
        </div>
        <p className="disclosure">
          0% means the planet sits at perihelion, 100% at aphelion. Times are approximations from
          the mean anomaly of the fixed two-body orbit.
        </p>
      </section>
    </div>
  );
}
