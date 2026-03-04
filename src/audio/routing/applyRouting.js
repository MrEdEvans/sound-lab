// src/audio/routing/applyRouting.js

export function applyRouting(graph, routingTable) {
    const { audio } = routingTable;

    // Clear existing connections
    graph.voiceBus.disconnect();

    // Connect oscillators → filters
    if (audio.find(r => r.from === "oscillators" && r.to === "filters")) {
        graph.oscillators.forEach(osc => {
            osc.output.connect(graph.filters[0].input);
        });
    }

    // Connect filters → amp envelope
    if (audio.find(r => r.from === "filters" && r.to === "ampEnv")) {
        graph.filters.forEach((filter, i) => {
            const next = graph.filters[i + 1];
            if (next) {
                filter.output.connect(next.input);
            } else {
                filter.output.connect(graph.ampEnv.input);
            }
        });
    }

    // Connect amp envelope → voice gain
    if (audio.find(r => r.from === "ampEnv" && r.to === "voiceGain")) {
        graph.ampEnv.output.connect(graph.voiceGain);
    }
}
