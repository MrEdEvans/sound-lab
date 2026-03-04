import { updateSetting } from "../settingsPanelAPI.js";

export default class WaveVisualizationSettingsSection {
  constructor(settings) {
    this.settings = settings;
  }

  render() {
    const el = document.createElement("div");
    el.className = "settings-section";

    const title = document.createElement("h2");
    title.textContent = "Wave Visualization";

    // Style dropdown
    const styleLabel = document.createElement("label");
    styleLabel.textContent = "Style:";

    const styleSelect = document.createElement("select");
    ["default", "minimal", "bars", "line"].forEach(option => {
      const opt = document.createElement("option");
      opt.value = option;
      opt.textContent = option;
      if (this.settings.ui.waveVisualization.style === option) opt.selected = true;
      styleSelect.appendChild(opt);
    });

    styleSelect.addEventListener("change", () => {
      updateSetting("ui.waveVisualization.style", styleSelect.value);
    });

    // Smoothing slider
    const smoothingLabel = document.createElement("label");
    smoothingLabel.textContent = "Smoothing:";

    const smoothingSlider = document.createElement("input");
    smoothingSlider.type = "range";
    smoothingSlider.min = 0;
    smoothingSlider.max = 1;
    smoothingSlider.step = 0.01;
    smoothingSlider.value = this.settings.ui.waveVisualization.smoothing;

    smoothingSlider.addEventListener("input", () => {
      updateSetting("ui.waveVisualization.smoothing", parseFloat(smoothingSlider.value));
    });

    // Color picker
    const colorLabel = document.createElement("label");
    colorLabel.textContent = "Color:";

    const colorInput = document.createElement("input");
    colorInput.type = "color";
    colorInput.value = this.settings.ui.waveVisualization.color;

    colorInput.addEventListener("input", () => {
      updateSetting("ui.waveVisualization.color", colorInput.value);
    });

    el.appendChild(title);
    el.appendChild(styleLabel);
    el.appendChild(styleSelect);
    el.appendChild(smoothingLabel);
    el.appendChild(smoothingSlider);
    el.appendChild(colorLabel);
    el.appendChild(colorInput);

    return el;
  }
}
