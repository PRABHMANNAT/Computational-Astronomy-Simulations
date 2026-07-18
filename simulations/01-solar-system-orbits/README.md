# Solar System Orbit Simulator

An interactive, scientifically grounded 3D laboratory for exploring the orbits of the eight major
planets: Keplerian orbital mechanics, live physics measurements, energy and angular-momentum
analysis, Kepler's three laws, phase-based learning and automated physics validation.

Created and developed by Prabhmannat Singh.

---

## 1. Overview

This simulation renders the Sun and the eight planets in 3D and drives every planet with an
independent Sun–planet two-body (Keplerian) solution. It is not just an animation: every frame the
application solves Kepler's equation to a 10⁻¹² residual, derives exact state vectors, and exposes
the resulting distances, speeds, forces, energies and angular momenta as live, unit-aware
measurements, synchronized graphs and educational explanations.

## 2. Features

- Interactive 3D scene (Three.js / React Three Fiber) with orbit paths, labels, trails, vectors,
  markers, foci, equal-area sectors, habitable-zone overlay and background stars
- Full time control: play/pause, reset, reverse time, step, jump to perihelion/aphelion, jump one
  orbit, five speed presets plus a bounded custom speed, optional slow motion at orbit extremes
- Elliptical orbits with real eccentricities and 3D inclinations (Ω, i, ω rotations)
- Live measurement panel with selectable units (AU/km/m, days/hours/years, km/s / m/s, deg/rad)
- Physics analysis: vis-viva velocity, gravitational force/acceleration, centripetal comparison,
  specific orbital energy with cross-checks, analytical vs vector angular momentum
- Dedicated demonstrations of all three Kepler laws, including equal-time swept-area sectors and a
  T² vs a³ comparison across all planets
- Seven-phase learning mode with automatic phase detection and an exportable (JSON/CSV)
  orbit-completion report
- Two-planet comparison with a perihelion "race mode"
- Six preset experiments (Mercury eccentricity, Earth circularity, inner vs outer planets, Kepler
  II, Kepler III, energy exchange)
- Numerical-accuracy dashboard with documented error thresholds
- 84 automated physics validation tests (Vitest)

## 3. Screenshots

_Screenshots placeholder — run the app locally and capture the 3D laboratory view._

## 4. Installation

From the repository root:

```bash
npm install
```

The simulation is the `@astro-sim/solar-system-orbits` workspace package, consumed by the
`@astro-sim/web` Next.js app.

## 5. Development commands

```bash
npm run dev        # start the Next.js dev server (dashboard + simulation)
npm run build      # production build
npm test           # run all Vitest suites
npm run typecheck  # strict TypeScript check
npm run lint       # ESLint over the simulations workspace
npm run format     # Prettier check
```

Open http://localhost:3000/simulations/01-solar-system-orbits after `npm run dev`.

## 6. Architecture

```text
src/
├── data/        planetary dataset, physical constants, preset experiments
├── types/       PlanetaryData, SI orbital elements, simulation state types
├── physics/     pure, React-free physics engine (fully unit tested)
├── utils/       unit conversions, formatting, ring buffer, numerical helpers
├── simulation/  clock (outside React), Zustand store, phase detection, camera poses
├── hooks/       React bindings: throttled clock mirror, live measurements
└── components/  3D scene + UI panels (presentation only)
```

Design rules:

- **Physics is framework-free.** Nothing in `src/physics` imports React or Three.js, so the entire
  engine is unit-testable in Node.
- **The clock lives outside React.** `simulationClock` is a plain observable advanced inside the
  render loop; UI panels mirror it at ~8 Hz, so animation never re-renders React at 60 fps.
- **Graphs are bounded.** Time series live in a fixed-capacity ring buffer (configurable, default
  600 samples) polled by the graph panel at 2 Hz.

## 7. Planetary dataset

Each planet carries mass, radius, density, surface gravity, escape velocity, the six mean orbital
elements (a, e, i, Ω, ω, M₀), orbital period, rotation period, axial tilt, perihelion/aphelion
distances, mean orbital speed, moon count and a description. Core orbital values:

| Planet  | a (AU)  | e      | T (days)  | i       |
| ------- | ------- | ------ | --------- | ------- |
| Mercury | 0.3871  | 0.2056 | 87.969    | 7.005°  |
| Venus   | 0.7233  | 0.0068 | 224.701   | 3.394°  |
| Earth   | 1.0000  | 0.0167 | 365.256   | 0.000°  |
| Mars    | 1.5237  | 0.0934 | 686.980   | 1.850°  |
| Jupiter | 5.2028  | 0.0489 | 4332.59   | 1.303°  |
| Saturn  | 9.5388  | 0.0565 | 10759.22  | 2.485°  |
| Uranus  | 19.1914 | 0.0472 | 30688.5   | 0.773°  |
| Neptune | 30.0611 | 0.0086 | 60182     | 1.770°  |

