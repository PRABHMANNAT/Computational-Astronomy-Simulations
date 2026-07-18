# Pulsar Beam

Status: planned.

## Scope

Visualize a rotating neutron star beam and the observed pulse profile for a chosen viewing geometry.

## Planned Architecture

- `src/physics` - rotation and beam intersection helpers.
- `src/simulation` - pulse phase state.
- `src/components` - 3D beam scene and profile chart.
- `src/data` - pulsar presets.

## Development Checklist

- [ ] Define beam geometry
- [ ] Implement pulse profile
- [ ] Add 3D renderer
- [ ] Add viewing angle controls
- [ ] Add tests for phase calculations
- [ ] Document simplifications
