// src/audio/routing/RoutingTable.js

export class RoutingTable {
    constructor() {
        this.audio = [
            // Default subtractive path
            { from: "oscillators", to: "filters" },
            { from: "filters", to: "ampEnv" },
            { from: "ampEnv", to: "voiceGain" }
        ];

        this.modulation = [
            // Example: LFO1 → filter cutoff
            // { source: "lfo1", destination: "filter.cutoff", amount: 200 }
        ];
    }

    load(presetRouting) {
        if (!presetRouting) return;
        if (presetRouting.audio) this.audio = presetRouting.audio;
        if (presetRouting.modulation) this.modulation = presetRouting.modulation;
    }
}
