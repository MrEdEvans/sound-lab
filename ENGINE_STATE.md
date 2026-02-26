<!-- markdownlint-disable MD024 -->

# SoundLab Engine State Specification

The engine state is the authoritative, in‑memory representation of the synthesizer’s current configuration. It defines all module parameters, routing information, and global settings. This document formalizes the structure, types, ranges, defaults, and versioning rules that govern the engine state.

The preset system, UI bindings, DSP layer, and routing model all depend on this specification.

---

## Top‑Level Structure

The engine state is a single JavaScript object with three primary sections:

```js
engineState = {
  version: "1.0.0",
  modules: { ... },
  routing: { ... },
  global: { ... }
};
```

### version

A semantic version string representing the engine state schema version. This is used for preset compatibility and migration.

### modules

A collection of functional blocks (oscillator, filter, envelope, vibrato, FX, master). Each module contains its own parameters, defaults, and constraints.

### routing

A structured representation of how modules connect in the signal path.

### global

Engine‑wide settings such as master gain, tuning, or future global modulation sources.

---

## Module Definitions

Each module is a functional block in the synthesizer. Modules are independent, deterministic, and do not mutate each other directly. All communication occurs through engine state and routing.

### Oscillator Module

```js
modules.osc = {
  waveform: "sine",        // "sine" | "square" | "saw" | "triangle"
  frequency: 440,          // Hz, > 0
  detune: 0,               // cents, -1200 to +1200
  phase: 0                 // radians, 0 to 2π
};
```

#### Defaults

- waveform: `"sine"`
- frequency: `440`
- detune: `0`
- phase: `0`

#### Validation

- waveform must be one of the allowed strings.
- frequency must be a positive number.
- detune must be within ±1200 cents.
- phase must be between 0 and 2π.

---

### Filter Module

```js
modules.filter = {
  type: "lowpass",         // "lowpass" | "highpass" | "bandpass"
  cutoff: 1200,            // Hz, 20–20000
  resonance: 0.5,          // Q factor, 0–1
  drive: 0                 // 0–1
};
```

#### Defaults

- type: `"lowpass"`
- cutoff: `1200`
- resonance: `0.5`
- drive: `0`

#### Validation

- type must be one of the allowed strings.
- cutoff must be between 20 and 20000 Hz.
- resonance must be between 0 and 1.
- drive must be between 0 and 1.

---

### Envelope Module (ADSR)

```js
modules.envelope = {
  attack: 0.01,            // seconds, >= 0
  decay: 0.2,              // seconds, >= 0
  sustain: 0.8,            // 0–1
  release: 0.5             // seconds, >= 0
};
```

#### Defaults

- attack: `0.01`
- decay: `0.2`
- sustain: `0.8`
- release: `0.5`

#### Validation

- attack, decay, release must be non‑negative numbers.
- sustain must be between 0 and 1.

---

### Vibrato Module

```js
modules.vibrato = {
  rate: 5,                 // Hz, > 0
  depth: 0.1,              // 0–1
  enabled: false
};
```

#### Defaults

- rate: `5`
- depth: `0.1`
- enabled: `false`

#### Validation

- rate must be positive.
- depth must be between 0 and 1.
- enabled must be boolean.

---

### FX Module (Version 1: Simple Delay)

```js
modules.fx = {
  delayTime: 0.25,         // seconds, >= 0
  feedback: 0.3,           // 0–1
  mix: 0.2                 // 0–1
};
```

#### Defaults

- delayTime: `0.25`
- feedback: `0.3`
- mix: `0.2`

#### Validation

- delayTime must be >= 0.
- feedback must be between 0 and 1.
- mix must be between 0 and 1.

---

### Master Module

```js
modules.master = {
  gain: 0.8                // 0–1
};
```

#### Defaults

- gain: `0.8`

#### Validation

- gain must be between 0 and 1.

---

## Routing Specification

Routing defines how modules connect in the signal path. Version 1 uses a fixed but configurable routing model.

```js
routing = {
  oscToFilter: true,
  filterToFx: true,
  fxToMaster: true
};
```

### Rules

- All routing fields are boolean.
- All routing fields must be present.
- Future versions may replace this with:
  - reorderable FX chain
  - modulation matrix
  - node‑based graph

---

## Global Settings

Global settings apply to the entire engine.

```js
global = {
  tuning: 440,             // Hz, > 0
  glide: 0                 // seconds, >= 0
};
```

### Defaults

- tuning: `440`
- glide: `0`

### Validation

- tuning must be positive.
- glide must be non‑negative.

---

## Default Engine State

The engine initializes with a complete, validated state:

```js
const defaultEngineState = {
  version: "1.0.0",
  modules: {
    osc: { ... },
    filter: { ... },
    envelope: { ... },
    vibrato: { ... },
    fx: { ... },
    master: { ... }
  },
  routing: {
    oscToFilter: true,
    filterToFx: true,
    fxToMaster: true
  },
  global: {
    tuning: 440,
    glide: 0
  }
};
```

---

## Validation Rules

All engine state updates must be validated.

### Setters

- Validate type, range, and allowed values.
- Reject invalid updates.
- Provide meaningful error messages.
- Never mutate state on invalid input.

### Preset Loading

- Validate the entire preset before applying.
- Reject missing modules or fields.
- Reject invalid parameter values.
- Reject invalid routing.
- Reject invalid metadata.
- Do not partially apply presets.
- Provide structured, meaningful errors.

---

## Error Format

Errors must include:

```js
{
  message: "Human readable explanation",
  path: "modules.filter.cutoff",
  expected: "number between 20 and 20000",
  actual: "bright"
}
```

This format is used by:

- setters
- preset loader
- future schema validators

---

## Versioning and Migration

The engine state includes a `version` field.

### Rules

- Increment minor version for additive changes.
- Increment major version for breaking changes.
- Preset loader must:
  - detect version mismatches
  - migrate if possible
  - reject if incompatible

---

## Future Expansion

This specification will grow to include:

- Polyphonic voice state (Version 2)
- Voice allocation rules
- Modulation matrix (Version 3)
- Node‑based routing graph
- Wavetable or sample oscillator parameters
- FX chain architecture
- Per‑module metadata
- UI layout hints

---

## Summary

The engine state is the backbone of SoundLab. By defining its structure, defaults, validation rules, and versioning up front, the engine remains predictable, maintainable, and extensible as the project evolves.
