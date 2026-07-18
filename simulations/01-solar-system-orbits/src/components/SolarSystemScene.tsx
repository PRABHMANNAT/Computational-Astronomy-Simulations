"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars, Html } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import {
  DAY_SECONDS,
  HABITABLE_ZONE_INNER_AU,
  HABITABLE_ZONE_OUTER_AU,
  TWO_PI
} from "../data/constants";
import { PLANETS, getPlanetById } from "../data/planetaryData";
import { angularMomentumVector } from "../physics/angularMomentum";
import { toOrbitalElementsSI } from "../physics/orbitalElements";
import { orbitalStateAt, rotateToHeliocentric, positionInOrbitalPlane } from "../physics/orbitalPosition";
import { scaleDistanceAu, scalePositionAu } from "../physics/scaling";
import { poseForPlanetFocus, poseForView } from "../simulation/cameraController";
import { simulationClock } from "../simulation/simulationClock";
import { slowMotionFactorForPhase } from "../simulation/simulationPhases";
import { useSimulationStore } from "../simulation/simulationStore";
import type { OrbitalElementsSI } from "../types/planet";
import { metresToAu } from "../utils/units";
import { OrbitPath } from "./OrbitPath";
import { Planet } from "./Planet";
import { SimulationErrorBoundary } from "./SimulationErrorBoundary";
import { Sun } from "./Sun";

const ELEMENTS_BY_ID = new Map(PLANETS.map((planet) => [planet.id, toOrbitalElementsSI(planet)]));

function getElements(planetId: string): OrbitalElementsSI {
  const elements = ELEMENTS_BY_ID.get(planetId);
  if (!elements) {
    throw new Error(`Unknown planet id: ${planetId}`);
  }
  return elements;
}

/** Advances the authoritative clock once per rendered frame. */
function TimeAdvancer() {
  useFrame((_, delta) => {
    const store = useSimulationStore.getState();
    if (!store.isPlaying) {
      return;
    }
    const slowFactor = store.slowMotionEnabled ? slowMotionFactorForPhase(store.phase) : 1;
    simulationClock.advance(delta, store.speedDaysPerSecond, store.timeDirection, slowFactor);
  });
  return null;
}

function scaledPlanetPosition(planetId: string): THREE.Vector3 {
  const store = useSimulationStore.getState();
  const state = orbitalStateAt(getElements(planetId), simulationClock.elapsedDays * DAY_SECONDS);
  const scaled = scalePositionAu(
    {
      x: metresToAu(state.positionM.x),
      y: metresToAu(state.positionM.y),
      z: metresToAu(state.positionM.z)
    },
    store.scaling.mode,
    store.scaling.distanceScale
  );
  return new THREE.Vector3(scaled.x, scaled.y, scaled.z);
}

/**
 * Velocity, gravitational-force, acceleration and angular-momentum arrows for
 * the selected planet. Arrow lengths are visual only — never physical lengths.
 */
function VectorOverlay() {
  const groupRef = useRef<THREE.Group>(null);
  const arrows = useMemo(
    () => ({
      velocity: new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(), 1, 0x4ade80, 0.22, 0.12),
      force: new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(), 1, 0xf87171, 0.22, 0.12),
      acceleration: new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(), 1, 0xfbbf24, 0.18, 0.1),
      angularMomentum: new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(), 1, 0xc084fc, 0.22, 0.12)
    }),
    []
  );

  useEffect(() => {
    const group = groupRef.current;
    if (!group) {
      return;
    }
    Object.values(arrows).forEach((arrow) => group.add(arrow));
    return () => {
      Object.values(arrows).forEach((arrow) => {
        group.remove(arrow);
        arrow.dispose();
      });
    };
  }, [arrows]);

  useFrame(() => {
    const store = useSimulationStore.getState();
    const { toggles } = store;
    const anyVisible =
      toggles.velocityVector ||
      toggles.forceVector ||
      toggles.accelerationVector ||
      toggles.angularMomentumVector;
    arrows.velocity.visible = toggles.velocityVector;
    arrows.force.visible = toggles.forceVector;
    arrows.acceleration.visible = toggles.accelerationVector;
    arrows.angularMomentum.visible = toggles.angularMomentumVector;
    if (!anyVisible) {
      return;
    }

    let state;
    try {
      state = orbitalStateAt(
        getElements(store.selectedPlanetId),
        simulationClock.elapsedDays * DAY_SECONDS
      );
    } catch {
      return;
    }
    const origin = scaledPlanetPosition(store.selectedPlanetId);
    const baseLength = 0.9 * store.scaling.vectorScale;

    const velocityDir = new THREE.Vector3(
      state.velocityMS.x,
      state.velocityMS.y,
      state.velocityMS.z
    ).normalize();
    arrows.velocity.position.copy(origin);
    arrows.velocity.setDirection(velocityDir);
    arrows.velocity.setLength(baseLength, 0.2, 0.1);

    // Force and acceleration both point from the planet toward the Sun.
    const towardSun = origin.clone().multiplyScalar(-1).normalize();
    arrows.force.position.copy(origin);
    arrows.force.setDirection(towardSun);
    arrows.force.setLength(baseLength * 0.85, 0.2, 0.1);
    arrows.acceleration.position.copy(origin);
    arrows.acceleration.setDirection(towardSun);
    arrows.acceleration.setLength(baseLength * 0.6, 0.16, 0.08);

    const h = angularMomentumVector(state.positionM, state.velocityMS);
    const hDir = new THREE.Vector3(h.x, h.y, h.z).normalize();
    arrows.angularMomentum.position.copy(origin);
    arrows.angularMomentum.setDirection(hDir);
    arrows.angularMomentum.setLength(baseLength * 0.8, 0.2, 0.1);
  });

  return <group ref={groupRef} />;
}

