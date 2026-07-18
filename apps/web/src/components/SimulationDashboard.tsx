import Link from "next/link";
import type { SimulationMetadata } from "@astro-sim/shared-utils";

export function SimulationDashboard({ simulations }: { simulations: SimulationMetadata[] }) {
  return (
    <main className="dashboard-grid" aria-label="Simulation dashboard">
      {simulations.map((simulation) => {
        const isReferenceSimulation = simulation.slug === "01-solar-system-orbits";

        return (
          <article className="simulation-card" key={simulation.slug}>
            <div>
              <p className="subtle">{simulation.category}</p>
              <h2>{simulation.name}</h2>
            </div>
            <p className="subtle">{simulation.description}</p>
            <div className="card-meta">
              <span className="badge status">{simulation.status}</span>
              <span className="badge">{simulation.difficulty}</span>
              <span className="badge">{simulation.dimension}</span>
            </div>
            {isReferenceSimulation ? (
              <Link className="launch-link" href="/simulations/01-solar-system-orbits">
                Launch
              </Link>
            ) : (
              <span className="launch-disabled" aria-disabled="true">
                Planned
              </span>
            )}
          </article>
        );
      })}
    </main>
  );
}
