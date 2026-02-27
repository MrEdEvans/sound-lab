# SoundLab Architecture

SoundLab is a modular, state‑driven synthesizer engine designed for clarity, maintainability, and long‑term extensibility. This document defines the architectural principles, naming conventions, preset format, validation rules, and boundaries that govern the engine and UI. These decisions ensure that SoundLab remains coherent as it grows.

---

## Core Architectural Principles

SoundLab is built on a small number of strict, high‑leverage rules:

### Engine/UI Separation

- The **engine** contains pure state, DSP logic, and parameter setters.
- The **UI** contains panels, components, controls, dirty flags, and render scheduling.
- No UI code appears in the engine.
- No DSP or engine‑state mutation appears in the UI.

### Pure Engine State

- The engine state is a single structured object representing the current patch.
- All mutations occur through explicit setter functions.
- No hidden side effects or implicit state transitions.

### Deterministic DSP

- DSP functions operate only on provided inputs and engine state.
- No global state or cross‑module side effects.
- Time‑dependent DSP (e.g., envelopes) is isolated and explicit.

### Explicit Routing

- Routing is represented as structured data in the engine state.
- No implicit or hidden signal paths.
- Routing is included in presets.

### Terminology Consistency

All terms follow the definitions in `GLOSSARY.md`:

- Patch
- Preset
- Module
- Panel
- Component
- Control
- Routing
- Engine State

---

## Naming Conventions

SoundLab uses contemporary, professional naming conventions to ensure clarity and consistency.

### Files and Folders

- Files: `kebab-case.js`
- Folders: `kebab-case/`
- Examples:
  - `engine-state.js`
  - `osc-module.js`
  - `filter-panel.js`
  - `init-engine.js`

### Variables and Functions

- Variables: `camelCase`
- Functions: `camelCase`
- Classes (rare): `PascalCase`
- Constants: `SCREAMING_SNAKE_CASE`

### Function Naming Patterns

- Setters: `setXxx`
- Getters/selectors: `getXxx`, `selectXxx`
- Event handlers: `handleXxx`
- Factories: `createXxx`

### Engine State Keys

- JSON keys use `camelCase`
- Examples:
  - `oscFrequency`
  - `filterCutoff`
  - `envAttack`
  - `routingConfig`

### Events

- Use `onXxx`
- Examples:
  - `onPresetLoaded`
  - `onValueInput`

---

## Preset Format

Presets are stored as JSON and represent a complete patch, including routing and metadata.

### Top‑Level Structure (Version 1)

```json
{
  "version": "1.0.0",
  "id": "uuid-or-slug",
  "name": "Warm Pad",
  "author": "Ed Evans",
  "description": "Soft evolving pad with gentle vibrato.",
  "tags": ["pad", "warm", "vibrato"],

  "routing": {
    "oscToFilter": true,
    "filterToFx": true,
    "fxToMaster": true
  },

  "modules": {
    "osc": {
      "waveform": "saw",
      "frequency": 440,
      "detune": 0
    },
    "filter": {
      "type": "lowpass",
      "cutoff": 1200,
      "resonance": 0.5
    },
    "envelope": {
      "attack": 0.01,
      "decay": 0.2,
      "sustain": 0.8,
      "release": 0.5
    },
    "vibrato": {
      "rate": 5,
      "depth": 0.1,
      "enabled": true
    },
    "master": {
      "gain": 0.8
    }
  }
}
```

### Metadata

Version 1 includes:

- `name`
- `author`
- `description`
- `tags`
- `id`
- `version`

Future versions may add:

- creation date
- last modified date
- category
- preview audio
- UI layout hints

### Versioning

- Presets must include a `version` field.
- Future schema changes will use version‑based migration.

---

## Validation and Error Handling

SoundLab prioritizes correctness and meaningful error reporting.

### Core Rules

- The UI must never generate invalid data.
- The engine must never assume data is valid.
- All external inputs (e.g., JSON presets) must be validated.
- Invalid data must not mutate engine state.
- Errors must be explicit, descriptive, and actionable.

### Validation Responsibilities

#### Preset Loading (`loadPreset`)

- Validates the entire preset object.
- Checks:
  - Required fields
  - Module presence
  - Parameter types and ranges
  - Routing structure
- On failure:
  - Engine state remains unchanged.
  - A structured error is returned or thrown.

#### Setters (`setXxx`)

- Validate individual values.
- Reject invalid types or out‑of‑range values.
- Provide meaningful error messages.

### Error Message Requirements

Errors must include:

- The failing field or path (e.g., `modules.filter.cutoff`)
- Expected type or range
- Actual value received
- A human‑readable explanation

Examples:

- `Invalid preset: modules.filter.cutoff must be a number between 20 and 20000, received "bright".`
- `Invalid value for setOscFrequency: expected number > 0, received -440.`

### Behavior on Invalid Data

- Preset load: abort entirely, no partial updates.
- Setter: ignore update, report error.

---

## Module Architecture

Modules are the functional building blocks of the engine.

### Module Structure

Each module:

- Has a defined set of parameters.
- Has a corresponding UI panel.
- Has a clear lifecycle:
  - Initialization
  - Parameter updates
  - DSP processing (if applicable)

### Module Boundaries

- Modules do not mutate other modules directly.
- Communication occurs through:
  - Engine state
  - Routing configuration
  - Explicit function calls

---

## UI Architecture

The UI is responsible for:

- Rendering panels and controls
- Managing dirty flags
- Scheduling render cycles
- Mapping user input to engine setters
- Reflecting engine state accurately

### Dirty Flag System

- Each panel tracks whether it needs re‑rendering.
- A scheduler batches updates to avoid unnecessary DOM work.

### Panels and Components

- Panels correspond to modules.
- Components group related controls.
- Controls map directly to engine parameters.

---

## Routing Model

Routing defines how modules connect in the signal path.

### Version 1

- Routing is fixed but configurable (on/off paths).
- Represented as structured data in the preset.

### Future Versions

- Reorderable FX chain
- Modulation matrix
- Node‑based routing graph

---

## Future Expansion Areas

This document will grow to include:

- Detailed preset schema specification
- Module lifecycle diagrams
- Routing graph specification
- DSP guidelines and performance considerations
- Polyphony and voice management (Version 2)
- Modulation architecture (Version 3)
- UI theming and layout rules

---

## Summary

SoundLab’s architecture is built on clarity, consistency, and explicitness. By defining naming conventions, preset structure, validation rules, and module boundaries up front, the project remains maintainable and extensible as it evolves.