/** Perihelion/aphelion markers, foci, semi-major axis for the selected orbit. */
function OrbitMarkers() {
  const selectedPlanetId = useSimulationStore((state) => state.selectedPlanetId);
  const toggles = useSimulationStore((state) => state.toggles);
  const mode = useSimulationStore((state) => state.scaling.mode);
  const distanceScale = useSimulationStore((state) => state.scaling.distanceScale);

  const geometry = useMemo(() => {
    const elements = getElements(selectedPlanetId);
    const scalePoint = (perifocalE: number) => {
      const perifocal = positionInOrbitalPlane(
        elements.semiMajorAxisM,
        elements.eccentricity,
        perifocalE
      );
      const helio = rotateToHeliocentric(
        perifocal,
        elements.inclinationRad,
        elements.longitudeAscendingNodeRad,
        elements.argumentOfPerihelionRad
      );
      const scaled = scalePositionAu(
        { x: metresToAu(helio.x), y: metresToAu(helio.y), z: metresToAu(helio.z) },
        mode,
        distanceScale
      );
      return new THREE.Vector3(scaled.x, scaled.y, scaled.z);
    };
    const perihelion = scalePoint(0);
    const aphelion = scalePoint(Math.PI);
    // The second (empty) focus sits opposite the Sun along the apse line.
    const secondFocus = perihelion.clone().add(aphelion);
    return { perihelion, aphelion, secondFocus };
  }, [selectedPlanetId, mode, distanceScale]);

  const apseLine = useMemoLine(geometry.perihelion, geometry.aphelion);

  return (
    <group>
      {toggles.perihelionMarker ? (
        <group position={geometry.perihelion}>
          <mesh>
            <sphereGeometry args={[0.055, 16, 16]} />
            <meshBasicMaterial color="#4ade80" />
          </mesh>
          <Html distanceFactor={14} position={[0, 0, 0.12]}>
            <span className="orbit3d-marker">Perihelion</span>
          </Html>
        </group>
      ) : null}
      {toggles.aphelionMarker ? (
        <group position={geometry.aphelion}>
          <mesh>
            <sphereGeometry args={[0.055, 16, 16]} />
            <meshBasicMaterial color="#f87171" />
          </mesh>
          <Html distanceFactor={14} position={[0, 0, 0.12]}>
            <span className="orbit3d-marker">Aphelion</span>
          </Html>
        </group>
      ) : null}
      {toggles.orbitalFoci ? (
        <>
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.045, 12, 12]} />
            <meshBasicMaterial color="#facc15" />
          </mesh>
          <mesh position={geometry.secondFocus}>
            <sphereGeometry args={[0.045, 12, 12]} />
            <meshBasicMaterial color="#94a3b8" />
          </mesh>
        </>
      ) : null}
      {toggles.semiMajorAxis ? <primitive object={apseLine} /> : null}
    </group>
  );
}

