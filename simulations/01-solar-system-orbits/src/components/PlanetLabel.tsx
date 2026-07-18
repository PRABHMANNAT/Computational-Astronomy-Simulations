"use client";

import { Html } from "@react-three/drei";
import type { PlanetaryData } from "../types/planet";

/** Screen-space label attached to a planet group. */
export function PlanetLabel({
  planet,
  selected
}: {
  planet: PlanetaryData;
  selected: boolean;
}) {
  return (
    <Html center={false} distanceFactor={12} position={[0, 0, 0.14]} occlude={false}>
      <span className={selected ? "orbit3d-label selected" : "orbit3d-label"}>
        {planet.symbol} {planet.name}
      </span>
    </Html>
  );
}
