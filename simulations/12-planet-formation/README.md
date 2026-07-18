# Planet Formation

Status: planned.

## Scope

Model simplified planetesimal accretion and growth over time.

## Planned Architecture

- `src/physics` - collision and accretion approximations.
- `src/simulation` - particle and embryo state.
- `src/components` - disk renderer and controls.
- `src/data` - initial disk scenarios.

## Development Checklist

- [ ] Choose accretion approximation
- [ ] Implement particle state
- [ ] Add visualization
- [ ] Add density controls
- [ ] Add tests for mass conservation
- [ ] Document limitations
