// src/engine/settings/SettingsStore.js

import { defaultSettings } from "./defaultSettings.js";
import { validateSettings } from "./validateSettings.js";

const DB_NAME = "soundlab-settings";
const STORE_NAME = "globalSettings";
const KEY = "settings";

let cachedSettings = null;
let subscribers = [];

// -------------------------------------------------------------
// Public API
// -------------------------------------------------------------

export const SettingsStore = {
  async load() {
    if (cachedSettings) return cachedSettings;

    const stored = await readFromDB();
    const merged = mergeWithDefaults(stored || {});
    const errors = validateSettings(merged);

    if (errors.length > 0) {
      console.warn("Settings validation errors:", errors);
    }

    cachedSettings = merged;
    return merged;
  },

  async save(newSettings) {
    const merged = mergeWithDefaults(newSettings);
    const errors = validateSettings(merged);

    if (errors.length > 0) {
      console.warn("Settings validation errors:", errors);
    }

    cachedSettings = merged;
    await writeToDB(merged);
    notifySubscribers(merged);
    return merged;
  },

  subscribe(fn) {
    subscribers.push(fn);
    return () => {
      subscribers = subscribers.filter(s => s !== fn);
    };
  }
};

// -------------------------------------------------------------
// Internal helpers
// -------------------------------------------------------------

function mergeWithDefaults(userSettings) {
  return {
    ui: {
      ...defaultSettings.ui,
      ...userSettings.ui,

      waveVisualization: {
        ...defaultSettings.ui.waveVisualization,
        ...(userSettings.ui?.waveVisualization || {})
      },

      panelVisibility: {
        ...defaultSettings.ui.panelVisibility,
        ...(userSettings.ui?.panelVisibility || {})
      },

      settingsPanel: {
        ...defaultSettings.ui.settingsPanel,
        ...(userSettings.ui?.settingsPanel || {})
      }
    },

    workflow: {
      ...defaultSettings.workflow,
      ...userSettings.workflow
    },

    engine: {
      ...defaultSettings.engine,
      ...userSettings.engine
    },

    midi: {
      ...defaultSettings.midi,
      ...userSettings.midi
    },

    diagnostics: {
      ...defaultSettings.diagnostics,
      ...userSettings.diagnostics,
      debugTrace: {
        ...defaultSettings.diagnostics.debugTrace,
        ...(userSettings.diagnostics?.debugTrace || {})
      }
    }
  };
}

function notifySubscribers(settings) {
  for (const fn of subscribers) {
    try {
      fn(settings);
    } catch (err) {
      console.error("Settings subscriber error:", err);
    }
  }
}

// -------------------------------------------------------------
// IndexedDB helpers
// -------------------------------------------------------------

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);

    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function readFromDB() {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(KEY);

    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

async function writeToDB(settings) {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(settings, KEY);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}
