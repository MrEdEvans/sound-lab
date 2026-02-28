// src/ui/settings/SettingsPanel.js

import { initSettingsPanelAPI, getSettings, subscribe } from "./settingsPanelAPI.js";
import UISettingsSection from "./sections/UISettingsSection.js";
import WorkflowSettingsSection from "./sections/WorkflowSettingsSection.js";
import EngineSettingsSection from "./sections/EngineSettingsSection.js";
import MIDISettingsSection from "./sections/MIDISettingsSection.js";
import DiagnosticsSettingsSection from "./sections/DiagnosticsSettingsSection.js";

export default class SettingsPanel {
  constructor(rootElement) {
    this.root = rootElement;
    this.settings = null;
    this.unsubscribe = null;
  }

  async init() {
    this.settings = await initSettingsPanelAPI();

    this.unsubscribe = subscribe(updated => {
      this.settings = updated;
      this.render();
    });

    this.render();
  }

  destroy() {
    if (this.unsubscribe) this.unsubscribe();
  }

  render() {
    this.root.innerHTML = "";

    this.root.appendChild(new UISettingsSection(this.settings).render());
    this.root.appendChild(new WorkflowSettingsSection(this.settings).render());
    this.root.appendChild(new EngineSettingsSection(this.settings).render());
    this.root.appendChild(new MIDISettingsSection(this.settings).render());
    this.root.appendChild(new DiagnosticsSettingsSection(this.settings).render());
  }
}
