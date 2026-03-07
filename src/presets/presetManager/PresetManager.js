// src/presets/presetManager/PresetManager.js

import { generateDefaultEngineState } from "../../audio/engineState/generateDefaultEngineState.js";
import { validateEngineState } from "../../audio/engineState/validateEngineState.js";
import { applyEngineState } from "../../audio/engineState/applyEngineState.js";
import { cloneEngineState } from "../../audio/engineState/cloneEngineState.js";

/**
 * PresetManager
 * -------------
 * Handles:
 *  - fetching presets
 *  - resolving presets (merging defaults + validation)
 *  - applying presets to the engine
 *  - snapshotting engine state into a preset
 *  - saving, exporting, importing presets
 *
 * Presets now follow the schema:
 * {
 *   metadata: {...},
 *   engine: {...},
 *   modules: [...],
 *   audioRouting: [...],
 *   modRouting: [...],
 *   ui: {...},
 *   userData: {...}
 * }
 */
export class PresetManager {
    constructor() {
        // In-memory preset store for testing
        this.presets = new Map();

        // Create a built‑in "init" preset
        this.presets.set("init", this._createInitPreset());
    }

    // ------------------------------------------------------------
    // Internal: create a default preset matching the schema
    // ------------------------------------------------------------
    _createInitPreset() {
        const defaults = generateDefaultEngineState();

        return {
            metadata: {
                name: "Init",
                author: "System",
                description: "Default initialized preset",
                tags: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },

            engine: defaults.engine,
            modules: defaults.modules,
            audioRouting: defaults.audioRouting,
            modRouting: defaults.modRouting,

            ui: {
                selectedTab: "main",
                expandedModules: [],
                collapsedClusters: []
            },

            userData: {}
        };
    }

    // ------------------------------------------------------------
    // Fetch preset by ID
    // ------------------------------------------------------------
    async fetch(id) {
        if (!this.presets.has(id)) {
            throw new Error(`Preset '${id}' not found`);
        }
        return cloneEngineState(this.presets.get(id));
    }

    // ------------------------------------------------------------
    // Resolve preset: merge with defaults + validate
    // ------------------------------------------------------------
    async resolve(id) {
        const preset = await this.fetch(id);

        // Validate engine portion
        const engineErrors = validateEngineState({
            engine: preset.engine,
            modules: preset.modules,
            audioRouting: preset.audioRouting,
            modRouting: preset.modRouting
        });

        if (engineErrors.length > 0) {
            console.warn("Preset validation errors:", engineErrors);
            throw new Error(`Preset '${id}' failed validation`);
        }

        return preset;
    }

    // ------------------------------------------------------------
    // Apply preset to engine
    // ------------------------------------------------------------
    async applyToEngine(audioEngine, id) {
        const preset = await this.resolve(id);

        applyEngineState(audioEngine, {
            engine: preset.engine,
            modules: preset.modules,
            audioRouting: preset.audioRouting,
            modRouting: preset.modRouting
        });

        return preset;
    }

    // ------------------------------------------------------------
    // Snapshot engine → preset
    // ------------------------------------------------------------
    snapshotFromEngine(audioEngine, metadataOverrides = {}) {
        // NOTE: You will later replace this with real engine introspection.
        // For now, we snapshot only the engine portion.
        const engineSnapshot = generateDefaultEngineState();

        const preset = {
            metadata: {
                name: metadataOverrides.name || "Snapshot",
                author: metadataOverrides.author || "Unknown",
                description: metadataOverrides.description || "",
                tags: metadataOverrides.tags || [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },

            engine: engineSnapshot.engine,
            modules: engineSnapshot.modules,
            audioRouting: engineSnapshot.audioRouting,
            modRouting: engineSnapshot.modRouting,

            ui: {
                selectedTab: "main",
                expandedModules: [],
                collapsedClusters: []
            },

            userData: {}
        };

        return preset;
    }

    // ------------------------------------------------------------
    // Save preset
    // ------------------------------------------------------------
    async save(id, presetObject) {
        // Validate before saving
        const engineErrors = validateEngineState({
            engine: presetObject.engine,
            modules: presetObject.modules,
            audioRouting: presetObject.audioRouting,
            modRouting: presetObject.modRouting
        });

        if (engineErrors.length > 0) {
            throw new Error(`Cannot save preset '${id}': validation failed`);
        }

        presetObject.metadata.updatedAt = new Date().toISOString();
        this.presets.set(id, cloneEngineState(presetObject));

        return { id, saved: true };
    }

    // ------------------------------------------------------------
    // Export preset → JSON string
    // ------------------------------------------------------------
    async export(id) {
        const preset = await this.fetch(id);
        return JSON.stringify(preset, null, 2);
    }

    // ------------------------------------------------------------
    // Import preset from JSON string
    // ------------------------------------------------------------
    async import(jsonText) {
        let parsed;
        try {
            parsed = JSON.parse(jsonText);
        } catch (err) {
            throw new Error("Invalid JSON file");
        }

        // Validate engine portion
        const engineErrors = validateEngineState({
            engine: parsed.engine,
            modules: parsed.modules,
            audioRouting: parsed.audioRouting,
            modRouting: parsed.modRouting
        });

        if (engineErrors.length > 0) {
            console.warn("Imported preset validation errors:", engineErrors);
            throw new Error("Imported preset failed validation");
        }

        // Generate ID
        const id = parsed.metadata?.name
            ? parsed.metadata.name.toLowerCase().replace(/\s+/g, "-")
            : `imported-${Date.now()}`;

        this.presets.set(id, parsed);

        return id;
    }
}
