// src/audio/graph/connectModules.js

export function connectModules(graph) {
    const { oscillators, filters, ampEnv, voiceGain } = graph;

    if (oscillators.length > 0 && filters.length > 0) {
        oscillators.forEach(osc => {
            osc.output.connect(filters[0].input);
        });
    }

    for (let i = 0; i < filters.length - 1; i++) {
        filters[i].output.connect(filters[i + 1].input);
    }

    if (filters.length > 0 && ampEnv) {
        filters[filters.length - 1].output.connect(ampEnv.output);
    }

    if (ampEnv) {
        ampEnv.output.connect(voiceGain);
    }
}
