# Solar System Orbit Simulator

Status: planned metadata with reference implementation available.

This module is the architectural reference for the repository. It separates orbital calculations, simulation state, canvas rendering, UI controls, and static astronomy data.

## Implemented Features

- Sun and eight major planets.
- Animated elliptical orbits.
- Play, pause, reset, speed, zoom, and rotation controls.
- Toggleable orbit paths.
- Planet labels and selectable planet information panel.
- Responsive interface.
- Scientifically reasonable relative orbital periods.
- Disclosure that planet sizes and distances are visually scaled.
- Unit tests for orbital calculations.

## Equations

The simulation uses Keplerian two-body ellipses with fixed orbital elements:

```text
M = 2pi * t / P + phase
M = E - e * sin(E)
x = a * (cos(E) - e)
y = a * sqrt(1 - e^2) * sin(E)
```

Where:

- `M` is mean anomaly.
- `E` is eccentric anomaly.
- `e` is eccentricity.
- `a` is semi-major axis in astronomical units.
- `P` is orbital period in Earth days.

Kepler's equation is solved with Newton-Raphson iteration.

## Limitations

- The Sun is fixed at the origin.
- Planet-planet gravitational perturbations are ignored.
- Inclination, axial tilt, moons, rings, and barycentric motion are omitted.
- Planet sizes and distances are intentionally scaled for readability.
- This is not an ephemeris and should not be used for mission planning.

## Development Checklist

- [x] Physics calculations
- [x] Canvas renderer
- [x] Playback controls
- [x] Planet information panel
- [x] Unit tests
- [ ] Texture assets
- [ ] Optional 3D React Three Fiber renderer
