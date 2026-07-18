# Binary Star System

Status: planned.

## Scope

Model two stars orbiting a shared barycenter with adjustable masses and separation.

## Planned Architecture

- `src/physics` - barycenter and orbital period calculations.
- `src/simulation` - binary orbital state.
- `src/components` - orbit renderer and controls.
- `src/data` - sample binary systems.

## Development Checklist

- [ ] Implement barycenter equations
- [ ] Add orbit state model
- [ ] Add Canvas visualization
- [ ] Add mass controls
- [ ] Add tests for barycenter position
- [ ] Document assumptions
