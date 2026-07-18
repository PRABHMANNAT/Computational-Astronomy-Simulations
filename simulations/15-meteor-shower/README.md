# Meteor Shower

Status: planned.

## Scope

Visualize meteor trails from a radiant point with adjustable activity level.

## Planned Architecture

- `src/physics` - radiant and trail geometry.
- `src/simulation` - meteor event state.
- `src/components` - sky renderer.
- `src/data` - shower presets.

## Development Checklist

- [ ] Define radiant model
- [ ] Implement trail generation
- [ ] Add renderer
- [ ] Add intensity controls
- [ ] Add tests for trail direction
- [ ] Document simplifications
