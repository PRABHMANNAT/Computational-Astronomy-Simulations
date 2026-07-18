# Supernova Explosion

Status: planned.

## Scope

Visualize expanding ejecta shells and a simplified supernova light curve.

## Planned Architecture

- `src/physics` - expansion velocity and luminosity decay approximations.
- `src/simulation` - ejecta and light-curve state.
- `src/components` - explosion view and chart.
- `src/data` - supernova type presets.

## Development Checklist

- [ ] Define ejecta model
- [ ] Implement light-curve approximation
- [ ] Add renderer
- [ ] Add preset controls
- [ ] Add tests for expansion state
- [ ] Document limitations
