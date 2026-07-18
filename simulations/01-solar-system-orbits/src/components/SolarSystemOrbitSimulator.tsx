"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { formatNumber } from "@astro-sim/shared-utils";
import { projectAuToScreen } from "@astro-sim/visualization-engine";
import { planets } from "../data/planets";
import { useAnimationClock } from "../hooks/useAnimationClock";
import { calculatePlanetPosition } from "../physics/orbits";
import { getPlanetPositions } from "../simulation/solarSystemState";
import { scaleAuCoordinate, scalePlanetRadius } from "../utils/scaling";

const DEFAULT_TIME_SCALE = 30;

export function SolarSystemOrbitSimulator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [timeScale, setTimeScale] = useState(DEFAULT_TIME_SCALE);
  const [zoom, setZoom] = useState(0.9);
  const [rotation, setRotation] = useState(0);
  const [showOrbits, setShowOrbits] = useState(true);
  const [selectedPlanetName, setSelectedPlanetName] = useState("Earth");
  const { elapsedDays, reset } = useAnimationClock(isPlaying, timeScale);

  const planetPositions = useMemo(() => getPlanetPositions(elapsedDays), [elapsedDays]);
  const selectedPlanet = planetPositions.find(({ planet }) => planet.name === selectedPlanetName);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, rect.width, rect.height);

      const width = rect.width;
      const height = rect.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const maxOrbitPixels = (Math.min(width, height) / 2.22) * zoom;
      const rotationRadians = (rotation * Math.PI) / 180;
      const transform = {
        centerX,
        centerY,
        pixelsPerAu: maxOrbitPixels,
        rotationRadians
      };

      context.fillStyle = "#02040a";
      context.fillRect(0, 0, width, height);
      drawStars(context, width, height);

      if (showOrbits) {
        for (const planet of planets) {
          drawOrbit(context, planet.elements.semiMajorAxisAu, planet.elements.eccentricity, transform);
        }
      }

      const sunGradient = context.createRadialGradient(centerX, centerY, 4, centerX, centerY, 28);
      sunGradient.addColorStop(0, "#fff7c2");
      sunGradient.addColorStop(0.42, "#fbbf24");
      sunGradient.addColorStop(1, "rgba(251, 191, 36, 0)");
      context.fillStyle = sunGradient;
      context.beginPath();
      context.arc(centerX, centerY, 28, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = "#fff7c2";
      context.font = "12px Arial";
      context.fillText("Sun", centerX + 18, centerY - 18);

      for (const { planet, position } of planetPositions) {
        const scaledXAu = scaleAuCoordinate(position.xAu);
        const scaledYAu = scaleAuCoordinate(position.yAu);
        const screen = projectAuToScreen(scaledXAu, scaledYAu, transform);
        const radius = scalePlanetRadius(planet.radiusEarth);

        context.fillStyle = planet.color;
        context.beginPath();
        context.arc(screen.x, screen.y, radius, 0, Math.PI * 2);
        context.fill();

        if (planet.name === selectedPlanetName) {
          context.strokeStyle = "#7dd3fc";
          context.lineWidth = 2;
          context.beginPath();
          context.arc(screen.x, screen.y, radius + 5, 0, Math.PI * 2);
          context.stroke();
        }

        context.fillStyle = "#f4f7fb";
        context.font = "12px Arial";
        context.fillText(planet.name, screen.x + radius + 5, screen.y - radius - 3);
      }
    };

    draw();
    const resizeObserver = new ResizeObserver(draw);
    resizeObserver.observe(canvas);
    return () => resizeObserver.disconnect();
  }, [elapsedDays, planetPositions, rotation, selectedPlanetName, showOrbits, zoom]);

  return (
    <section className="sim-layout" aria-label="Solar System Orbit Simulator">
      <div className="canvas-stage">
        <canvas ref={canvasRef} className="orbit-canvas" aria-label="Animated solar system orbit canvas" />
      </div>

      <aside className="control-panel" aria-label="Simulation controls">
        <div className="panel-section">
          <div className="button-row">
            <button className="control-button primary" type="button" onClick={() => setIsPlaying((value) => !value)}>
              {isPlaying ? "Pause" : "Play"}
            </button>
            <button className="control-button" type="button" onClick={reset}>
              Reset
            </button>
            <button className="control-button" type="button" onClick={() => setShowOrbits((value) => !value)}>
              {showOrbits ? "Hide orbits" : "Show orbits"}
            </button>
          </div>
          <RangeControl
            label="Time scale"
            value={timeScale}
            min={1}
            max={365}
            step={1}
            suffix=" days/s"
            onChange={setTimeScale}
          />
          <RangeControl label="Zoom" value={zoom} min={0.45} max={1.35} step={0.01} onChange={setZoom} />
          <RangeControl
            label="Camera rotation"
            value={rotation}
            min={0}
            max={360}
            step={1}
            suffix=" deg"
            onChange={setRotation}
          />
          <p className="disclosure">
            Elapsed simulation time: {formatNumber(elapsedDays, 1)} Earth days. Planet sizes and distances are visually
            scaled for readability; orbital periods remain relatively proportional.
          </p>
        </div>

        <div className="panel-section">
          <strong>Planets</strong>
          <div className="planet-list">
            {planetPositions.map(({ planet }) => (
              <button
                aria-current={planet.name === selectedPlanetName}
                className="planet-button"
                key={planet.name}
                type="button"
                onClick={() => setSelectedPlanetName(planet.name)}
              >
                <span className="planet-dot" style={{ background: planet.color }} />
                <span>{planet.name}</span>
                <span>{formatNumber(planet.elements.orbitalPeriodDays, 0)} d</span>
              </button>
            ))}
          </div>
        </div>

        {selectedPlanet ? (
          <div className="panel-section">
            <strong>{selectedPlanet.planet.name}</strong>
            <p className="disclosure">{selectedPlanet.planet.summary}</p>
            <div className="info-grid">
              <span>Semi-major axis</span>
              <span>{formatNumber(selectedPlanet.planet.elements.semiMajorAxisAu, 3)} AU</span>
              <span>Eccentricity</span>
              <span>{formatNumber(selectedPlanet.planet.elements.eccentricity, 4)}</span>
              <span>Orbital period</span>
              <span>{formatNumber(selectedPlanet.planet.elements.orbitalPeriodDays, 1)} days</span>
              <span>Current radius</span>
              <span>{formatNumber(selectedPlanet.position.radiusAu, 3)} AU</span>
              <span>Radius</span>
              <span>{formatNumber(selectedPlanet.planet.radiusEarth, 2)} Earth</span>
              <span>Mass</span>
              <span>{formatNumber(selectedPlanet.planet.massEarth, 2)} Earth</span>
            </div>
          </div>
        ) : null}
      </aside>
    </section>
  );
}

