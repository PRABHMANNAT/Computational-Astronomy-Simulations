"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { PLANETS } from "../data/planetaryData";
import { graphHistory } from "../hooks/useSimulationClock";
import { useSelectedPlanet } from "../hooks/useSelectedPlanet";
import { proportionalFit } from "../utils/numericalMethods";
import { formatFixed } from "../utils/formatting";
import { metresToAu } from "../utils/units";
import { perihelionDistance, aphelionDistance } from "../physics/orbitalElements";
import type { GraphSample } from "../types/simulation";

const GRAPH_POLL_MS = 500;

const AXIS_STYLE = { fontSize: 11, fill: "#9ca8b8" };
const GRID_STROKE = "#263142";

function useGraphSamples(): GraphSample[] {
  const [samples, setSamples] = useState<GraphSample[]>([]);
  useEffect(() => {
    let lastVersion = -1;
    const interval = setInterval(() => {
      if (graphHistory.version !== lastVersion) {
        lastVersion = graphHistory.version;
        setSamples(graphHistory.toArray());
      }
    }, GRAPH_POLL_MS);
    return () => clearInterval(interval);
  }, []);
  return samples;
}

function ChartBlock({ title, children }: { title: string; children: React.ReactElement }) {
  return (
    <div className="chart-block">
      <p className="chart-title">{title}</p>
      <div className="chart-body">
        <ResponsiveContainer width="100%" height={220}>
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/** Synchronized time-series and comparison graphs for the selected planet. */
export function OrbitalGraphPanel() {
  const samples = useGraphSamples();
  const { planet, elements } = useSelectedPlanet();

  const perihelionAU = metresToAu(perihelionDistance(elements.semiMajorAxisM, elements.eccentricity));
  const aphelionAU = metresToAu(aphelionDistance(elements.semiMajorAxisM, elements.eccentricity));

  const forceVsDistance = useMemo(
    () =>
      [...samples]
        .sort((a, b) => a.radiusAU - b.radiusAU)
        .map((sample) => ({ radiusAU: sample.radiusAU, forceN: sample.forceN })),
    [samples]
  );

  const thirdLawData = useMemo(
    () =>
      PLANETS.map((entry) => ({
        name: entry.name,
        a3: Math.pow(entry.semiMajorAxisAU, 3),
        t2: Math.pow(entry.orbitalPeriodDays / 365.25, 2)
      })),
    []
  );
  const thirdLawSlope = useMemo(
    () => proportionalFit(thirdLawData.map((point) => ({ x: point.a3, y: point.t2 }))),
    [thirdLawData]
  );

  if (samples.length < 2) {
    return (
      <div className="panel-section">
        <strong>Graphs</strong>
        <p className="disclosure">
          Play the simulation to accumulate samples for {planet.name}. Series use a bounded ring
          buffer, so long runs never grow memory.
        </p>
      </div>
    );
  }

  const timeFormatter = (value: number) => formatFixed(value, 0);

  return (
    <div className="graph-grid">
      <ChartBlock title={`Distance vs time — ${planet.name} (AU)`}>
        <LineChart data={samples}>
          <CartesianGrid stroke={GRID_STROKE} strokeDasharray="4 4" />
          <XAxis dataKey="timeDays" tick={AXIS_STYLE} tickFormatter={timeFormatter} label={{ value: "t (days)", position: "insideBottomRight", offset: -4, ...AXIS_STYLE }} />
          <YAxis tick={AXIS_STYLE} domain={[perihelionAU * 0.98, aphelionAU * 1.02]} tickFormatter={(v: number) => formatFixed(v, 3)} />
          <Tooltip formatter={(value) => [`${formatFixed(Number(value), 5)} AU`, "r"]} labelFormatter={(label) => `t = ${formatFixed(Number(label), 1)} d`} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Line type="monotone" dataKey="radiusAU" name="distance r" stroke="#7dd3fc" dot={false} isAnimationActive={false} />
          <Line type="monotone" dataKey={() => perihelionAU} name={`perihelion ${formatFixed(perihelionAU, 3)} AU`} stroke="#4ade80" strokeDasharray="6 4" dot={false} isAnimationActive={false} />
          <Line type="monotone" dataKey={() => aphelionAU} name={`aphelion ${formatFixed(aphelionAU, 3)} AU`} stroke="#f87171" strokeDasharray="6 4" dot={false} isAnimationActive={false} />
        </LineChart>
      </ChartBlock>

      <ChartBlock title={`Orbital speed vs time — ${planet.name} (km/s)`}>
        <LineChart data={samples}>
          <CartesianGrid stroke={GRID_STROKE} strokeDasharray="4 4" />
          <XAxis dataKey="timeDays" tick={AXIS_STYLE} tickFormatter={timeFormatter} />
          <YAxis tick={AXIS_STYLE} domain={["auto", "auto"]} tickFormatter={(v: number) => formatFixed(v, 2)} />
          <Tooltip formatter={(value) => [`${formatFixed(Number(value), 4)} km/s`, "v"]} labelFormatter={(label) => `t = ${formatFixed(Number(label), 1)} d`} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Line type="monotone" dataKey="speedKMS" name="orbital speed (max at perihelion, min at aphelion)" stroke="#4ade80" dot={false} isAnimationActive={false} />
        </LineChart>
      </ChartBlock>

      <ChartBlock title={`Specific energy vs time — ${planet.name} (J/kg)`}>
        <LineChart data={samples}>
          <CartesianGrid stroke={GRID_STROKE} strokeDasharray="4 4" />
          <XAxis dataKey="timeDays" tick={AXIS_STYLE} tickFormatter={timeFormatter} />
          <YAxis tick={AXIS_STYLE} tickFormatter={(v: number) => v.toExponential(1)} width={72} />
          <Tooltip formatter={(value, name) => [`${Number(value).toExponential(4)} J/kg`, String(name)]} labelFormatter={(label) => `t = ${formatFixed(Number(label), 1)} d`} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Line type="monotone" dataKey="kineticJPerKg" name="kinetic" stroke="#4ade80" dot={false} isAnimationActive={false} />
          <Line type="monotone" dataKey="potentialJPerKg" name="potential" stroke="#f87171" dot={false} isAnimationActive={false} />
          <Line type="monotone" dataKey="totalJPerKg" name="total (conserved)" stroke="#facc15" dot={false} isAnimationActive={false} />
        </LineChart>
      </ChartBlock>

      <ChartBlock title={`Gravitational force vs distance — ${planet.name} (inverse square)`}>
        <LineChart data={forceVsDistance}>
          <CartesianGrid stroke={GRID_STROKE} strokeDasharray="4 4" />
          <XAxis dataKey="radiusAU" tick={AXIS_STYLE} tickFormatter={(v: number) => formatFixed(v, 3)} label={{ value: "r (AU)", position: "insideBottomRight", offset: -4, ...AXIS_STYLE }} />
          <YAxis tick={AXIS_STYLE} tickFormatter={(v: number) => v.toExponential(1)} width={72} />
          <Tooltip formatter={(value) => [`${Number(value).toExponential(4)} N`, "F"]} labelFormatter={(label) => `r = ${formatFixed(Number(label), 4)} AU`} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Line type="monotone" dataKey="forceN" name="F = GM☉m/r²" stroke="#f87171" dot={false} isAnimationActive={false} />
        </LineChart>
      </ChartBlock>

      <ChartBlock title={`True anomaly vs time — ${planet.name} (non-uniform angular motion)`}>
        <LineChart data={samples}>
          <CartesianGrid stroke={GRID_STROKE} strokeDasharray="4 4" />
          <XAxis dataKey="timeDays" tick={AXIS_STYLE} tickFormatter={timeFormatter} />
          <YAxis tick={AXIS_STYLE} domain={[0, 360]} ticks={[0, 90, 180, 270, 360]} />
          <Tooltip formatter={(value) => [`${formatFixed(Number(value), 2)}°`, "ν"]} labelFormatter={(label) => `t = ${formatFixed(Number(label), 1)} d`} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Line type="monotone" dataKey="trueAnomalyDeg" name="true anomaly ν (deg)" stroke="#c084fc" dot={false} isAnimationActive={false} />
        </LineChart>
      </ChartBlock>

      <ChartBlock title={`Kepler's third law — T² vs a³ (slope ≈ ${formatFixed(thirdLawSlope, 4)} yr²/AU³)`}>
        <ScatterChart>
          <CartesianGrid stroke={GRID_STROKE} strokeDasharray="4 4" />
          <XAxis type="number" dataKey="a3" name="a³" tick={AXIS_STYLE} scale="log" domain={["auto", "auto"]} tickFormatter={(v: number) => v.toExponential(0)} label={{ value: "a³ (AU³)", position: "insideBottomRight", offset: -4, ...AXIS_STYLE }} />
          <YAxis type="number" dataKey="t2" name="T²" tick={AXIS_STYLE} scale="log" domain={["auto", "auto"]} tickFormatter={(v: number) => v.toExponential(0)} width={64} />
          <Tooltip
            formatter={(value, name) => [Number(value).toExponential(3), String(name)]}
            labelFormatter={() => ""}
            content={({ payload }) =>
              payload && payload.length > 0 ? (
                <div className="chart-tooltip">
                  <strong>{(payload[0].payload as { name: string }).name}</strong>
                  <div>a³ = {(payload[0].payload as { a3: number }).a3.toExponential(3)} AU³</div>
                  <div>T² = {(payload[0].payload as { t2: number }).t2.toExponential(3)} yr²</div>
                </div>
              ) : null
            }
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Scatter name="planets (log-log: straight line ⇒ T² ∝ a³)" data={thirdLawData} fill="#7dd3fc" isAnimationActive={false} />
        </ScatterChart>
      </ChartBlock>
    </div>
  );
}
