// src/audio/engineState/buildAudioGraph.js

export function buildAudioGraph(audioEngine, modules, audioRouting) {
    if (!audioEngine) {
        throw new Error("buildAudioGraph: audioEngine is required.");
    }

    // This is where you hook into your actual graph builder.
    // Example (pseudo):
    // audioEngine.graph.buildFromPreset({ modules, audioRouting });

    // Placeholder: return data for now.
    return { modules, audioRouting };
}
