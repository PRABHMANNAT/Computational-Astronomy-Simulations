# Contributing

Thank you for contributing to Astronomy-and-Astrophysics-Simulations.

## Development Principles

- Keep physics logic separate from rendering and UI.
- Reuse shared packages before duplicating code inside a simulation.
- Add unit tests for physics, math, data transforms, and simulation state transitions.
- Document equations, assumptions, limitations, and visual scaling in each simulation README.
- Do not add black-hole simulations to this repository.

## Adding a Simulation

1. Update the simulation metadata.
2. Implement physics in `src/physics`.
3. Implement simulation state in `src/simulation`.
4. Implement rendering and controls in `src/components`.
5. Add tests under `tests`.
6. Update the README checklist as work is completed.

## Local Checks

```bash
npm test
npm run typecheck
npm run build
```
