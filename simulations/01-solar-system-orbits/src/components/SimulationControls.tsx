"use client";

import { useState } from "react";
import { PLANETS } from "../data/planetaryData";
import { EXPERIMENTS } from "../data/presets";
import {
  MAX_SPEED_DAYS_PER_SECOND,
  MIN_SPEED_DAYS_PER_SECOND,
  SPEED_PRESETS
} from "../simulation/simulationClock";
import { useSimulationStore } from "../simulation/simulationStore";
import type { CameraViewId, DistanceScaleMode, VisualizationToggles } from "../types/simulation";
import { formatFixed } from "../utils/formatting";

const SCALE_MODES: Array<{ id: DistanceScaleMode; label: string }> = [
  { id: "linear", label: "Linear" },
  { id: "compressed", label: "Compressed" },
  { id: "logarithmic", label: "Logarithmic" },
  { id: "educational", label: "Educational" },
  { id: "real", label: "Real distances" }
];

const CAMERA_VIEWS: Array<{ id: CameraViewId; label: string }> = [
  { id: "default", label: "Default" },
  { id: "top", label: "Top" },
  { id: "side", label: "Side" },
  { id: "ecliptic", label: "Ecliptic" },
  { id: "selected-orbit", label: "Selected orbit" }
];

const TOGGLE_GROUPS: Array<{ title: string; items: Array<{ key: keyof VisualizationToggles; label: string }> }> = [
  {
    title: "Orbit display",
    items: [
      { key: "orbitPaths", label: "Orbit paths" },
      { key: "planetLabels", label: "Planet labels" },
      { key: "planetTrails", label: "Planet trails" },
      { key: "perihelionMarker", label: "Perihelion marker" },
      { key: "aphelionMarker", label: "Aphelion marker" },
      { key: "orbitalFoci", label: "Orbital foci" },
      { key: "semiMajorAxis", label: "Semi-major axis" },
      { key: "equalAreaSectors", label: "Equal-area sectors" }
    ]
  },
  {
    title: "Vectors",
    items: [
      { key: "velocityVector", label: "Velocity vector" },
      { key: "forceVector", label: "Force vector" },
      { key: "accelerationVector", label: "Acceleration vector" },
      { key: "angularMomentumVector", label: "Angular momentum" }
    ]
  },
  {
    title: "Environment",
    items: [
      { key: "grid", label: "Grid" },
      { key: "referenceAxes", label: "Reference axes" },
      { key: "orbitalPlane", label: "Orbital plane" },
      { key: "habitableZone", label: "Habitable zone" },
      { key: "planetRotation", label: "Planet rotation" },
      { key: "backgroundStars", label: "Background stars" }
    ]
  }
];

