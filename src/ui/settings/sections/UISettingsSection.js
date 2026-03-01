// src/ui/settings/sections/UISettingsSection.js

import { updateSetting } from "../settingsPanelAPI.js";

export default class UISettingsSection {
  constructor(settings) {
    this.settings = settings;
  }

  render() {
    const el = document.createElement("div");
    el.className = "settings-section";

    const title = document.createElement("h2");
    title.textContent = "UI Settings";

    // Theme dropdown
    const themeLabel = document.createElement("label");
    themeLabel.textContent = "Theme:";

    const themeSelect = document.createElement("select");
    ["dark", "light", "system"].forEach(option => {
      const opt = document.createElement("option");
      opt.value = option;
      opt.textContent = option;
      if (this.settings.ui.theme === option) opt.selected = true;
      themeSelect.appendChild(opt);
    });

    themeSelect.addEventListener("change", () => {
      updateSetting("ui.theme", themeSelect.value);
    });

    // UI Scale slider
    const scaleLabel = document.createElement("label");
    scaleLabel.textContent = "UI Scale:";

    const scaleSlider = document.createElement("input");
    scaleSlider.type = "range";
    scaleSlider.min = 0.5;
    scaleSlider.max = 2.0;
    scaleSlider.step = 0.1;
    scaleSlider.value = this.settings.ui.uiScale;

    scaleSlider.addEventListener("input", () => {
      updateSetting("ui.uiScale", parseFloat(scaleSlider.value));
    });

    el.appendChild(title);
    el.appendChild(themeLabel);
    el.appendChild(themeSelect);
    el.appendChild(scaleLabel);
    el.appendChild(scaleSlider);

    return el;
  }
}
