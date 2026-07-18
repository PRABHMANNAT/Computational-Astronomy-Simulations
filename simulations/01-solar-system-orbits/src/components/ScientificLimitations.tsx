"use client";

const LIMITATIONS: string[] = [
  "The default simulation treats each planet as an independent Sun–planet two-body problem solved with Kepler's equation.",
  "Planet-to-planet gravitational perturbations are excluded.",
  "General relativity is excluded; Mercury's relativistic perihelion precession (≈43″ per century) is not modelled.",
  "Planetary masses do not move the Sun: the Sun is pinned at the origin instead of orbiting the system barycentre.",
  "Orbital elements are approximate epoch-mean values and are treated as fixed — they are not continuously updated ephemerides.",
  "Long-term orbital precession (nodal and apsidal) is excluded.",
  "Axial rotation is a visual representation only; it is not dynamically coupled to the orbit.",
  "Planet sizes are enormously enlarged for visibility — at true scale, planets would be invisible sub-pixel dots.",
  "Orbital distances may be compressed or logarithmically scaled depending on the selected scale mode.",
  "Surface colors are illustrative, not photometric textures.",
  "This simulation is educational; it does not provide mission-navigation or ephemeris-grade accuracy."
];

/** Explicit list of the model's scientific assumptions and limits. */
export function ScientificLimitations() {
  return (
    <div className="analysis-panel">
      <section className="panel-section">
        <strong>Scientific limitations and assumptions</strong>
        <ul className="limitations-list">
          {LIMITATIONS.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="disclosure">
          Within these assumptions the model is exact: Kepler's equation is solved to a 10⁻¹²
          residual each frame, and energy and angular momentum are conserved to numerical
          precision. For research-grade positions, use JPL Horizons or an equivalent ephemeris
          service.
        </p>
      </section>
    </div>
  );
}
