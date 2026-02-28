// src/ui/settings/sections/MIDISettingsSection.js

export default class MIDISettingsSection {
  constructor(settings) {
    this.settings = settings;
  }

  render() {
    const el = document.createElement("div");
    el.className = "settings-section";

    const title = document.createElement("h2");
    title.textContent = "MIDI Settings";

    const placeholder = document.createElement("p");
    placeholder.textContent = "No MIDI settings available yet.";

    el.appendChild(title);
    el.appendChild(placeholder);

    return el;
  }
}
