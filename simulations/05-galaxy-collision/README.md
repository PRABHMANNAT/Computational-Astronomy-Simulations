# Galaxy Collision

Status: planned.

## Scope

Create a visually scaled galaxy interaction model with particle disks, tidal tails, and adjustable encounter parameters.

## Planned Architecture

- `src/physics` - simplified N-body or restricted three-body approximations.
- `src/simulation` - particle state integration.
- `src/components` - 3D scene and controls.
- `src/data` - preset galaxy encounter scenarios.

## Development Checklist

- [ ] Choose simulation approximation
- [ ] Implement particle initialization
- [ ] Add 3D renderer
- [ ] Add encounter controls
- [ ] Add tests for integrator stability
- [ ] Document scientific limits
