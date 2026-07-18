import type { CameraViewId } from "../types/simulation";
import type { Vector3D } from "../types/planet";

export interface CameraPose {
  position: Vector3D;
  target: Vector3D;
}

/**
 * Pure camera-pose calculations. Camera motion never touches physics state;
 * these functions only translate a view id into a position/target pair in
 * scene units for the rig to animate toward.
 */
export function poseForView(
  view: CameraViewId,
  sceneRadius: number,
  selectedPlanetPosition: Vector3D | null,
  selectedOrbitRadius: number
): CameraPose {
  const origin = { x: 0, y: 0, z: 0 };
  switch (view) {
    case "top":
      return { position: { x: 0, y: 0, z: sceneRadius * 2.2 }, target: origin };
    case "side":
      return { position: { x: sceneRadius * 2.2, y: 0, z: sceneRadius * 0.05 }, target: origin };
    case "ecliptic":
      return { position: { x: sceneRadius * 1.8, y: -sceneRadius * 1.8, z: sceneRadius * 0.04 }, target: origin };
    case "selected-orbit": {
      const radius = Math.max(selectedOrbitRadius * 2.4, 1.5);
      return {
        position: { x: radius * 0.9, y: -radius * 0.9, z: radius * 0.8 },
        target: selectedPlanetPosition ?? origin
      };
    }
    case "default":
    default:
      return {
        position: { x: sceneRadius * 1.25, y: -sceneRadius * 1.25, z: sceneRadius * 0.9 },
        target: origin
      };
  }
}

/** Pose used when the user requests an explicit focus on the selected planet. */
export function poseForPlanetFocus(planetPosition: Vector3D, planetRadius: number): CameraPose {
  const offset = Math.max(planetRadius * 12, 0.8);
  return {
    position: {
      x: planetPosition.x + offset,
      y: planetPosition.y - offset,
      z: planetPosition.z + offset * 0.7
    },
    target: planetPosition
  };
}
