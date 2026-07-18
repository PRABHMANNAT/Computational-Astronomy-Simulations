# Exoplanet Transit Simulator

Status: planned.

## Scope

Model the brightness dip created when an exoplanet transits in front of its host star.

## Planned Architecture

- `src/physics` - transit geometry, stellar radius, planet radius, inclination, and limb darkening approximations.
- `src/simulation` - time-stepped transit state.
- `src/components` - chart and controls.
- `src/data` - sample stellar and planetary systems.

## Development Checklist

- [ ] Define transit equations and assumptions
- [ ] Implement light-curve calculations
- [ ] Add SVG or Canvas visualization
- [ ] Add adjustable orbital inclination and radius controls
- [ ] Add tests for transit depth and duration
- [ ] Document limitations
