# Stellar Evolution

Status: planned.

## Scope

Explore simplified stellar evolution tracks as a function of initial stellar mass.

## Planned Architecture

- `src/physics` - luminosity, temperature, and lifetime approximations.
- `src/simulation` - lifecycle stage transitions.
- `src/components` - HR diagram and star-state controls.
- `src/data` - example stellar mass tracks.

## Development Checklist

- [ ] Define stellar track approximation
- [ ] Add HR diagram renderer
- [ ] Add mass and age controls
- [ ] Add stage descriptions
- [ ] Add tests for lifetime scaling
- [ ] Document model limits
