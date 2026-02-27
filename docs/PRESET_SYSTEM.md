# SoundLab Preset System

The SoundLab preset system defines how presets are stored, loaded, validated, and merged into the DSP engine. It guarantees that presets remain stable, human‑readable, and backward‑compatible across engine versions.

---

## Goals

- Preserve sound identity across all future versions of SoundLab.
- Keep preset files human‑readable, diff‑friendly, and editable.
- Cleanly separate engine state (DSP parameters) from metadata (name, tags, author).
- Support versioned defaults so presets always load with the defaults from the version they were created with.
- Allow the preset format to evolve safely through a controlled `presetFormatVersion`.
- Enable large preset libraries and preset packs without loading them into the engine.

---

## Versioned Defaults

Each engine release includes a JSON file containing the default engine state for that version. These files are immutable snapshots of the engine’s parameters at release time.

Example:

\`\`\`
/defaults/v1.0.0.json
/defaults/v1.1.0.json
/defaults/v1.2.0.json
\`\`\`

When loading a preset:

1. Read the preset’s `version` field.
2. Load the matching default template.
3. Merge the preset’s deltas into that template.
4. Produce a complete engine state.

This ensures that presets created under older versions always load and sound identical.

---

## Metadata Schema

Metadata describes the preset but does not affect sound. It is stored at the top of the preset file and returned separately from the engine state.

### Required Metadata

- `name` — string  
- `author` — string  
- `engineVersion` — string  
- `presetFormatVersion` — string  

### Optional Metadata

- `description` — string  
- `tags` — array of strings  
- `genre` — string  
- `mood` — string  
- `createdAt` — ISO timestamp  
- `updatedAt` — ISO timestamp  
- `favorite` — boolean  
- `rating` — number  
- `uuid` — string  

Unknown metadata fields are allowed and preserved.

---

## Preset File Structure

A preset file is a single JSON object containing:

1. Metadata (sorted in canonical order)
2. The preset’s `version`
3. Engine deltas (sorted alphabetically)

Example:

\`\`\`json
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
\`\`\`

---

## Loader Behavior

The loader:

1. Validates the preset structure.
2. Separates metadata from engine deltas.
3. Loads the correct versioned defaults.
4. Recursively merges deltas into defaults.
5. Returns:

\`\`\`js
{
  engineState: { ...full DSP state... },
  metadata: { ...metadata fields... }
}
\`\`\`

The engine receives only DSP parameters.  
The UI receives only metadata.

---

## Saver Behavior

The saver:

1. Extracts deltas by comparing the engine state to versioned defaults.
2. Merges metadata at the top.
3. Sorts metadata in canonical order.
4. Sorts engine deltas alphabetically.
5. Pretty‑prints the JSON by default.

This produces stable, readable, diff‑friendly preset files.

---

## Validation Rules

The validator enforces:

### Metadata correctness
- Required metadata must exist.
- Metadata types must match the schema.
- Unknown metadata fields are allowed.

### Version correctness
- `version` must exist and match a known default template.
- Presets from newer versions must be rejected.

### Engine delta correctness
- All engine delta keys must exist in the versioned defaults.
- Nested structures must match the defaults.
- Types must match (object vs. array vs. primitive).
- Unknown engine parameters are rejected.

The validator returns a list of human‑readable errors.

---

## presetFormatVersion Rules

The preset format version describes the structure of the preset file, not the DSP engine.

### Increment presetFormatVersion when:
- Required metadata fields change.
- Metadata fields are renamed or removed.
- The structure of deltas changes.
- The preset file format changes (e.g., JSON → JSON5).
- Sorting or ordering rules change.

### Do not increment when:
- Engine parameters change.
- Engine defaults change.
- New optional metadata fields are added.

### Loader rules
- Older formats must load with backward‑compatibility rules.
- Newer formats must not load silently.
- The saver always writes the current format version.

---

## Example Lifecycle

### Creating a preset
- Engine state is captured.
- Metadata is provided by the UI.
- Saver extracts deltas and writes a sorted, pretty JSON file.

### Loading a preset
- Validator checks structure and version.
- Loader separates metadata and deltas.
- Loader merges deltas into versioned defaults.
- Engine receives a complete DSP state.

### Updating SoundLab
- New defaults are added.
- Old presets continue to load using their original defaults.
- `presetFormatVersion` increments only if the file structure changes.

---

## Future Evolution

The preset system is designed to support:

- new metadata fields  
- new engine modules  
- new default templates  
- preset packs and commercial libraries  
- cloud sync  
- migrations between presetFormatVersions  

Core invariants must always hold:

- Presets must load and sound identical across versions.  
- Metadata must never affect DSP behavior.  
- The preset file must remain human‑readable.  
