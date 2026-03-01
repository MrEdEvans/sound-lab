import {
  initSettingsPanelAPI,
  getSettings,
  subscribe
} from "./settingsPanelAPI.js";

import UISettingsSection from "./sections/UISettingsSection.js";
import WorkflowSettingsSection from "./sections/WorkflowSettingsSection.js";
import EngineSettingsSection from "./sections/EngineSettingsSection.js";
import MIDISettingsSection from "./sections/MIDISettingsSection.js";
import DiagnosticsSettingsSection from "./sections/DiagnosticsSettingsSection.js";

import WaveVisualizationSettingsSection from "./sections/WaveVisualizationSettingsSection.js";

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

  render() {
    this.root.innerHTML = "";

    const sections = [
      new UISettingsSection(this.settings),
      new WaveVisualizationSettingsSection(this.settings),
      new EngineSettingsSection(this.settings),
      new MIDISettingsSection(this.settings),
      new DiagnosticsSettingsSection(this.settings),
      new WorkflowSettingsSection(this.settings)
    ];



    for (const section of sections) {
      this.root.appendChild(section.render());
    }
  }

  destroy() {
    if (this.unsubscribe) this.unsubscribe();
    this.root.innerHTML = "";
  }
}
