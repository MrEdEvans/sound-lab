// src/engine/presets/PresetStore.js

import { savePreset } from "./savePreset.js";
import { loadPreset } from "./loadPreset.js";

const DB_NAME = "SoundLabPresetsDB";
const STORE_NAME = "presets";
const DB_VERSION = 1;

export class PresetStore {
  static openDB() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);

      req.onupgradeneeded = () => {
        const db = req.result;

        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });

          store.createIndex("name", "name", { unique: false });
          store.createIndex("author", "author", { unique: false });
          store.createIndex("createdAt", "createdAt", { unique: false });
          store.createIndex("updatedAt", "updatedAt", { unique: false });
        }
      };

      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  // Save a preset (atomic)
  static async save(id, engineState, metadata) {
    const db = await PresetStore.openDB();
    const presetJson = await savePreset(engineState, metadata, true);

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);

      const record = {
        id,
        name: metadata.name,
        author: metadata.author,
        createdAt: metadata.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        presetJson
      };

      store.put(record);

      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  }

  // Load a preset (validated)
  static async load(id) {
    const db = await PresetStore.openDB();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);

      const req = store.get(id);

      req.onsuccess = async () => {
        const record = req.result;
        if (!record) return resolve(null);

        try {
          const presetObj = JSON.parse(record.presetJson);
          const { engineState, metadata } = await loadPreset(presetObj);
          resolve({ engineState, metadata, record });
        } catch (err) {
          reject(new Error("Corrupted preset JSON in IndexedDB."));
        }
      };

      req.onerror = () => reject(req.error);
    });
  }

  // List all presets
  static async list() {
    const db = await PresetStore.openDB();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);

      const req = store.getAll();

      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  // Delete a preset
  static async delete(id) {
    const db = await PresetStore.openDB();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).delete(id);

      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  }
}
