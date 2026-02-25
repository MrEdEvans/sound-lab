# SoundLab

SoundLab is a modern, developer‑friendly sound engine for the web.  
It’s designed for creators, game developers, interactive artists, and anyone who wants
expressive, flexible synthesis without the complexity of a full DAW or performance synth.

SoundLab emphasizes clarity, modularity, and extensibility — a clean architecture that grows with your needs.

---

## 🎯 Project Philosophy

SoundLab is intended to be **used**, not fragmented.

You are encouraged to:
- Use SoundLab in your own projects  
- Learn from the source  
- Open issues  
- Submit pull requests  
- Suggest improvements  

You are **not** permitted to:
- Rebrand SoundLab  
- Redistribute modified versions as a separate product  
- Remove attribution  
- Claim the engine or its code as your own  

Forks are welcome **only** for contribution, experimentation, or learning — not for creating derivative competing libraries.

The Apache 2.0 license protects attribution and identity while keeping SoundLab open and usable.

---

## 🎯 Goals (V1)

SoundLab V1 focuses on a clean, maintainable foundation:

- Pure engine state (no side effects)
- Explicit setter functions
- UI‑side dirty flags and render scheduling
- Modular file structure
- Oscillators, FM operators, pitch envelope, vibrato, filter, FX, master section
- UI panels that reflect engine state
- Predictable, testable architecture

V1 is intentionally **monophonic** and **fixed‑routing** to keep the core simple.

---

## 🚀 Future Directions (V2 / V3)

SoundLab is built to evolve.

### V2
- Polyphony + voice manager  
- `noteOn` / `noteOff` API  
- Simple sequencer  
- MIDI input  
- Reorderable FX chain  
- Additional modulation sources  

### V3
- Modular routing graph  
- Patch cables / node‑based UI  
- Modulation matrix  
- Wavetable or sample oscillators  
- Automation lanes  
- Advanced sequencing  

---

## 🧱 Architecture Overview

SoundLab is structured around three layers:

### **1. Engine**
Pure data + pure DSP.  
No DOM, no UI logic, no side effects.

### **2. UI Runtime**
Dirty flags, render scheduling, panel rendering.

### **3. App Layer**
Initialization, event binding, orchestration.

This separation keeps the engine clean and the UI maintainable.

---

## 📁 Project Structure

```
/src
  /engine
    engineState.js
    engineDefaults.js
    setters.js
    dsp.js
    utils.js

  /presets
    loadPreset.js
    savePreset.js
    applyPresetToEngine.js
    serializeEngineState.js
    presetSchema.js

  /ui
    dirty.js
    scheduleRender.js
    renderUIFromState.js

    /panels
      pitchEnvPanel.js
      oscPanel.js
      fmPanel.js
      vibratoPanel.js
      filterPanel.js
      fxPanel.js
      masterPanel.js

    /bindings
      pitchEnvBindings.js
      oscBindings.js
      fmBindings.js
      vibratoBindings.js
      filterBindings.js
      fxBindings.js
      masterBindings.js

  /app
    main.js
    eventHandlers.js
    initUI.js
    initEngine.js

  /styles
    main.css
    panels.css
    controls.css

  /assets
    icons/
    waveforms/
    presets/

index.html
```

---

## 🛠️ Getting Started

Clone the repo:

```
git clone https://github.com/YOUR_USERNAME/soundlab.git
cd soundlab
```

Open `index.html` in your browser — no build step required.

---

## 📜 License

SoundLab is released under the **Apache 2.0 License**.  
See the `LICENSE` file for details.

---

## 💬 Contributing

Contributions are welcome.  
If you want to propose changes, please open an issue or submit a pull request.

Forks for the purpose of re‑branding or redistribution are not permitted.
