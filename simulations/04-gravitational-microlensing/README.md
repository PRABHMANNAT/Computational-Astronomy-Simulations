# Gravitational Microlensing

Status: planned.

## Scope

Model a simplified point-lens microlensing event and the resulting source magnification curve.

## Planned Architecture

- `src/physics` - Einstein radius and magnification equations.
- `src/simulation` - lens-source separation over time.
- `src/components` - alignment view and light-curve chart.
- `src/data` - example lensing scenarios.

## Development Checklist

- [ ] Define point-lens equations
- [ ] Implement magnification curve
- [ ] Add alignment visualization
- [ ] Add parameter controls
- [ ] Add tests for magnification behavior
- [ ] Document assumptions
