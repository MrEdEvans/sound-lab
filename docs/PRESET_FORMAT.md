# SoundLab Preset Format Specification

This document defines the structure, rules, and guarantees of the SoundLab preset file format. It describes both the current format and the intended long‑term evolution of the system. The goal is to ensure presets remain stable, human‑readable, diff‑friendly, and backward‑compatible across all future versions of SoundLab.

---

## Format Overview

A preset file is a single JSON object containing:

1. Metadata (sorted in canonical semantic order)
2. The preset’s `version` (engine version the preset was created under)
3. Engine deltas (sorted alphabetically)

The loader merges these deltas into the versioned defaults for the preset’s engine version to produce a complete engine state.

The saver extracts deltas by comparing the engine state to the versioned defaults and writes a stable, pretty‑printed JSON file.

---

## Canonical Metadata Ordering

Metadata fields must appear in the following semantic order:

### Identity
1. `name`
2. `author`
3. `description`

### Classification
4. `tags`
5. `genre`
6. `mood`

### Timestamps
7. `createdAt`
8. `updatedAt`

### User Flags
9. `favorite`
10. `rating`

### Versioning
11. `engineVersion`
12. `presetFormatVersion`

### Uniqueness
13. `uuid`

Unknown metadata fields are allowed and preserved, but they must appear **after** the canonical fields.

---

## Required Metadata Fields

- `name` — string  
- `author` — string  
- `engineVersion` — string  
- `presetFormatVersion` — string  

These fields must exist and must be valid.

---

## Optional Metadata Fields (Current + Future)

The following fields are optional but supported:

- `description` — string  
- `tags` — array of strings  
- `genre` — string  
- `mood` — string  
- `createdAt` — ISO timestamp  
- `updatedAt` — ISO timestamp  
- `favorite` — boolean  
- `rating` — number  
- `uuid` — string  

Future optional metadata fields may be added without incrementing `presetFormatVersion`.

Unknown metadata fields must be preserved exactly as written.

---

## Version Field

The `version` field identifies which engine default template the preset was created under.

Example:

```json
"version": "1.0.0"
```

Rules:

- Must match a known default template.
- Presets referencing newer versions must be rejected.
- Older versions must load using backward‑compatible rules.

---

## Engine Deltas

Engine deltas represent only the parameters that differ from the versioned defaults.

Rules:

- Keys must match keys in the default template.
- Unknown engine parameters must be rejected.
- Nested structures must match the shape of the defaults.
- Types must match exactly.
- Keys must be sorted alphabetically at the top level.

Example:

```json
"fm": { "enabled": true },
"osc": { "frequency": 880 }
```

---

## Full Preset Example (Current Format)

```json
{
  "name": "Glass Pad",
  "author": "Ed",
  "description": "Soft FM pad with shimmer",
  "tags": ["pad", "fm", "ambient"],
  "genre": "ambient",
  "mood": "dreamy",
  "createdAt": "2026-02-26T21:13:00Z",
  "updatedAt": "2026-02-27T03:45:00Z",
  "favorite": false,
  "rating": 4,
  "engineVersion": "1.0.0",
  "presetFormatVersion": "1",
  "uuid": "c1a4f2e0-8b7a-4d8f-9e3b-2f7d9c4a1b2e",

  "version": "1.0.0",

  "fm": { "enabled": true },
  "osc": { "frequency": 880 }
}
```

---

## Loader Rules

The loader must:

1. Validate the preset structure.
2. Separate metadata from engine deltas.
3. Load the correct versioned defaults.
4. Recursively merge deltas into defaults.
5. Return:

```js
{
  engineState: { ...full DSP state... },
  metadata: { ...metadata fields... }
}
```

The engine receives only DSP parameters.  
The UI receives only metadata.

---

## Saver Rules

The saver must:

1. Compare engine state to versioned defaults.
2. Extract only changed parameters (deltas).
3. Merge metadata at the top.
4. Sort metadata in canonical semantic order.
5. Sort engine deltas alphabetically.
6. Pretty‑print the JSON.

The saver always writes the **current** `presetFormatVersion`.

---

## Validation Rules

The validator enforces:

### Metadata
- Required fields must exist.
- Types must match.
- Unknown fields are allowed.

### Version
- `version` must match a known default template.
- Presets from newer versions must be rejected.

### Engine Deltas
- Keys must exist in the defaults.
- Types must match.
- Unknown parameters must be rejected.

The validator returns a list of human‑readable errors.

---

## presetFormatVersion Rules

`presetFormatVersion` describes the structure of the preset file, not the DSP engine.

### Increment when:
- Required metadata fields change.
- Metadata fields are renamed or removed.
- Delta structure changes.
- Sorting or ordering rules change.
- File format changes (e.g., JSON → JSON5).

### Do not increment when:
- Engine parameters change.
- Engine defaults change.
- New optional metadata fields are added.

### Loader behavior:
- Older formats must load with backward‑compatibility rules.
- Newer formats must not load silently.

---

## Future Evolution

The preset format is designed to support:

- new metadata fields  
- new engine modules  
- new default templates  
- preset packs and commercial libraries  
- cloud sync  
- migrations between presetFormatVersions  

Core invariants:

- Presets must load and sound identical across versions.  
- Metadata must never affect DSP behavior.  
- The preset file must remain human‑readable.  
