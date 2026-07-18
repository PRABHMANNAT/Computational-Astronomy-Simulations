"use client";

import { useMemo } from "react";
import { getPlanetById } from "../data/planetaryData";
import { toOrbitalElementsSI } from "../physics/orbitalElements";
import { useSimulationStore } from "../simulation/simulationStore";
import type { OrbitalElementsSI, PlanetaryData } from "../types/planet";

export interface SelectedPlanet {
  planet: PlanetaryData;
  elements: OrbitalElementsSI;
}

/** The currently selected planet with its cached SI orbital elements. */
export function useSelectedPlanet(): SelectedPlanet {
  const selectedPlanetId = useSimulationStore((state) => state.selectedPlanetId);
  return useMemo(() => {
    const planet = getPlanetById(selectedPlanetId);
    return { planet, elements: toOrbitalElementsSI(planet) };
  }, [selectedPlanetId]);
}
