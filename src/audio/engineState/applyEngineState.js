// src/audio/engineState/applyEngineState.js

import { buildAudioGraph } from "./buildAudioGraph.js";
import { buildModMatrix } from "./buildModMatrix.js";

export function applyEngineState(audioEngine, engineState) {
    if (!audioEngine) {
        throw new Error("applyEngineState: audioEngine is required.");
    }
    if (!engineState) {
        throw new Error("applyEngineState: engineState is required.");
    }

    const { engine, modules, audioRouting, modRouting } = engineState;

    if (engine) {
        if (typeof engine.polyphony === "number" && audioEngine.setPolyphony) {
            audioEngine.setPolyphony(engine.polyphony);
        }
        if (typeof engine.tuning === "number" && audioEngine.setTuning) {
            audioEngine.setTuning(engine.tuning);
        }
        if (typeof engine.glide === "number" && audioEngine.setGlide) {
            audioEngine.setGlide(engine.glide);
        }
        if (typeof engine.legato === "boolean" && audioEngine.setLegato) {
            audioEngine.setLegato(engine.legato);
        }
        if (Array.isArray(engine.macros) && audioEngine.setMacros) {
            audioEngine.setMacros(engine.macros);
        }
    }

    buildAudioGraph(audioEngine, modules || [], audioRouting || []);
    buildModMatrix(audioEngine, modules || [], modRouting || []);

    return engineState;
}
