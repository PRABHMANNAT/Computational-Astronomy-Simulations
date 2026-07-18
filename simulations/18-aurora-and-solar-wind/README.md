# Aurora and Solar Wind

Status: planned.

## Scope

Show simplified solar wind interaction with a planetary magnetosphere and auroral zones.

## Planned Architecture

- `src/physics` - pressure and magnetosphere scaling helpers.
- `src/simulation` - solar wind state.
- `src/components` - magnetosphere and aurora renderer.
- `src/data` - solar wind presets.

## Development Checklist

- [ ] Define solar wind model
- [ ] Implement magnetosphere scaling
- [ ] Add renderer
- [ ] Add activity controls
- [ ] Add tests for pressure scaling
- [ ] Document simplifications
