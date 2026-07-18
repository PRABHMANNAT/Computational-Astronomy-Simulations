import type { PlanetRecord } from "@astro-sim/astronomy-data";
import { planets } from "../data/planets";
import { calculatePlanetPosition, type OrbitalPosition } from "../physics/orbits";

export interface PlanetViewModel {
  planet: PlanetRecord;
  position: OrbitalPosition;
}

export function getPlanetPositions(elapsedDays: number): PlanetViewModel[] {
  return planets.map((planet) => ({
    planet,
    position: calculatePlanetPosition(elapsedDays, planet.elements)
  }));
}