function useMemoLine(a: THREE.Vector3, b: THREE.Vector3): THREE.Line {
  return useMemo(() => {
    const geometry = new THREE.BufferGeometry().setFromPoints([a, b]);
    const material = new THREE.LineDashedMaterial({
      color: 0x9ca8b8,
      dashSize: 0.12,
      gapSize: 0.08,
      transparent: true,
      opacity: 0.7
    });
    const line = new THREE.Line(geometry, material);
    line.computeLineDistances();
    return line;
  }, [a, b]);
}

/** Equal-time swept-area sectors for the Kepler second-law demonstration. */
function EqualAreaSectors() {
  const selectedPlanetId = useSimulationStore((state) => state.selectedPlanetId);
  const sectorCount = useSimulationStore((state) => state.sectorCount);
  const mode = useSimulationStore((state) => state.scaling.mode);
  const distanceScale = useSimulationStore((state) => state.scaling.distanceScale);

  const geometries = useMemo(() => {
    const elements = getElements(selectedPlanetId);
    const periodS = elements.orbitalPeriodS;
    const samplesPerSector = 24;
    const result: Array<{ geometry: THREE.BufferGeometry; even: boolean }> = [];

    // Anchor sectors at perihelion so speed asymmetry is obvious.
    const epochOffsetS = ((TWO_PI - elements.meanAnomalyAtEpochRad) / TWO_PI) * periodS;

    for (let sector = 0; sector < sectorCount; sector += 1) {
      const vertices: number[] = [0, 0, 0];
      for (let sample = 0; sample <= samplesPerSector; sample += 1) {
        const t = epochOffsetS + ((sector + sample / samplesPerSector) / sectorCount) * periodS;
        const state = orbitalStateAt(elements, t);
        const scaled = scalePositionAu(
          {
            x: metresToAu(state.positionM.x),
            y: metresToAu(state.positionM.y),
            z: metresToAu(state.positionM.z)
          },
          mode,
          distanceScale
        );
        vertices.push(scaled.x, scaled.y, scaled.z);
      }
      const pointCount = vertices.length / 3;
      const indices: number[] = [];
      for (let i = 1; i < pointCount - 1; i += 1) {
        indices.push(0, i, i + 1);
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(vertices), 3));
      geometry.setIndex(indices);
      result.push({ geometry, even: sector % 2 === 0 });
    }
    return result;
  }, [selectedPlanetId, sectorCount, mode, distanceScale]);

  useEffect(() => {
    return () => geometries.forEach(({ geometry }) => geometry.dispose());
  }, [geometries]);

  return (
    <group>
      {geometries.map((sector, index) => (
        <mesh key={index} geometry={sector.geometry}>
          <meshBasicMaterial
            color={sector.even ? "#38bdf8" : "#818cf8"}
            transparent
            opacity={0.16}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/** Habitable-zone annulus, ecliptic plane disc, grid and axes helpers. */
function ReferenceOverlays() {
  const toggles = useSimulationStore((state) => state.toggles);
  const mode = useSimulationStore((state) => state.scaling.mode);
  const distanceScale = useSimulationStore((state) => state.scaling.distanceScale);
  const sceneRadius = scaleDistanceAu(32, mode) * distanceScale;

  return (
    <group>
      {toggles.habitableZone ? (
        <mesh position={[0, 0, -0.002]}>
          <ringGeometry
            args={[
              scaleDistanceAu(HABITABLE_ZONE_INNER_AU, mode) * distanceScale,
              scaleDistanceAu(HABITABLE_ZONE_OUTER_AU, mode) * distanceScale,
              96
            ]}
          />
          <meshBasicMaterial color="#22c55e" transparent opacity={0.1} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      ) : null}
      {toggles.orbitalPlane ? (
        <mesh position={[0, 0, -0.004]}>
          <circleGeometry args={[sceneRadius, 64]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.04} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      ) : null}
      {toggles.grid ? (
        <gridHelper
          args={[sceneRadius * 2, 24, "#263142", "#1a2333"]}
          rotation={[Math.PI / 2, 0, 0]}
        />
      ) : null}
      {toggles.referenceAxes ? <axesHelper args={[sceneRadius * 0.6]} /> : null}
    </group>
  );
}

/** Animates the camera toward requested poses; user orbiting stays in control otherwise. */
function CameraRig() {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const { camera } = useThree();
  const cameraView = useSimulationStore((state) => state.cameraView);
  const cameraFocusRequest = useSimulationStore((state) => state.cameraFocusRequest);
  const transition = useRef<{ position: THREE.Vector3; target: THREE.Vector3; t: number } | null>(null);

  useEffect(() => {
    const store = useSimulationStore.getState();
    const mode = store.scaling.mode;
    const sceneRadius = scaleDistanceAu(31, mode) * store.scaling.distanceScale;
    const planet = getPlanetById(store.selectedPlanetId);
    const orbitRadius = scaleDistanceAu(planet.aphelionAU, mode) * store.scaling.distanceScale;
    const pose = poseForView(
      cameraView,
      sceneRadius,
      null,
      orbitRadius
    );
    transition.current = {
      position: new THREE.Vector3(pose.position.x, pose.position.y, pose.position.z),
      target: new THREE.Vector3(pose.target.x, pose.target.y, pose.target.z),
      t: 0
    };
  }, [cameraView]);

  useEffect(() => {
    if (cameraFocusRequest === 0) {
      return;
    }
    const store = useSimulationStore.getState();
    const position = scaledPlanetPosition(store.selectedPlanetId);
    const pose = poseForPlanetFocus(
      { x: position.x, y: position.y, z: position.z },
      0.15
    );
    transition.current = {
      position: new THREE.Vector3(pose.position.x, pose.position.y, pose.position.z),
      target: new THREE.Vector3(pose.target.x, pose.target.y, pose.target.z),
      t: 0
    };
  }, [cameraFocusRequest]);

  useFrame(() => {
    const controls = controlsRef.current;
    if (!controls) {
      return;
    }
    const store = useSimulationStore.getState();

    if (store.followSelectedPlanet) {
      try {
        const position = scaledPlanetPosition(store.selectedPlanetId);
        const delta = position.clone().sub(controls.target);
        controls.target.copy(position);
        camera.position.add(delta);
        controls.update();
      } catch {
        // ignore a bad frame
      }
      return;
    }

    const active = transition.current;
    if (active) {
      active.t += 0.035;
      const alpha = Math.min(active.t, 1) * 0.12;
      camera.position.lerp(active.position, alpha);
      controls.target.lerp(active.target, alpha);
      controls.update();
      if (camera.position.distanceTo(active.position) < 0.02) {
        transition.current = null;
      }
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enablePan
      enableZoom
      enableRotate
      minDistance={0.4}
      maxDistance={220}
      onStart={() => {
        transition.current = null;
      }}
    />
  );
}

function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

/** The complete interactive 3D solar-system view. */
export function SolarSystemScene() {
  const hiddenPlanetIds = useSimulationStore((state) => state.hiddenPlanetIds);
  const isolate = useSimulationStore((state) => state.isolateSelectedOrbit);
  const selectedPlanetId = useSimulationStore((state) => state.selectedPlanetId);
  const toggles = useSimulationStore((state) => state.toggles);
  const [webGLOk, setWebGLOk] = useState(true);

  useEffect(() => {
    setWebGLOk(isWebGLAvailable());
  }, []);

  const visiblePlanets = PLANETS.filter((planet) => {
    if (isolate) {
      return planet.id === selectedPlanetId;
    }
    return !hiddenPlanetIds.includes(planet.id);
  });

  if (!webGLOk) {
    return (
      <div className="webgl-fallback" role="alert">
        <strong>WebGL is unavailable.</strong>
        <p>
          The 3D view needs WebGL. Try a different browser or enable hardware acceleration; the
          analysis panels below still work.
        </p>
      </div>
    );
  }

  return (
    <Canvas
      camera={{ position: [6.5, -6.5, 4.6], up: [0, 0, 1], fov: 50, near: 0.01, far: 800 }}
      dpr={[1, 2]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <color attach="background" args={["#02040a"]} />
      <TimeAdvancer />
      <CameraRig />
      {toggles.backgroundStars ? (
        <Stars radius={280} depth={60} count={4200} factor={5} saturation={0} fade speed={0.4} />
      ) : null}
      <Sun />
      {visiblePlanets.map((planet) => (
        <SimulationErrorBoundary key={planet.id} fallback={null}>
          {toggles.orbitPaths ? (
            <OrbitPath
              elements={getElements(planet.id)}
              color={planet.color}
              selected={planet.id === selectedPlanetId}
            />
          ) : null}
          <Planet planet={planet} elements={getElements(planet.id)} />
        </SimulationErrorBoundary>
      ))}
      <VectorOverlay />
      <OrbitMarkers />
      {toggles.equalAreaSectors ? <EqualAreaSectors /> : null}
      <ReferenceOverlays />
    </Canvas>
  );
}
