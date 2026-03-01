// src/ui/settings/settingsPanelAPI.js

import { SettingsStore } from "../../engine/settings/SettingsStore.js";

let currentSettings = null;
let listeners = [];

// -------------------------------------------------------------
// Initialization
// -------------------------------------------------------------

export async function initSettingsPanelAPI() {
  console.log("initSettingsPanelAPI called");

  currentSettings = await SettingsStore.load();

  // Subscribe to store updates so UI stays in sync
  SettingsStore.subscribe(updated => {
    currentSettings = updated;
    notifyListeners(updated);
  });

  return currentSettings;
}

// -------------------------------------------------------------
// Public API
// -------------------------------------------------------------

export function getSettings() {
  return currentSettings;
}

export async function updateSetting(path, value) {
  const updated = applyPathUpdate(currentSettings, path, value);
  return SettingsStore.save(updated);
}

export async function updateSettings(partialObject) {
  const merged = deepMerge(currentSettings, partialObject);
  return SettingsStore.save(merged);
}

export function subscribe(fn) {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter(l => l !== fn);
  };
}

// -------------------------------------------------------------
// Internal helpers
// -------------------------------------------------------------


function notifyListeners(settings) {
  for (const fn of listeners) {
    try {
      fn(settings);
    } catch (err) {
      console.error("SettingsPanelAPI subscriber error:", err);
    }
  }
}

function applyPathUpdate(obj, path, value) {
  const parts = path.split(".");
  const clone = structuredClone(obj);
  let cursor = clone;

  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    if (typeof cursor[key] !== "object" || cursor[key] === null) {
      cursor[key] = {};
    }
    cursor = cursor[key];
  }

  cursor[parts[parts.length - 1]] = value;
  return clone;
}

function deepMerge(base, patch) {
  const output = structuredClone(base);

  for (const key in patch) {
    if (isObject(patch[key]) && isObject(output[key])) {
      output[key] = deepMerge(output[key], patch[key]);
    } else {
      output[key] = patch[key];
    }
  }

  return output;
}

function isObject(v) {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}
