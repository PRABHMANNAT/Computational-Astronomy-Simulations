import Link from "next/link";
import { SolarSystemOrbitSimulator } from "@astro-sim/solar-system-orbits";

export default function SolarSystemOrbitPage() {
  return (
    <div className="page-shell">
      <header className="topbar">
        <div className="brand">
          <strong>Solar System Orbit Simulator</strong>
          <span>Reference implementation using separated physics, state, and rendering.</span>
        </div>
        <Link className="badge" href="/">
          Dashboard
        </Link>
      </header>
      <SolarSystemOrbitSimulator />
    </div>
  );
}
