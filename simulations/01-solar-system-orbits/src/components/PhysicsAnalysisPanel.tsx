"use client";

import { useOrbitalMeasurements } from "../hooks/useOrbitalMeasurements";
import { formatAdaptive, formatFixed } from "../utils/formatting";
import { metresToAu, msToKms, radToDeg } from "../utils/units";

export type PhysicsSection = "forces" | "energy" | "momentum";

/** Forces, energy and angular-momentum analysis with educational explanations. */
export function PhysicsAnalysisPanel({ section }: { section: PhysicsSection }) {
  const m = useOrbitalMeasurements();

  if (section === "forces") {
    return (
      <div className="analysis-panel">
        <section className="panel-section">
          <strong>Gravitational force — F = G·M☉·m / r²</strong>
          <div className="info-grid">
            <span>Force magnitude</span>
            <span>{formatAdaptive(m.gravitationalForceN)} N</span>
            <span>Distance r</span>
            <span>
              {formatAdaptive(m.state.radiusM)} m ({formatFixed(metresToAu(m.state.radiusM), 5)} AU)
            </span>
            <span>Planet mass m</span>
            <span>{formatAdaptive(m.planet.massKg)} kg</span>
            <span>Solar mass M☉</span>
            <span>{formatAdaptive(m.solarMassKg)} kg</span>
          </div>
          <p className="disclosure">
            The force always acts toward the Sun, along −r̂. Because it follows an inverse-square
            law, halving the distance quadruples the pull. Toggle the force vector in the controls
            to see its direction; the arrow length is visually scaled, never physical.
          </p>
        </section>

        <section className="panel-section">
          <strong>Acceleration — gravitational vs centripetal</strong>
          <div className="info-grid">
            <span>a_g = μ / r²</span>
            <span>{formatAdaptive(m.gravitationalAccelerationMS2, 6)} m/s²</span>
            <span>a_c ≈ v² / r</span>
            <span>{formatAdaptive(m.centripetalAccelerationMS2, 6)} m/s²</span>
            <span>Ratio a_c / a_g</span>
            <span>{formatFixed(m.centripetalAccelerationMS2 / m.gravitationalAccelerationMS2, 6)}</span>
          </div>
          <p className="disclosure">
            Gravity continuously changes both the direction and the magnitude of the velocity; in
            the two-body model the acceleration vector always points at the Sun. For a perfectly
            circular orbit a_g equals a_c exactly. On an ellipse the ratio drifts away from 1
            because motion has radial and transverse components that vary around the orbit — an
            elliptical orbit does not have constant centripetal acceleration.
          </p>
        </section>
      </div>
    );
  }

  if (section === "energy") {
    return (
      <div className="analysis-panel">
        <section className="panel-section">
          <strong>Specific orbital energy — ε = v²/2 − μ/r = −μ/(2a)</strong>
          <div className="info-grid">
            <span>Specific kinetic (v²/2)</span>
            <span>{formatAdaptive(m.kineticJPerKg)} J/kg</span>
            <span>Specific potential (−μ/r)</span>
            <span>{formatAdaptive(m.potentialJPerKg)} J/kg</span>
            <span>ε from state</span>
            <span>{formatAdaptive(m.specificEnergyJPerKg)} J/kg</span>
            <span>ε from geometry (−μ/2a)</span>
            <span>{formatAdaptive(m.specificEnergyFromGeometryJPerKg)} J/kg</span>
            <span>Relative disagreement</span>
            <span>{formatAdaptive(m.energyErrorRelative)}</span>
            <span>Total energy (m·ε)</span>
            <span>{formatAdaptive(m.totalEnergyJ)} J</span>
          </div>
          <p className="disclosure">
            ε is negative for every bound orbit: the planet does not have enough kinetic energy to
            escape to infinity. As the planet falls toward perihelion, potential energy converts to
            kinetic energy; climbing back out reverses the exchange. Their sum stays constant for a
            fixed Keplerian orbit — watch the total-energy curve in the Energy graph remain flat
            while the other two oscillate in opposition.
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="analysis-panel">
      <section className="panel-section">
        <strong>Specific angular momentum — h = √[μ·a·(1 − e²)] = |r⃗ × v⃗|</strong>
        <div className="info-grid">
          <span>Analytical h</span>
          <span>{formatAdaptive(m.angularMomentumAnalyticalM2S)} m²/s</span>
          <span>|r⃗ × v⃗| from state</span>
          <span>{formatAdaptive(m.angularMomentumM2S)} m²/s</span>
          <span>Relative difference</span>
          <span>{formatAdaptive(m.angularMomentumErrorRelative)}</span>
          <span>Direction (unit vector)</span>
          <span>
            ({formatFixed(m.angularMomentumVec.x / m.angularMomentumM2S, 4)},{" "}
            {formatFixed(m.angularMomentumVec.y / m.angularMomentumM2S, 4)},{" "}
            {formatFixed(m.angularMomentumVec.z / m.angularMomentumM2S, 4)})
          </span>
          <span>Inclination check</span>
          <span>
            {formatFixed(radToDeg(Math.acos(m.angularMomentumVec.z / m.angularMomentumM2S)), 3)}°
            from ecliptic pole
          </span>
          <span>Areal velocity dA/dt = h/2</span>
          <span>{formatAdaptive(m.angularMomentumM2S / 2)} m²/s</span>
        </div>
        <p className="disclosure">
          In the ideal two-body model gravity is a central force, so it exerts no torque about the
          Sun and h⃗ is exactly conserved — its direction is the fixed normal of the orbital plane
          and its magnitude never changes. Constant h is also why equal areas are swept in equal
          times (Kepler's second law). Toggle the angular-momentum vector to display it; speeds
          shown here convert to {formatFixed(msToKms(m.state.speedMS), 3)} km/s at this instant.
        </p>
      </section>
    </div>
  );
}
