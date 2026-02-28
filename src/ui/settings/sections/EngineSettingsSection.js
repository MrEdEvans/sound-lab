// src/ui/settings/sections/EngineSettingsSection.js

import { updateSetting } from "../settingsPanelAPI.js";
import Dropdown from "../components/Dropdown.js";
import Slider from "../components/Slider.js";
import Toggle from "../components/Toggle.js";

export default class EngineSettingsSection {
  constructor(settings) {
    this.settings = settings;
  }

  render() {
    const container = document.createElement("div");
    container.className = "settings-section";
    container.dataset.section = "engine";

    const title = document.createElement("h2");
    title.textContent = "Engine Settings";
    container.appendChild(title);

    // -------------------------------------------------------------
    // Oversampling (MVP)
    // -------------------------------------------------------------
    container.appendChild(
      new Dropdown(
        "Oversampling",
        this.settings.engine.oversampling,
        ["off", "2x", "4x"],
        value => updateSetting("engine.oversampling", value)
      ).render()
    );

    // -------------------------------------------------------------
    // Polyphony Limit (MVP)
    // -------------------------------------------------------------
    container.appendChild(
      new Slider(
        "Polyphony Limit",
        this.settings.engine.polyphonyLimit,
        1,
        64,
        1,
        value => updateSetting("engine.polyphonyLimit", value)
      ).render()
    );

    // -------------------------------------------------------------
    // V2+ fields (commented out for now)
    // -------------------------------------------------------------

    /*
    // Tuning System
    container.appendChild(
      new Dropdown(
        "Tuning System",
        this.settings.engine.tuningSystem,
        ["A440", "stretched", "custom"],
        value => updateSetting("engine.tuningSystem", value)
      ).render()
    );

    // Pitch Bend Range
    container.appendChild(
      new Slider(
        "Pitch Bend Range (semitones)",
        this.settings.engine.pitchBendRange,
        1,
        48,
        1,
        value => updateSetting("engine.pitchBendRange", value)
      ).render()
    );

    // MPE Mode
    container.appendChild(
      new Toggle(
        "Enable MPE",
        this.settings.engine.mpeEnabled,
        value => updateSetting("engine.mpeEnabled", value)
      ).render()
    );

    // Aftertouch Mode
    container.appendChild(
      new Dropdown(
        "Aftertouch Mode",
        this.settings.engine.aftertouchMode,
        ["poly", "channel"],
        value => updateSetting("engine.aftertouchMode", value)
      ).render()
    );

    // Velocity Curve
    container.appendChild(
      new Dropdown(
        "Velocity Curve",
        this.settings.engine.velocityCurve,
        ["linear", "soft", "hard", "custom"],
        value => updateSetting("engine.velocityCurve", value)
      ).render()
    );
    */

    return container;
  }
}
