// src/presets/presetManager/PresetManager.js

import { validatePreset } from "../presetValidation/validatePreset.js";
import { loadPreset } from "./loadPreset.js";
import { savePreset } from "./savePreset.js";
import { importPreset } from "./importPreset.js";
import { exportPreset } from "./exportPreset.js";
import { applyPresetToEngine } from "./applyPresetToEngine.js";
import { serializeEngineState } from "./serializeEngineState.js";
import { PresetStore } from "./PresetStore.js";

export class PresetManager {
  constructor(options = {}) {
    this.store = new PresetStore({
      indexedDBName: options.indexedDBName || "soundlab-presets",
      factoryPath: options.factoryPath || "/src/presets/presetStorage/factory",
      userPath: options.userPath || "/src/presets/presetStorage/user"
    });
  }

  // Load a preset by ID (factory or user)
  async load(id) {
    const preset = await this.store.load(id);
    const errors = validatePreset(preset);

    if (errors.length > 0) {
      throw new Error("Preset validation failed:\n" + errors.join("\n"));
    }

    return loadPreset(preset);
  }

  // Save a preset to user storage
  async save(id, engineState, metadata) {
    const presetJSON = await savePreset(engineState, metadata);
    await this.store.save(id, presetJSON);
    return presetJSON;
  }

  // Import a preset from JSON (string or object)
  async import(jsonInput) {
    const preset = await importPreset(jsonInput);
    const id = preset.metadata.uuid || crypto.randomUUID();
    await this.store.save(id, preset);
    return id;
  }

  // Export a preset to JSON string
  async export(id) {
    const preset = await this.store.load(id);
    return exportPreset(preset);
  }

  // Apply a preset to the running audio engine
  async applyToEngine(engine, id) {
    const preset = await this.store.load(id);
    const errors = validatePreset(preset);

    if (errors.length > 0) {
      throw new Error("Preset validation failed:\n" + errors.join("\n"));
    }

    return applyPresetToEngine(engine, preset);
  }

  // Serialize the current engine state into a preset object
  serializeFromEngine(engine, metadata = {}) {
    return serializeEngineState(engine, metadata);
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
