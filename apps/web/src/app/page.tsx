import { SimulationDashboard } from "@/components/SimulationDashboard";
import { getSimulationMetadata } from "@/lib/simulations";

export default function Home() {
  const simulations = getSimulationMetadata();

  return (
    <div className="page-shell">
      <header className="topbar">
        <div className="brand">
          <strong>Astronomy-and-Astrophysics-Simulations</strong>
          <span>Computational astronomy modules by Prabhmannat Singh</span>
        </div>
        <span className="badge">20 simulations</span>
      </header>
      <SimulationDashboard simulations={simulations} />
    </div>
  );
}
