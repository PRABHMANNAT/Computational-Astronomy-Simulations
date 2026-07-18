# Roche Limit Disruption

Status: planned.

## Scope

Show the Roche limit and simplified disruption behavior for a secondary body approaching a primary.

## Planned Architecture

- `src/physics` - Roche limit calculations.
- `src/simulation` - approach and disruption state.
- `src/components` - orbit and fragment renderer.
- `src/data` - density presets.

## Development Checklist

- [ ] Implement Roche limit equations
- [ ] Add disruption state model
- [ ] Add visualization
- [ ] Add density controls
- [ ] Add tests for Roche distance
- [ ] Document assumptions
