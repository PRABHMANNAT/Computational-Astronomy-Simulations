"use client";

import { useSimulationStore } from "../simulation/simulationStore";
import { scaleSunRadius } from "../physics/scaling";

/**
 * The Sun at the heliocentric origin. Visual radius is heavily reduced from
 * reality (a true-scale Sun would swallow Mercury's rendered orbit).
 */
export function Sun() {
  const sunRadiusScale = useSimulationStore((state) => state.scaling.sunRadiusScale);
  const radius = scaleSunRadius(sunRadiusScale);

  return (
    <group>
      <mesh>
        <sphereGeometry args={[radius, 48, 48]} />
        <meshBasicMaterial color="#fde68a" />
      </mesh>
      <mesh>
        <sphereGeometry args={[radius * 1.25, 32, 32]} />
        <meshBasicMaterial color="#fbbf24" transparent opacity={0.22} />
      </mesh>
      <pointLight color="#fff7e0" intensity={260} distance={0} decay={1.1} />
      <ambientLight intensity={0.55} />
      <hemisphereLight args={["#cfe4ff", "#141821", 0.35]} />
    </group>
  );
}
