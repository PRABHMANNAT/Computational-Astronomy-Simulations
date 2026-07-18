# Astronomy-and-Astrophysics-Simulations

Open-source computational astronomy and astrophysics simulations developed by Prabhmannat Singh.

Copyright 2026 Prabhmannat Singh

Licensed under the Apache License, Version 2.0.

## Project Scope

This repository is a TypeScript monorepo for interactive astronomy simulations. The main website is built with Next.js, simulation rendering can use Three.js, React Three Fiber, HTML Canvas, or SVG depending on the problem, and unit tests use Vitest.

The first simulation, Solar System Orbit Simulator, is implemented as the architectural reference. The remaining simulations are intentionally planned only, with folders, metadata, README outlines, and implementation checklists prepared for later work.

No black-hole simulation is included in this repository.

## Workspace Layout

- `apps/web` - Next.js dashboard and route host for simulations.
- `packages/physics-engine` - Shared constants and physics primitives.
- `packages/orbital-mechanics` - Reusable orbital calculation utilities.
- `packages/visualization-engine` - Shared rendering scale helpers.
- `packages/simulation-ui` - Shared UI primitives for simulation controls.
- `packages/astronomy-data` - Curated astronomy datasets.
- `packages/shared-utils` - Cross-package types and helpers.
- `simulations/*` - Individual simulation modules.

## Simulations

1. `01-solar-system-orbits` - Solar System Orbit Simulator
2. `02-exoplanet-transit` - Exoplanet Transit Simulator
3. `03-exoplanet-atmosphere-spectrum` - Exoplanet Atmosphere Spectrum
4. `04-gravitational-microlensing` - Gravitational Microlensing
5. `05-galaxy-collision` - Galaxy Collision
6. `06-stellar-evolution` - Stellar Evolution
7. `07-supernova-explosion` - Supernova Explosion
8. `08-pulsar-beam` - Pulsar Beam
9. `09-binary-star-system` - Binary Star System
10. `10-variable-star-light-curve` - Variable Star Light Curve
11. `11-protoplanetary-disk` - Protoplanetary Disk
12. `12-planet-formation` - Planet Formation
13. `13-asteroid-belt-dynamics` - Asteroid Belt Dynamics
14. `14-comet-orbit-and-tail` - Comet Orbit and Tail
15. `15-meteor-shower` - Meteor Shower
16. `16-roche-limit-disruption` - Roche Limit Disruption
17. `17-tidal-locking` - Tidal Locking
18. `18-aurora-and-solar-wind` - Aurora and Solar Wind
19. `19-cosmic-web-formation` - Cosmic Web Formation
20. `20-habitable-zone-explorer` - Habitable Zone Explorer

## Getting Started

```bash
npm install
npm run dev
```

Run tests:

```bash
npm test
```

Build the website:

```bash
npm run build
```

## Scientific Disclosure

The reference Solar System simulation uses scientifically reasonable relative orbital periods and simple Keplerian ellipses. Planet sizes and orbital distances are visually scaled so the system remains readable on screen. It is not a high-precision ephemeris.
