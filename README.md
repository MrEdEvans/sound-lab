# SoundLab

SoundLab is a modern, developer‑friendly synthesizer engine for the web. It is designed for creators, game developers, interactive artists, and anyone who wants expressive, flexible synthesis without the complexity of a full DAW or hardware synth. The architecture emphasizes clarity, modularity, and extensibility so the engine can grow over time without becoming fragile or tangled.

---

## Project Philosophy

SoundLab is intended to be used as a library rather than forked into derivative engines. Users are encouraged to explore the source, open issues, and contribute improvements, but redistribution of modified versions or rebranding of the engine is not permitted under the project’s guidelines. The Apache 2.0 license protects attribution and ensures SoundLab’s identity remains intact.

---

## Core Concepts

These terms appear throughout the documentation and codebase. Full definitions are available in `GLOSSARY.md`.

- **Patch** — A complete set of values defining the synthesizer’s behavior.
- **Preset** — A saved patch stored either internally or by the user.
- **Module** — A functional block in the synthesizer (oscillator, filter, envelope, etc.).
- **Panel** — The UI representation of a module.
- **Component** — A group of related controls within a module.
- **Control** — A UI element that modifies a specific engine parameter.
- **Routing** — The configuration describing how modules connect in the signal path.
- **Engine State** — The in‑memory representation of the current patch.

---

## Goals for Version 1

Version 1 focuses on a clean, maintainable foundation:

- Pure engine state with no side effects.
- Explicit setter functions for all engine parameters.
- UI‑side dirty flags and render scheduling.
- Modular file structure for long‑term growth.
- Oscillators, FM operators, pitch envelope, vibrato, filter, FX, and master section.
- Panels that reflect engine state accurately.
- Predictable, testable architecture.

The initial release is intentionally monophonic with fixed routing to keep the core simple.

---

## Future Directions

### Version 2

- Polyphony and a voice manager.
- `noteOn` / `noteOff` API.
- Simple sequencer.
- MIDI input.
- Reorderable FX chain.
- Additional modulation sources.

### Version 3

- Modular routing graph.
- Patch‑cable or node‑based UI.
- Modulation matrix.
- Wavetable or sample oscillators.
- Automation lanes.
- Advanced sequencing tools.

---

## Architecture Overview

SoundLab is organized into three layers:

### Engine

Pure data and DSP logic with no UI dependencies.

### UI Runtime

Dirty‑flag tracking, render scheduling, and panel rendering.

### App Layer

Initialization, event binding, and orchestration between UI and engine.

This separation keeps the engine clean and the UI maintainable.

---

## Project Structure

```text
README.md
LICENSE
NOTICE
index.html
.gitignore

src/
  engine/
  presets/
  ui/
    panels/
    bindings/
  app/
  styles/

assets/
  icons/
  waveforms/
  presets/
```

---

## Getting Started

Clone the repository:

```text
git clone https://github.com/YOUR_USERNAME/soundlab.git
cd soundlab
```

Open `index.html` in a browser. No build step is required.

---

## License

SoundLab is released under the Apache 2.0 License. See `LICENSE` for details.

---

## Contributing

Contributions are welcome. Please open an issue or submit a pull request if you want to propose changes. Forks for rebranding or redistribution are not permitted.
