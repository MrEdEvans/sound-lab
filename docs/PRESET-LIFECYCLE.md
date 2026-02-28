# SoundLab Preset Lifecycle

A SoundLab preset can exist in four distinct places, each serving a different purpose in the workflow of designing, saving, sharing, and loading sounds. Understanding these layers helps clarify how presets move through the system and how SoundLab maintains consistency and safety across different storage mechanisms.

---

## 1. Engine State (In‑Memory)

The engine state is the live, mutable representation of the synth at any moment. It reflects every knob turn, slider movement, and modulation change.

- Exists only in RAM.
- Changes continuously as the user tweaks parameters.
- Lost when the page reloads unless saved elsewhere.
- Used directly by the audio engine to generate sound.

This is the “working copy” of a preset.

---

## 2. IndexedDB (Local Preset Library)

IndexedDB is the browser’s persistent storage system. SoundLab uses it as the internal preset library.

- Survives page reloads and browser restarts.
- Stores presets safely using atomic transactions.
- Prevents corruption even if the browser crashes mid‑write.
- Ideal for quick save/load during sound design.
- Supports metadata indexing (name, author, timestamps).

This is the “local library” layer.

---

## 3. File System (Exported JSON Files)

Presets can be exported as `.json` files for portability and long‑term storage.

- Users can back up presets.
- Presets can be shared with others.
- Works across devices and browsers.
- Can be version‑controlled (e.g., Git).
- Can be imported back into SoundLab at any time.

This is the “portable preset” layer.

Example exported preset:

```json
{
  "name": "My Bass Patch",
  "author": "Ed",
  "engineVersion": "1.0.0",
  "presetFormatVersion": "1",
  "osc": { "frequency": 110 },
  "filter": { "cutoff": 800 }
}
```

---

## 4. Source Code (Factory Presets)

Factory presets are bundled with SoundLab itself.

- Stored in the repository.
- Loaded at runtime as read‑only defaults.
- Provide examples and starting points.
- Cannot be overwritten by the user.
- Can be updated when the engine evolves.

This is the “built‑in content” layer.

---

## Preset Flow Between Layers

A preset can move between layers in several ways. The most common lifecycle looks like this:

```
factory preset → engine state → IndexedDB → export → import → engine state → IndexedDB
```

Other flows are possible:

```
engine state → export → import → engine state
```

```
factory preset → engine state → export
```

```
IndexedDB → engine state → IndexedDB (Save As)
```

Each layer plays a specific role, and SoundLab’s preset system is designed to keep these transitions safe, predictable, and lossless.

---

## Why This Matters

Documenting the preset lifecycle clarifies:

- how presets persist across sessions
- how users can back up and share their work
- how factory presets differ from user presets
- how version migration can be handled in the future
- how SoundLab avoids corruption and maintains consistency

This model also supports future features such as:

- preset browser UI
- tagging and search
- preset banks
- version migration tools
- autosave and history
