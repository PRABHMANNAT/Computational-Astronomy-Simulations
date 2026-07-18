# Protoplanetary Disk

Status: planned.

## Scope

Visualize a young-star disk with density gradients, rings, and gaps.

## Planned Architecture

- `src/physics` - disk density and temperature approximations.
- `src/simulation` - disk parameter state.
- `src/components` - 3D disk renderer.
- `src/data` - disk presets.

## Development Checklist

- [ ] Define density model
- [ ] Implement disk state
- [ ] Add 3D renderer
- [ ] Add ring and gap controls
- [ ] Add tests for radial density
- [ ] Document assumptions