These are approximate epoch-mean elements (NASA fact-sheet style values), **not** continuously
updated ephemerides.

## 8. Units

SI units (metres, seconds, kilograms, radians) are used internally everywhere. AU, days and
degrees appear only at the display/input boundary (`utils/units.ts`). Physical constants live in a
single file, `data/constants.ts`:

```ts
GRAVITATIONAL_CONSTANT = 6.6743e-11   // m³ kg⁻¹ s⁻²
SOLAR_MASS_KG          = 1.98847e30
ASTRONOMICAL_UNIT_M    = 1.495978707e11
DAY_SECONDS            = 86400
SOLAR_MU               = G · M☉
```

## 9. Mathematical model

Mean motion and mean anomaly:

```text
n = 2π / T
M(t) = M₀ + n·(t − t₀),   normalized to 0 ≤ M < 2π
```

## 10. Kepler-equation solution

`M = E − e·sin E` is solved with Newton–Raphson:

```text
Eₙ₊₁ = Eₙ − [Eₙ − e·sin Eₙ − M] / [1 − e·cos Eₙ]
```

- tolerance 10⁻¹², iteration cap 30 (guaranteed termination)
- initial guess `E₀ = M` (e < 0.8) or `E₀ = π` (high e)
- invalid eccentricities (e < 0 or e ≥ 1) and non-finite anomalies throw controlled errors
- every solve returns `{ eccentricAnomalyRad, iterations, residual, converged }` and the metadata
  is displayed in the Numerical Accuracy tab

True anomaly uses the numerically stable half-angle form:

```text
ν = 2·atan2(√(1+e)·sin(E/2), √(1−e)·cos(E/2))
```

## 11. Orbital coordinate calculation

Orbital-plane position `x = a(cos E − e)`, `y = a√(1−e²)·sin E` is rotated into heliocentric
ecliptic coordinates by the classical sequence Rz(Ω)·Rx(i)·Rz(ω) — the standard expansion

```text
x = r[cos Ω·cos(ω+ν) − sin Ω·sin(ω+ν)·cos i]
y = r[sin Ω·cos(ω+ν) + cos Ω·sin(ω+ν)·cos i]
z = r[sin(ω+ν)·sin i]
```

expressed as composed axis rotations so the same transform applies to velocity vectors. The radius
is computed as `r = a(1 − e·cos E)` in production and cross-validated against
`r = a(1 − e²)/(1 + e·cos ν)` in the accuracy panel and tests.

## 12. Velocity calculation

Perifocal velocity comes from the time derivative of the position,
`vx = −(n·a²/r)·sin E`, `vy = (n·a²/r)·√(1−e²)·cos E`, with `n = √(μ/a³)` so state vectors are
exactly consistent with the vis-viva equation

```text
v = √[μ·(2/r − 1/a)]
v_perihelion = √[μ(1+e) / (a(1−e))],   v_aphelion = √[μ(1−e) / (a(1+e))]
```

Radial and transverse components are derived from r⃗·v⃗. Speeds display in both m/s and km/s.

## 13. Gravitational-force calculation

```text
F = G·M☉·m / r²      (toward the Sun)
a_g = μ / r²
a_c ≈ v² / r         (educational centripetal comparison)
```

For a circular orbit a_g = a_c exactly; on an ellipse they differ — the UI explains why and never
claims constant centripetal acceleration on an ellipse. A toggleable, visually scaled force vector
is drawn for the selected planet.

## 14. Energy analysis

```text
ε = v²/2 − μ/r  =  −μ/(2a)      (cross-checked every update)
E_total = m·ε
```

Kinetic, potential and total specific energies are displayed and plotted against time; the total
stays flat while kinetic and potential trade places through the orbit.

## 15. Angular-momentum analysis

```text
h = √[μ·a·(1 − e²)]   (analytical)
h⃗ = r⃗ × v⃗            (state vectors)
```

Magnitude, direction and the relative difference between the two computations are shown, with a
toggleable angular-momentum vector in the scene.

## 16. Kepler's three laws

1. **First law** — ellipse geometry with the Sun at one focus; optional markers for both foci, the
   apse line, perihelion and aphelion; `b = a√(1−e²)`, `c = a·e`.
2. **Second law** — a dedicated mode draws 4–12 *equal-time* sectors, lists each sector's
   numerically integrated area against the exact `h/2·Δt`, and shows the speed at each sector
   boundary (fast near perihelion, slow near aphelion). `dA/dt = h/2`.
