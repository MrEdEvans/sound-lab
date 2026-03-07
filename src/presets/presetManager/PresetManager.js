// src/presets/presetManager/PresetManager.js

import { validatePreset } from "../presetValidation/validatePreset.js";
import { resolvePreset } from "./resolvePreset.js";
import { savePreset } from "./savePreset.js";
import { importPreset } from "./importPreset.js";
import { exportPreset } from "./exportPreset.js";
import { applyResolvedPreset } from "./applyResolvedPreset.js";
import { snapshotEngineState } from "./snapshotEngineState.js";
import { fetchPreset } from "./fetchPreset.js";
import { PresetStore } from "./PresetStore.js";

export class PresetManager {
    constructor(options = {}) {
        this.store = new PresetStore({
            indexedDBName: options.indexedDBName || "soundlab-presets",
            factoryPath: options.factoryPath || "./presetStorage/factory",
            userPath: options.userPath || "./presetStorage/user"
        });
    }

    // Fetch raw preset by ID (factory or user)
    async fetch(id) {
        return fetchPreset(this.store, id);
    }

    // Resolve a preset by ID into engine-ready form
    async resolve(id) {
        const rawPreset = await this.fetch(id);
        const errors = validatePreset(rawPreset);

        if (errors.length > 0) {
            throw new Error("Preset validation failed:\n" + errors.join("\n"));
        }

        return resolvePreset(rawPreset);
    }

    // Apply a preset to the running audio engine
    async applyToEngine(engine, id) {
        const resolved = await this.resolve(id);
        return applyResolvedPreset(engine, resolved);
    }

    // Save a preset to user storage from engine state
    async save(id, engineState, metadata) {
        const presetJSON = await savePreset(engineState, metadata);
        await this.store.save(id, presetJSON);
        return presetJSON;
    }

    // Import a preset from JSON (string or object) and store it
    async import(jsonInput) {
        const resolved = await importPreset(jsonInput);
        const id = resolved.metadata.uuid || crypto.randomUUID();
        await this.store.save(id, resolved);
        return id;
    }

    // Export a preset to JSON string
    async export(id, pretty = true) {
        const rawPreset = await this.fetch(id);
        return exportPreset(rawPreset, pretty);
    }

    // Snapshot the current engine state into a preset-shaped object
    snapshotFromEngine(engine, metadata = {}) {
        return snapshotEngineState(engine, metadata);
    }

    // List all presets (factory + user)
    async list() {
        return this.store.list();
    }

    // Delete a user preset
    async delete(id) {
        return this.store.delete(id);
    }
}
