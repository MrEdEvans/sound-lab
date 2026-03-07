// src/presets/presetManager/PresetStore.js

export class PresetStore {
    constructor(options = {}) {
        this.indexedDBName = options.indexedDBName || "soundlab-presets";
        this.factoryPath = options.factoryPath || "./presetStorage/factory";
        this.userPath = options.userPath || "./presetStorage/user";
    }

    // Fetch a preset by ID (factory or user)
    async fetch(id) {
        // Implementation depends on your existing logic:
        // 1. Check user storage (IndexedDB)
        // 2. Fallback to factory JSON via fetch()
        // For now, assume you already had this in .load()
        return this.loadImpl(id); // rename your old internal load to loadImpl
    }

    async save(id, presetJSON) {
        // Save to IndexedDB (user presets)
        // (Reuse your existing implementation)
    }

    async list() {
        // List factory + user presets
    }

    async delete(id) {
        // Delete from user storage
    }

    // You can keep your old internal logic here
    // and just adapt names as needed.
}
