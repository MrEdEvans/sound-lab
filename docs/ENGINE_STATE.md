<!-- markdownlint-disable MD024 -->
# SoundLab Engine State Specification

The engine state is the authoritative, in‑memory representation of SoundLab’s synthesizer configuration. It defines all DSP module parameters, routing, and global settings. The preset system, UI bindings, DSP layer, and routing model all depend on this specification.

This document describes the engine state structure, module definitions, validation rules, versioning, and how the engine state interacts with the preset system.

---

## Purpose of the Engine State

The engine state is a complete, deterministic DSP configuration. It contains only sound‑producing parameters and routing information. It does not contain metadata such as preset name, author, tags, or timestamps.

The engine state is produced by:

1. Loading versioned defaults for the preset’s engine version.
2. Merging preset deltas into those defaults.
3. Validating the resulting structure.

This ensures presets always load and sound identical across versions.

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
A semantic version string representing the engine state schema version. This is used for preset compatibility and versioned defaults.

### modules
A collection of DSP modules (oscillator, filter, envelope, vibrato, FX, master). Each module defines its own parameters, defaults, and constraints.

### routing
A structured representation of how modules connect in the signal path.

### global
Engine‑wide settings such as tuning and glide.

---

## Interaction with the Preset System

The engine state is tightly integrated with the preset system:

- Presets store only deltas, not full engine state.
- The loader merges deltas into versioned defaults to produce a complete engine state.
- The saver extracts deltas by comparing engine state to versioned defaults.
- Metadata is kept separate and never enters the engine state.

This separation keeps the DSP engine pure and predictable.

---

## Module Definitions

Each module is a functional DSP block. Modules are deterministic and do not mutate each other directly. All communication occurs through engine state and routing.

---

### Oscillator Module

```js
modules.osc = {
  waveform: "sine",        // "sine" | "square" | "saw" | "triangle"
  frequency: 440,          // Hz, > 0
  detune: 0,               // cents, -1200 to +1200
  phase: 0                 // radians, 0 to 2π
};
```

**Defaults**
- waveform: "sine"
- frequency: 440
- detune: 0
- phase: 0

**Validation**
- waveform must be one of the allowed strings.
- frequency must be positive.
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

**Defaults**
- type: "lowpass"
- cutoff: 1200
- resonance: 0.5
- drive: 0

**Validation**
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

**Defaults**
- attack: 0.01
- decay: 0.2
- sustain: 0.8
- release: 0.5

**Validation**
- attack, decay, release must be non‑negative.
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

**Defaults**
- rate: 5
- depth: 0.1
- enabled: false

**Validation**
- rate must be positive.
- depth must be between 0 and 1.
- enabled must be boolean.

---

### FX Module (Simple Delay, Version 1)

```js
modules.fx = {
  delayTime: 0.25,         // seconds, >= 0
  feedback: 0.3,           // 0–1
  mix: 0.2                 // 0–1
};
```

**Defaults**
- delayTime: 0.25
- feedback: 0.3
- mix: 0.2

**Validation**
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

**Defaults**
- gain: 0.8

**Validation**
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

**Rules**
- All routing fields are boolean.
- All routing fields must be present.

**Future versions may introduce:**
- reorderable FX chains
- modulation matrix
- node‑based graph routing

---

## Global Settings

Global settings apply to the entire engine.

```js
global = {
  tuning: 440,             // Hz, > 0
  glide: 0                 // seconds, >= 0
};
```

**Defaults**
- tuning: 440
- glide: 0

**Validation**
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
- schema validators

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

Versioned defaults ensure backward compatibility without requiring preset migrations.

---

## Future Expansion

This specification will grow to include:

- polyphonic voice state
- voice allocation rules
- modulation matrix
- node‑based routing graph
- wavetable or sample oscillator parameters
- FX chain architecture
- per‑module metadata
- UI layout hints

---

## Summary

The engine state is the backbone of SoundLab. By defining its structure, defaults, validation rules, and versioning up front—and by integrating it cleanly with the preset system—SoundLab remains predictable, maintainable, and extensible as the project evolves.
