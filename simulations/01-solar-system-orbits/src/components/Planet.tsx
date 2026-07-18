"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { DAY_SECONDS } from "../data/constants";
import { orbitalStateAt } from "../physics/orbitalPosition";
import { scalePlanetRadius, scalePositionAu } from "../physics/scaling";
import { isFiniteVector } from "../physics/validation";
import { simulationClock } from "../simulation/simulationClock";
import { useSimulationStore } from "../simulation/simulationStore";
import type { OrbitalElementsSI, PlanetaryData } from "../types/planet";
import { metresToAu } from "../utils/units";
import { PlanetLabel } from "./PlanetLabel";

const MAX_TRAIL_POINTS = 2000;

/**
 * One planet: per-frame Keplerian position, optional axial rotation, optional
 * trail. All per-frame reads go through store.getState()/the clock singleton
 * so animation never re-renders React.
 */
export function Planet({
  planet,
  elements
}: {
  planet: PlanetaryData;
  elements: OrbitalElementsSI;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const trailRef = useRef<THREE.Line>(null);
  const trailCount = useRef(0);
  const lastTrailDays = useRef(Number.NaN);

  const selected = useSimulationStore((state) => state.selectedPlanetId === planet.id);
  const showLabel = useSimulationStore((state) => state.toggles.planetLabels);
  const showTrail = useSimulationStore((state) => state.toggles.planetTrails);
  const planetRadiusScale = useSimulationStore((state) => state.scaling.planetRadiusScale);
  const selectPlanet = useSimulationStore((state) => state.selectPlanet);

  const radius = scalePlanetRadius(planet.radiusKm, planetRadiusScale);

  const trailGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(MAX_TRAIL_POINTS * 3), 3)
    );
    geometry.setDrawRange(0, 0);
    return geometry;
  }, []);

  const trailLine = useMemo(() => {
    const material = new THREE.LineBasicMaterial({
      color: planet.color,
      transparent: true,
      opacity: 0.55
    });
    return new THREE.Line(trailGeometry, material);
  }, [trailGeometry, planet.color]);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) {
      return;
    }
    const store = useSimulationStore.getState();
    const elapsedDays = simulationClock.elapsedDays;

    let state;
    try {
      state = orbitalStateAt(elements, elapsedDays * DAY_SECONDS);
    } catch {
      return; // keep the previous valid position rather than crashing the frame
    }
    if (!isFiniteVector(state.positionM)) {
      return;
    }

    const scaled = scalePositionAu(
      {
        x: metresToAu(state.positionM.x),
        y: metresToAu(state.positionM.y),
        z: metresToAu(state.positionM.z)
      },
      store.scaling.mode,
      store.scaling.distanceScale
    );
    group.position.set(scaled.x, scaled.y, scaled.z);

    if (store.toggles.planetRotation && meshRef.current && planet.rotationPeriodHours !== 0) {
      const simHoursPerFrame = delta * store.speedDaysPerSecond * 24 * store.timeDirection;
      meshRef.current.rotation.z +=
        (simHoursPerFrame / planet.rotationPeriodHours) * Math.PI * 2 * (store.isPlaying ? 1 : 0);
    }

    const trail = trailRef.current;
    if (trail) {
      trail.visible = store.toggles.planetTrails;
      if (store.toggles.planetTrails) {
        const minGapDays = elements.orbitalPeriodS / DAY_SECONDS / 720;
        if (
          Number.isNaN(lastTrailDays.current) ||
          Math.abs(elapsedDays - lastTrailDays.current) >= minGapDays
        ) {
          lastTrailDays.current = elapsedDays;
          const limit = Math.min(store.scaling.trailLength, MAX_TRAIL_POINTS);
          const attribute = trailGeometry.getAttribute("position") as THREE.BufferAttribute;
          if (trailCount.current >= limit) {
            // Shift left by one point (small, bounded copy).
            const array = attribute.array as Float32Array;
            array.copyWithin(0, 3, limit * 3);
            trailCount.current = limit - 1;
          }
          attribute.setXYZ(trailCount.current, scaled.x, scaled.y, scaled.z);
          trailCount.current += 1;
          attribute.needsUpdate = true;
          trailGeometry.setDrawRange(0, trailCount.current);
        }
      } else if (trailCount.current > 0) {
        trailCount.current = 0;
        lastTrailDays.current = Number.NaN;
        trailGeometry.setDrawRange(0, 0);
      }
    }
  });

  return (
    <>
      <group ref={groupRef}>
        <mesh
          ref={meshRef}
          onClick={(event) => {
            event.stopPropagation();
            selectPlanet(planet.id);
          }}
        >
          <sphereGeometry args={[radius, 32, 32]} />
          <meshStandardMaterial
            color={planet.color}
            emissive={planet.color}
            emissiveIntensity={selected ? 0.5 : 0.18}
            roughness={0.65}
          />
        </mesh>
        {selected ? (
          <mesh>
            <ringGeometry args={[radius * 1.6, radius * 1.8, 48]} />
            <meshBasicMaterial color="#7dd3fc" side={THREE.DoubleSide} transparent opacity={0.9} />
          </mesh>
        ) : null}
        {showLabel ? <PlanetLabel planet={planet} selected={selected} /> : null}
      </group>
      {showTrail ? <primitive object={trailLine} ref={trailRef} /> : null}
    </>
  );
}
