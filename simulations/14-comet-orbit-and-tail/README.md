# Comet Orbit and Tail

Status: planned.

## Scope

Show a comet on an eccentric orbit with a tail that responds to solar distance and direction.

## Planned Architecture

- `src/physics` - eccentric orbit and tail orientation.
- `src/simulation` - comet state.
- `src/components` - orbit and tail renderer.
- `src/data` - comet presets.

## Development Checklist

- [ ] Implement eccentric orbit model
- [ ] Implement tail scaling
- [ ] Add Canvas renderer
- [ ] Add comet presets
- [ ] Add tests for tail direction
- [ ] Document limitations
