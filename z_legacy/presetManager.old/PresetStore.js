// src/presets/presetManager/PresetStore.js

export class PresetStore {
  constructor(options = {}) {
    this.indexedDBName = options.indexedDBName || "soundlab-presets";
    this.factoryPath = options.factoryPath || "./presetStorage/factory";
    this.userPath = options.userPath || "./presetStorage/user";

    this.dbPromise = this._openDB();
  }

  // ------------------------------------------------------------
  // IndexedDB Setup
  // ------------------------------------------------------------
  async _openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.indexedDBName, 1);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains("presets")) {
          db.createObjectStore("presets", { keyPath: "id" });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async _db() {
    return this.dbPromise;
  }

  // ------------------------------------------------------------
  // Load preset (user → factory)
  // ------------------------------------------------------------
  async load(id) {
    // Try user preset first
    const userPreset = await this._loadFromIndexedDB(id);
    if (userPreset) return userPreset.data;

    // Fallback to factory preset
    const factoryPreset = await this._loadFromFactory(id);
    if (factoryPreset) return factoryPreset;

    throw new Error(`Preset '${id}' not found in user or factory storage.`);
  }

  async _loadFromIndexedDB(id) {
    const db = await this._db();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("presets", "readonly");
      const store = tx.objectStore("presets");
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async _loadFromFactory(id) {
    const url = `${this.factoryPath}/${id}.json`;

    try {
      const response = await fetch(url);
      if (!response.ok) return null;
      return await response.json();
    } catch {
      return null;
    }
  }

  // ------------------------------------------------------------
  // Save preset (user storage only)
  // ------------------------------------------------------------
  async save(id, presetData) {
    const db = await this._db();

    return new Promise((resolve, reject) => {
      const tx = db.transaction("presets", "readwrite");
      const store = tx.objectStore("presets");

      const record = {
        id,
        data: presetData,
        updatedAt: Date.now()
      };

      const request = store.put(record);

      request.onsuccess = () => resolve(record);
      request.onerror = () => reject(request.error);
    });
  }

  // ------------------------------------------------------------
  // Delete user preset
  // ------------------------------------------------------------
  async delete(id) {
    const db = await this._db();

    return new Promise((resolve, reject) => {
      const tx = db.transaction("presets", "readwrite");
      const store = tx.objectStore("presets");
      const request = store.delete(id);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  // ------------------------------------------------------------
  // List presets (factory + user)
  // ------------------------------------------------------------
  async list() {
    const userPresets = await this._listIndexedDB();
    const factoryPresets = await this._listFactory();

    return {
      user: userPresets,
      factory: factoryPresets
    };
  }

  async _listIndexedDB() {
    const db = await this._db();

    return new Promise((resolve, reject) => {
      const tx = db.transaction("presets", "readonly");
      const store = tx.objectStore("presets");
      const request = store.getAll();

      request.onsuccess = () => {
        const list = request.result.map((item) => ({
          id: item.id,
          updatedAt: item.updatedAt
        }));
        resolve(list);
      };

      request.onerror = () => reject(request.error);
    });
  }

  async _listFactory() {
    // Factory presets must be enumerated manually or via a manifest file.
    // This implementation assumes a manifest.json exists in factoryPath.
    const manifestUrl = `${this.factoryPath}/manifest.json`;

    try {
      const response = await fetch(manifestUrl);
      if (!response.ok) return [];
      return await response.json();
    } catch {
      return [];
    }
  }
}
