# SoundLab Glossary

This glossary defines the core terminology used throughout the SoundLab engine, UI, and documentation. These terms form the conceptual foundation of the project and ensure consistent communication between developers and users.

---

## Patch
A complete set of values that define the behavior of the synthesizer engine. A patch includes all module parameters, component settings, and routing configuration. It represents the conceptual state of the synthesizer at a given moment.

---

## Preset
A patch that has been saved to persistent storage. Presets may be built‑in (shipped with SoundLab) or created by users. A preset is simply a stored patch.

---

## User Preset
Any preset created, modified, or saved by the user. User presets are distinct from built‑in presets that ship with the engine.

---

## Engine State
The in‑memory representation of the current patch. The engine state is the authoritative source of truth for all synthesis parameters and routing information.

---

## Module
A functional block within the synthesizer engine. Each module performs a specific role in the signal path, such as generating sound (oscillator), shaping amplitude (envelope), modifying timbre (filter), or applying effects (FX). Modules are conceptual units in the engine, not UI elements.

Examples:
- Oscillator Module
- Filter Module
- FM Operator Module
- Vibrato Module
- Master Module

---

## Panel
The user interface representation of a module. Panels contain controls and components that allow users to modify module parameters. While modules exist in the engine, panels exist in the UI.

---

## Component
A logical grouping of related controls within a module or panel. Components implement a specific function such as an ADSR envelope, an LFO, or a filter core. Components help organize both UI and engine logic.

---

## Control
A UI element that modifies a specific engine parameter. Controls include sliders, knobs, toggles, dropdowns, and numeric inputs. Each control maps directly to a value in the engine state.

---

## Routing
The configuration that determines how modules are connected in the signal path. Routing defines the flow of audio and modulation signals through the synthesizer. In early versions of SoundLab, routing is fixed; later versions will support modular routing.

---

## Parameter
A single numeric or boolean value within the engine state. Parameters are modified by controls and consumed by DSP code.

---

## DSP (Digital Signal Processing)
The low‑level audio computation performed by the engine. DSP code generates and transforms audio signals based on the current engine state.

---

## Dirty Flag
A UI‑side indicator that a value has changed and the UI needs to be re‑rendered. Dirty flags help avoid unnecessary rendering work.

---

## Render Cycle
The process of updating UI panels and controls to reflect the current engine state. Render cycles are scheduled when dirty flags are set.

---

## Voice
A single instance of sound generation. Version 1 of SoundLab is monophonic (one voice). Future versions will include polyphony and voice management.