3. **Third law** — per-planet `T²/a³` table (≈1 yr²/AU³), dataset vs computed period with
   percentage difference, system-wide average, and a log-log `T²` vs `a³` graph with a
   proportional fit.

## 17. Simulation phases

Seven phases with automatic detection for the selected planet:

1. Initial conditions (elements, epoch state; perihelion/aphelion/random start presets)
2. Orbital acceleration (gravity curving the trajectory)
3. Approaching perihelion — triggered while inbound within `r ≤ r_p + 0.20(r_a − r_p)`
4. Perihelion passage — `|r − r_p|/r_p < 0.01`, optional slow motion
5. Moving toward aphelion (decelerating outbound)
6. Aphelion passage — `|r − r_a|/r_a < 0.01`, optional slow motion
7. Orbit completion — report with simulated vs expected period, timing error, energy and
   angular-momentum drift, min/max distance and speed, sample count, average solver iterations and
   max residual; exportable as JSON or CSV

## 18. Controls

- **Time**: play, pause, reset, reverse, step ±T/360, jump to perihelion/aphelion, +1 orbit,
  random position, speed presets (1 h/s … 365 d/s) and bounded custom speed
- **Planets**: select, hide/show, isolate orbit, reset visibility, focus camera, follow, compare
- **Visualization**: 18 toggles (paths, labels, trails, grid, axes, plane, four vectors, markers,
  foci, apse line, sectors, habitable zone, rotation, stars)
- **Scaling**: distance mode (linear/compressed/logarithmic/educational/real) plus separate
  distance, planet-radius, Sun-radius, vector and trail-length scales — all sanitized against
  invalid values
- **Camera**: orbit/pan/zoom, top/side/ecliptic/selected-orbit/default views; camera state never
  touches physics

## 19. Preset experiments

A — Mercury's eccentric orbit · B — Earth's nearly circular orbit · C — inner vs outer planets ·
D — Kepler's second law · E — Kepler's third law · F — energy exchange.

## 20. Numerical methods

- Newton–Raphson with residual tracking and iteration caps
- Relative error `|calc − expected| / max(|expected|, 10⁻³⁰)` with statuses: excellent < 10⁻¹⁰,
  acceptable < 10⁻⁷, warning < 10⁻⁴, invalid ≥ 10⁻⁴
- Frame deltas clamped to 100 ms so background tabs cannot explode high-speed simulations
- Ring-buffer time series; shoelace polygon areas for sector cross-checks; least-squares
  proportional fit for the third-law graph

## 21. Validation tests

`tests/` contains 84 assertions across seven suites: Kepler solver (circular, Earth-like,
Mercury-like, extreme e, anomalies near 0/π/2π, invalid input rejection), radius equations at
perihelion/aphelion and cross-form agreement, vis-viva ranges and state-vector consistency,
orbital-period scaling (a^3/2, Earth ≈ 1 yr, Neptune > Jupiter), energy negativity/constancy/
cross-checks, angular-momentum closed form/vector agreement/conservation/orthogonality, coordinate
transforms (planar zero-inclination, non-zero z when inclined, rotation isometry, deg/rad),
scaling sanitization, accuracy classification, ring buffer bounds, and simulation state (pause,
reset, reverse, jumps, planet selection preserving time) plus React Testing Library component
tests for the control panel.

## 22. Scientific assumptions

- Independent Sun–planet two-body solutions; the Sun is fixed at the origin
- Orbital elements fixed at an approximate mean epoch
- Newtonian gravity only

## 23. Known limitations

- No planet–planet perturbations, no general relativity (Mercury's 43″/century perihelion
  precession absent), no barycentric Sun motion, no long-term precession
- Planet sizes enlarged and distances optionally compressed for visibility
- Axial rotation is visual only; colors are illustrative
- Not suitable for mission navigation or precision ephemerides
- Repository note: the dashboard's typed metadata schema requires
  `status: "implemented"` / lowercase difficulty, so `metadata.json` uses those values (a superset
  of the specified fields, keeping the monorepo dashboard functional).

## 24. Future improvements

- Optional experimental N-body mode (velocity Verlet / RK4) with mutual gravity, barycentric Sun
  motion, configurable time steps and drift monitoring
- Earth's Moon, asteroid-belt visualization, optional Pluto layer
- Photometric textures and eclipse/transit geometry

## 25. Attribution

Created and developed by Prabhmannat Singh.

## 26. License

Copyright 2026 Prabhmannat Singh
Licensed under the Apache License 2.0.
