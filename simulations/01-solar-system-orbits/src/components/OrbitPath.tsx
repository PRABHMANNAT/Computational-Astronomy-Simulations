"use client";

import { useMemo } from "react";
import { Line } from "@react-three/drei";
import { positionInOrbitalPlane, rotateToHeliocentric } from "../physics/orbitalPosition";
import { scalePositionAu } from "../physics/scaling";
import { useSimulationStore } from "../simulation/simulationStore";
import type { OrbitalElementsSI } from "../types/planet";
import { metresToAu } from "../utils/units";
import { TWO_PI } from "../data/constants";

const ORBIT_SEGMENTS = 256;

/** Computes the scaled 3D polyline of one full orbit (memo-friendly, pure). */
export function computeOrbitPoints(
  elements: OrbitalElementsSI,
  mode: Parameters<typeof scalePositionAu>[1],
  distanceScale: number
): Array<[number, number, number]> {
  const points: Array<[number, number, number]> = [];
  for (let index = 0; index <= ORBIT_SEGMENTS; index += 1) {
    const eccentricAnomaly = (index / ORBIT_SEGMENTS) * TWO_PI;
    const perifocal = positionInOrbitalPlane(
      elements.semiMajorAxisM,
      elements.eccentricity,
      eccentricAnomaly
    );
    const heliocentric = rotateToHeliocentric(
      perifocal,
      elements.inclinationRad,
      elements.longitudeAscendingNodeRad,
      elements.argumentOfPerihelionRad
    );
    const scaled = scalePositionAu(
      {
        x: metresToAu(heliocentric.x),
        y: metresToAu(heliocentric.y),
        z: metresToAu(heliocentric.z)
      },
      mode,
      distanceScale
    );
    points.push([scaled.x, scaled.y, scaled.z]);
  }
  return points;
}

export function OrbitPath({
  elements,
  color,
  selected
}: {
  elements: OrbitalElementsSI;
  color: string;
  selected: boolean;
}) {
  const mode = useSimulationStore((state) => state.scaling.mode);
  const distanceScale = useSimulationStore((state) => state.scaling.distanceScale);

  const points = useMemo(
    () => computeOrbitPoints(elements, mode, distanceScale),
    [elements, mode, distanceScale]
  );

  return (
    <Line
      points={points}
      color={color}
      transparent
      opacity={selected ? 0.85 : 0.3}
      lineWidth={selected ? 1.6 : 1}
    />
  );
}
