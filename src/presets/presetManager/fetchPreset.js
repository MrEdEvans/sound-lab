// src/presets/presetManager/fetchPreset.js

export async function fetchPreset(store, id) {
    if (!store) {
        throw new Error("fetchPreset: store is required.");
    }
    if (!id) {
        throw new Error("fetchPreset: id is required.");
    }

    return store.fetch(id);
}
