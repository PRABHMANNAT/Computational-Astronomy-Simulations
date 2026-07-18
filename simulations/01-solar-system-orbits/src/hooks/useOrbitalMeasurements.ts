"use client";

import { useMemo } from "react";
import { DAY_SECONDS, SOLAR_MASS_KG, TWO_PI } from "../data/constants";
import {
  angularMomentumCrossCheckError,
  angularMomentumVector,
  specificAngularMomentum,
  vectorMagnitude
} from "../physics/angularMomentum";
import {
  aphelionDistance,
  focusDistance,
  orbitalPeriodFromSemiMajorAxis,
  perihelionDistance,
  semiMinorAxis
} from "../physics/orbitalElements";
import { orbitalStateAt, radiusFromTrueAnomaly } from "../physics/orbitalPosition";
import {
  energyCrossCheckError,
  specificKineticEnergy,
  specificOrbitalEnergy,
  specificOrbitalEnergyFromSemiMajorAxis,
  specificPotentialEnergy,
  totalOrbitalEnergy
} from "../physics/orbitalEnergy";
import {
  aphelionSpeed,
  centripetalAcceleration,
  circularOrbitSpeed,
  gravitationalAcceleration,
  gravitationalForce,
  perihelionSpeed,
  visVivaSpeed
} from "../physics/orbitalVelocity";
import { relativeError } from "../physics/validation";
import { useSimulationStore } from "../simulation/simulationStore";
import type { OrbitalState, PlanetaryData, Vector3D } from "../types/planet";
import { useSelectedPlanet } from "./useSelectedPlanet";

export interface OrbitalMeasurements {
  planet: PlanetaryData;
  state: OrbitalState;
  elapsedDays: number;
  /** Ellipse geometry (SI). */
  perihelionM: number;
  aphelionM: number;
  semiMinorAxisM: number;
  focusDistanceM: number;
  /** 0 at perihelion, 1 at aphelion. */
  radialFraction: number;
  movingTowardSun: boolean;
  daysSincePerihelion: number;
  daysUntilPerihelion: number;
  /** Dynamics. */
  gravitationalForceN: number;
  gravitationalAccelerationMS2: number;
  centripetalAccelerationMS2: number;
  perihelionSpeedMS: number;
  aphelionSpeedMS: number;
  circularSpeedMS: number;
  visVivaSpeedMS: number;
  /** Energy (per unit mass and total). */
  kineticJPerKg: number;
  potentialJPerKg: number;
  specificEnergyJPerKg: number;
  specificEnergyFromGeometryJPerKg: number;
  totalEnergyJ: number;
  energyErrorRelative: number;
  /** Angular momentum. */
  angularMomentumM2S: number;
  angularMomentumVec: Vector3D;
  angularMomentumAnalyticalM2S: number;
  angularMomentumErrorRelative: number;
  /** Numerical cross-checks. */
  radiusCrossCheckError: number;
  speedCrossCheckError: number;
  periodDatasetDays: number;
  periodComputedDays: number;
  periodErrorRelative: number;
  solarMassKg: number;
}

/**
 * Computes the complete live measurement set for the selected planet at the
 * current (throttled) display time. Every value derives from the pure physics
 * modules, so panels stay presentation-only.
 */
export function useOrbitalMeasurements(): OrbitalMeasurements {
  const { planet, elements } = useSelectedPlanet();
  const elapsedDays = useSimulationStore((state) => state.displayDays);

  return useMemo(() => {
    const state = orbitalStateAt(elements, elapsedDays * DAY_SECONDS);
    const { semiMajorAxisM: a, eccentricity: e } = elements;

    const perihelionM = perihelionDistance(a, e);
    const aphelionM = aphelionDistance(a, e);
    const spanM = aphelionM - perihelionM;
    const radialFraction = spanM > 0 ? (state.radiusM - perihelionM) / spanM : 0;

    const daysSincePerihelion = (state.meanAnomalyRad / TWO_PI) * planet.orbitalPeriodDays;
    const daysUntilPerihelion = planet.orbitalPeriodDays - daysSincePerihelion;

    const kineticJPerKg = specificKineticEnergy(state.speedMS);
    const potentialJPerKg = specificPotentialEnergy(state.radiusM);
    const specificEnergyJPerKg = specificOrbitalEnergy(state.speedMS, state.radiusM);
    const specificEnergyFromGeometryJPerKg = specificOrbitalEnergyFromSemiMajorAxis(a);

    const hVec = angularMomentumVector(state.positionM, state.velocityMS);
    const hAnalytical = specificAngularMomentum(a, e);

    const visViva = visVivaSpeed(state.radiusM, a);
    const radiusCross = radiusFromTrueAnomaly(a, e, state.trueAnomalyRad);
    const periodComputedDays = orbitalPeriodFromSemiMajorAxis(a) / DAY_SECONDS;

    return {
      planet,
      state,
      elapsedDays,
      perihelionM,
      aphelionM,
      semiMinorAxisM: semiMinorAxis(a, e),
      focusDistanceM: focusDistance(a, e),
      radialFraction,
      movingTowardSun: state.radialVelocityMS < 0,
      daysSincePerihelion,
      daysUntilPerihelion,
      gravitationalForceN: gravitationalForce(planet.massKg, state.radiusM),
      gravitationalAccelerationMS2: gravitationalAcceleration(state.radiusM),
      centripetalAccelerationMS2: centripetalAcceleration(state.speedMS, state.radiusM),
      perihelionSpeedMS: perihelionSpeed(a, e),
      aphelionSpeedMS: aphelionSpeed(a, e),
      circularSpeedMS: circularOrbitSpeed(state.radiusM),
      visVivaSpeedMS: visViva,
      kineticJPerKg,
      potentialJPerKg,
      specificEnergyJPerKg,
      specificEnergyFromGeometryJPerKg,
      totalEnergyJ: totalOrbitalEnergy(planet.massKg, specificEnergyJPerKg),
      energyErrorRelative: energyCrossCheckError(state.speedMS, state.radiusM, a),
      angularMomentumM2S: vectorMagnitude(hVec),
      angularMomentumVec: hVec,
      angularMomentumAnalyticalM2S: hAnalytical,
      angularMomentumErrorRelative: angularMomentumCrossCheckError(
        state.positionM,
        state.velocityMS,
        a,
        e
      ),
      radiusCrossCheckError: relativeError(radiusCross, state.radiusM),
      speedCrossCheckError: relativeError(visViva, state.speedMS),
      periodDatasetDays: planet.orbitalPeriodDays,
      periodComputedDays,
      periodErrorRelative: relativeError(periodComputedDays, planet.orbitalPeriodDays),
      solarMassKg: SOLAR_MASS_KG
    };
  }, [planet, elements, elapsedDays]);
}
