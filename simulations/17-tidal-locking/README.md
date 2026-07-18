# Tidal Locking

Status: planned.

## Scope

Visualize spin-orbit synchronization and the path toward a tidally locked state.

## Planned Architecture

- `src/physics` - rotation and orbital phase helpers.
- `src/simulation` - spin state.
- `src/components` - orbit and body orientation renderer.
- `src/data` - body presets.

## Development Checklist

- [ ] Define spin-orbit model
- [ ] Implement locked orientation
- [ ] Add renderer
- [ ] Add period controls
- [ ] Add tests for synchronization
- [ ] Document limits
