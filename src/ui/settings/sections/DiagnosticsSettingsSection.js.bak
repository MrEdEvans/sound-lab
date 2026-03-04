// src/ui/settings/sections/DiagnosticsSettingsSection.js

import { updateSetting } from "../settingsPanelAPI.js";
import Toggle from "../components/Toggle.js";
import Slider from "../components/Slider.js";
import Dropdown from "../components/Dropdown.js";

export default class DiagnosticsSettingsSection {
  constructor(settings) {
    this.settings = settings;
  }

  render() {
    const container = document.createElement("div");
    container.className = "settings-section";
    container.dataset.section = "diagnostics";

    const title = document.createElement("h2");
    title.textContent = "Diagnostics";
    container.appendChild(title);

    // -------------------------------------------------------------
    // Diagnostic Window (MVP)
    // -------------------------------------------------------------
    container.appendChild(
      new Toggle(
        "Show Diagnostic Window",
        this.settings.diagnostics.diagnosticWindow,
        value => updateSetting("diagnostics.diagnosticWindow", value)
      ).render()
    );

    // -------------------------------------------------------------
    // Diagnostic Verbosity (MVP)
    // -------------------------------------------------------------
    container.appendChild(
      new Slider(
        "Diagnostic Verbosity",
        this.settings.diagnostics.diagnosticVerbosity,
        1,
        5,
        1,
        value => updateSetting("diagnostics.diagnosticVerbosity", value)
      ).render()
    );

    // -------------------------------------------------------------
    // Debug Trace Enabled (MVP)
    // -------------------------------------------------------------
    container.appendChild(
      new Toggle(
        "Enable Debug Trace",
        this.settings.diagnostics.debugTrace.enabled,
        value => updateSetting("diagnostics.debugTrace.enabled", value)
      ).render()
    );

    // -------------------------------------------------------------
    // Debug Trace Level (MVP)
    // -------------------------------------------------------------
    container.appendChild(
      new Slider(
        "Debug Trace Level",
        this.settings.diagnostics.debugTrace.level,
        1,
        5,
        1,
        value => updateSetting("diagnostics.debugTrace.level", value)
      ).render()
    );

    // -------------------------------------------------------------
    // Debug Trace Type Filters (MVP)
    // -------------------------------------------------------------
    container.appendChild(
      new Dropdown(
        "Trace Types",
        this.settings.diagnostics.debugTrace.typeFilters.join(", "),
        ["info", "warn", "error", "critical"],
        value => {
          const selected = value.split(",").map(v => v.trim()).filter(Boolean);
          updateSetting("diagnostics.debugTrace.typeFilters", selected);
        }
      ).render()
    );

    return container;
  }
}
