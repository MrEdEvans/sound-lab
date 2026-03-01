import initUI from "./ui/index.js";
import { SettingsStore } from "../engine/settings/SettingsStore.js";
import { initSettingsPanelAPI } from "../ui/settings/settingsPanelAPI.js";

async function init() {
  // 1. Load engine settings
  const settings = await SettingsStore.load();
  console.log("Loaded settings:", settings);

  // 2. Initialize UI settings API (fills currentSettings)
  await initSettingsPanelAPI();

  // 3. Now UI can safely read settings
  initUI();
}

init();
