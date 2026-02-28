// src/ui/settings/sections/WorkflowSettingsSection.js

export default class WorkflowSettingsSection {
  constructor(settings) {
    this.settings = settings;
  }

  render() {
    const el = document.createElement("div");
    el.className = "settings-section";

    const title = document.createElement("h2");
    title.textContent = "Workflow Settings";

    const placeholder = document.createElement("p");
    placeholder.textContent = "No workflow settings available yet.";

    el.appendChild(title);
    el.appendChild(placeholder);

    return el;
  }
}