function RangeControl({
  label,
  value,
  min,
  max,
  step,
  suffix = "",
  onChange
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  onChange: (value: number) => void;
}) {
  return (
    <div className="range-field">
      <label>
        <span>{label}</span>
        <span>
          {formatNumber(value, step < 1 ? 2 : 0)}
          {suffix}
        </span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.currentTarget.value))}
      />
    </div>
  );
}

function drawStars(context: CanvasRenderingContext2D, width: number, height: number) {
  context.fillStyle = "rgba(244, 247, 251, 0.72)";

  for (let index = 0; index < 90; index += 1) {
    const x = (Math.sin(index * 47.23) * 0.5 + 0.5) * width;
    const y = (Math.cos(index * 31.71) * 0.5 + 0.5) * height;
    const radius = index % 7 === 0 ? 1.4 : 0.8;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();
  }
}

function drawOrbit(
  context: CanvasRenderingContext2D,
  semiMajorAxisAu: number,
  eccentricity: number,
  transform: { centerX: number; centerY: number; pixelsPerAu: number; rotationRadians: number }
) {
  context.strokeStyle = "rgba(156, 168, 184, 0.34)";
  context.lineWidth = 1;
  context.beginPath();

  for (let step = 0; step <= 180; step += 1) {
    const elapsedFraction = step / 180;
    const position = calculatePlanetPosition(elapsedFraction * 365.256, {
      semiMajorAxisAu,
      eccentricity,
      orbitalPeriodDays: 365.256
    });
    const scaledXAu = scaleAuCoordinate(position.xAu);
    const scaledYAu = scaleAuCoordinate(position.yAu);
    const screen = projectAuToScreen(scaledXAu, scaledYAu, transform);

    if (step === 0) {
      context.moveTo(screen.x, screen.y);
    } else {
      context.lineTo(screen.x, screen.y);
    }
  }

  context.closePath();
  context.stroke();
}
