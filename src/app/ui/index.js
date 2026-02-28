import ActionBar from "./ActionBar.js";
import FloatingSettingsPanel from "./FloatingSettingsPanel.js";

export default function initUI() {
  const root = document.getElementById("app");

  const settingsPanel = new FloatingSettingsPanel();
  const actionBar = new ActionBar(() => settingsPanel.toggle());

  actionBar.mount(root);
}
