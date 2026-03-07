// src/audio/engineState/buildModMatrix.js

export function buildModMatrix(audioEngine, modules, modRouting) {
    if (!audioEngine) {
        throw new Error("buildModMatrix: audioEngine is required.");
    }

    // Hook into your modulation system here.
    // Example (pseudo):
    // audioEngine.modMatrix.buildFromPreset({ modules, modRouting });

    return { modules, modRouting };
}
