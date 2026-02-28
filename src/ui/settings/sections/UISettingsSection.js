// src/ui/settings/sections/UISettingsSection.js

import { updateSetting } from "../settingsPanelAPI.js";
import Toggle from "../components/Toggle.js";
import Dropdown from "../components/Dropdown.js";
import Slider from "../components/Slider.js";

export default class UISettingsSection {
  constructor(settings) {
    this.settings = settings;
  }

  render() {
    const container = document.createElement("div");
    container.className = "settings-section";

    // Theme
    container.appendChild(
      new Dropdown("Theme", this.settings.ui.theme, ["light", "dark", "system"], value => {
        updateSetting("ui.theme", value);
      }).render()
    );

    // UI Scale
    container.appendChild(
      new Slider("UI Scale", this.settings.ui.uiScale, 0.5, 2.0, 0.1, value => {
        updateSetting("ui.uiScale", value);
      }).render()
    );

    // Wave Visualization Style
    container.appendChild(
      new Dropdown(
        "Waveform Style",
        this.settings.ui.waveVisualization.style,
        ["default", "minimal", "bars", "line"],
        value => updateSetting("ui.waveVisualization.style", value)
      ).render()
    );

    // Waveform Smoothing
    container.appendChild(
      new Slider(
        "Waveform Smoothing",
        this.settings.ui.waveVisualization.smoothing,
        0,
        1,
        0.01,
        value => updateSetting("ui.waveVisualization.smoothing", value)
      ).render()
    );

    return container;
  }
}