/** Left-hand control panel: time, planets, presets, visualization, scaling, camera. */
export function SimulationControls() {
  const store = useSimulationStore();
  const [customSpeed, setCustomSpeed] = useState("");

  const applyCustomSpeed = () => {
    const parsed = Number(customSpeed);
    if (Number.isFinite(parsed) && parsed > 0) {
      store.setSpeed(parsed);
    }
  };

  return (
    <div className="control-panel" aria-label="Simulation controls">
      <section className="panel-section" aria-label="Time controls">
        <strong>Time</strong>
        <div className="button-row">
          <button
            className="control-button primary"
            type="button"
            onClick={store.togglePlay}
            aria-label={store.isPlaying ? "Pause simulation" : "Play simulation"}
          >
            {store.isPlaying ? "Pause" : "Play"}
          </button>
          <button className="control-button" type="button" onClick={store.reset}>
            Reset
          </button>
          <button
            className="control-button"
            type="button"
            aria-pressed={store.timeDirection === -1}
            onClick={store.toggleReverse}
          >
            {store.timeDirection === 1 ? "Reverse" : "Forward"}
          </button>
        </div>
        <div className="button-row">
          <button className="control-button" type="button" onClick={store.stepBackward}>
            ⟲ Step
          </button>
          <button className="control-button" type="button" onClick={store.stepForward}>
            Step ⟳
          </button>
        </div>
        <div className="button-row">
          <button className="control-button" type="button" onClick={store.jumpToPerihelion}>
            Perihelion
          </button>
          <button className="control-button" type="button" onClick={store.jumpToAphelion}>
            Aphelion
          </button>
          <button className="control-button" type="button" onClick={store.jumpOnePeriod}>
            +1 orbit
          </button>
        </div>
        <div className="button-row">
          <button className="control-button" type="button" onClick={store.jumpToRandomPosition}>
            Random position
          </button>
          <label className="checkbox-field">
            <input
              type="checkbox"
              checked={store.slowMotionEnabled}
              onChange={(event) => store.setSlowMotionEnabled(event.currentTarget.checked)}
            />
            Slow-mo at extremes
          </label>
        </div>
        <label className="select-field">
          Speed preset
          <select
            value={String(store.speedDaysPerSecond)}
            onChange={(event) => store.setSpeed(Number(event.currentTarget.value))}
          >
            {SPEED_PRESETS.map((preset) => (
              <option key={preset.label} value={preset.daysPerSecond}>
                {preset.label}
              </option>
            ))}
            {SPEED_PRESETS.every((preset) => preset.daysPerSecond !== store.speedDaysPerSecond) ? (
              <option value={store.speedDaysPerSecond}>
                Custom ({formatFixed(store.speedDaysPerSecond, 3)} d/s)
              </option>
            ) : null}
          </select>
        </label>
        <div className="range-field">
          <label>
            <span>Speed</span>
            <span>{formatFixed(store.speedDaysPerSecond, 2)} days/s</span>
          </label>
          <input
            type="range"
            min={Math.log10(MIN_SPEED_DAYS_PER_SECOND)}
            max={Math.log10(MAX_SPEED_DAYS_PER_SECOND)}
            step={0.01}
            value={Math.log10(store.speedDaysPerSecond)}
            onChange={(event) => store.setSpeed(Math.pow(10, Number(event.currentTarget.value)))}
            aria-label="Simulation speed"
          />
        </div>
        <div className="button-row">
          <input
            className="text-input"
            type="number"
            inputMode="decimal"
            placeholder="Custom d/s"
            value={customSpeed}
            min={MIN_SPEED_DAYS_PER_SECOND}
            max={MAX_SPEED_DAYS_PER_SECOND}
            onChange={(event) => setCustomSpeed(event.currentTarget.value)}
            aria-label="Custom simulation speed in days per second"
          />
          <button className="control-button" type="button" onClick={applyCustomSpeed}>
            Apply
          </button>
        </div>
      </section>

      <section className="panel-section" aria-label="Planet selection">
        <strong>Planets</strong>
        <div className="planet-list">
          {PLANETS.map((planet) => (
            <button
              key={planet.id}
              type="button"
              className="planet-button"
              aria-current={planet.id === store.selectedPlanetId}
              onClick={() => store.selectPlanet(planet.id)}
            >
              <span className="planet-dot" style={{ background: planet.color }} />
              <span>
                {planet.symbol} {planet.name}
              </span>
              <span
                className="hide-planet"
                role="button"
                tabIndex={0}
                aria-label={
                  store.hiddenPlanetIds.includes(planet.id)
                    ? `Show ${planet.name}`
                    : `Hide ${planet.name}`
                }
                onClick={(event) => {
                  event.stopPropagation();
                  store.togglePlanetHidden(planet.id);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    event.stopPropagation();
                    store.togglePlanetHidden(planet.id);
                  }
                }}
              >
                {store.hiddenPlanetIds.includes(planet.id) ? "◌" : "●"}
              </span>
            </button>
          ))}
        </div>
        <div className="button-row">
          <button className="control-button" type="button" onClick={store.focusCameraOnSelected}>
            Focus camera
          </button>
          <label className="checkbox-field">
            <input
              type="checkbox"
              checked={store.followSelectedPlanet}
              onChange={(event) => store.setFollowSelectedPlanet(event.currentTarget.checked)}
            />
            Follow
          </label>
          <label className="checkbox-field">
            <input
              type="checkbox"
              checked={store.isolateSelectedOrbit}
              onChange={(event) => store.setIsolateSelectedOrbit(event.currentTarget.checked)}
            />
            Isolate
          </label>
        </div>
        <button className="control-button" type="button" onClick={store.resetPlanetVisibility}>
          Reset visibility
        </button>
      </section>

      <section className="panel-section" aria-label="Preset experiments">
        <strong>Experiments</strong>
        <div className="experiment-list">
          {EXPERIMENTS.map((experiment) => (
            <button
              key={experiment.id}
              type="button"
              className="planet-button"
              aria-current={store.activeExperiment === experiment.id}
              title={experiment.description}
              onClick={() => store.applyExperiment(experiment.id)}
            >
              <span>{experiment.title}</span>
            </button>
          ))}
        </div>
        {store.activeExperiment ? (
          <button className="control-button" type="button" onClick={store.clearExperiment}>
            Clear experiment
          </button>
        ) : null}
      </section>

      {TOGGLE_GROUPS.map((group) => (
        <section className="panel-section" key={group.title} aria-label={group.title}>
          <strong>{group.title}</strong>
          <div className="toggle-grid">
            {group.items.map((item) => (
              <label className="checkbox-field" key={item.key}>
                <input
                  type="checkbox"
                  checked={store.toggles[item.key]}
                  onChange={(event) => store.setToggle(item.key, event.currentTarget.checked)}
                />
                {item.label}
              </label>
            ))}
          </div>
        </section>
      ))}

      <section className="panel-section" aria-label="Scaling controls">
        <strong>Scaling</strong>
        <label className="select-field">
          Distance mode
          <select
            value={store.scaling.mode}
            onChange={(event) =>
              store.setScaling({ mode: event.currentTarget.value as DistanceScaleMode })
            }
          >
            {SCALE_MODES.map((mode) => (
              <option key={mode.id} value={mode.id}>
                {mode.label}
              </option>
            ))}
          </select>
        </label>
        <RangeSetting
          label="Distance scale"
          value={store.scaling.distanceScale}
          min={0.2}
          max={3}
          step={0.05}
          onChange={(value) => store.setScaling({ distanceScale: value })}
        />
        <RangeSetting
          label="Planet radius scale"
          value={store.scaling.planetRadiusScale}
          min={0.2}
          max={6}
          step={0.1}
          onChange={(value) => store.setScaling({ planetRadiusScale: value })}
        />
        <RangeSetting
          label="Sun radius scale"
          value={store.scaling.sunRadiusScale}
          min={0.2}
          max={4}
          step={0.1}
          onChange={(value) => store.setScaling({ sunRadiusScale: value })}
        />
        <RangeSetting
          label="Vector scale"
          value={store.scaling.vectorScale}
          min={0.2}
          max={5}
          step={0.1}
          onChange={(value) => store.setScaling({ vectorScale: value })}
        />
        <RangeSetting
          label="Trail length"
          value={store.scaling.trailLength}
          min={10}
          max={2000}
          step={10}
          onChange={(value) => store.setScaling({ trailLength: value })}
        />
      </section>

      <section className="panel-section" aria-label="Camera controls">
        <strong>Camera</strong>
        <div className="button-row">
          {CAMERA_VIEWS.map((view) => (
            <button
              key={view.id}
              className="control-button"
              type="button"
              aria-pressed={store.cameraView === view.id}
              onClick={() => store.setCameraView(view.id)}
            >
              {view.label}
            </button>
          ))}
        </div>
        <p className="disclosure">
          Drag to orbit, right-drag to pan, scroll to zoom. Camera moves never modify physics
          state.
        </p>
      </section>
    </div>
  );
}

function RangeSetting({
  label,
  value,
  min,
  max,
  step,
  onChange
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="range-field">
      <label>
        <span>{label}</span>
        <span>{formatFixed(value, step < 1 ? 2 : 0)}</span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.currentTarget.value))}
        aria-label={label}
      />
    </div>
  );
}
