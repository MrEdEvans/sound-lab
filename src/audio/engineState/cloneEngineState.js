// src/audio/engineState/cloneEngineState.js

export function cloneEngineState(state) {
    try {
        return structuredClone(state);
    } catch (err) {
        console.error("cloneEngineState failed:", err);
        throw err;
    }
}
