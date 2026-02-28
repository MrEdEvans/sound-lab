// src/app/settings/SettingsPanel.js

import UISettingsSection from "./sections/UISettingsSection.js";
import EngineSettingsSection from "./sections/EngineSettingsSection.js";
import MIDISettingsSection from "./sections/MIDISettingsSection.js";
import DiagnosticsSettingsSection from "./sections/DiagnosticsSettingsSection.js";

import { getSettings } from "./settingsPanelAPI.js";

export default class SettingsPanel {
  constructor(rootEl) {
    this.rootEl = rootEl;
    this.sections = [];
  }

  async init() {
    const settings = getSettings();

    this.rootEl.innerHTML = "";
    this.rootEl.classList.add("settings-panel");

    this.sections = [
      new UISettingsSection(settings),
      new EngineSettingsSection(settings),
      new MIDISettingsSection(settings),
      new DiagnosticsSettingsSection(settings)
    ];

    for (const section of this.sections) {
      const el = section.render();
      this.rootEl.appendChild(el);
    }
  }

  destroy() {
    this.rootEl.innerHTML = "";
    this.sections = [];
  }
}
