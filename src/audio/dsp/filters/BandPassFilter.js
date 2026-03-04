// src/audio/dsp/filters/BandPassFilter.js

export class BandPassFilter {
    constructor(context, config) {
        this.context = context;
        this.config = config;

        this.node = context.createBiquadFilter();
        this.node.type = "bandpass";

        this.node.frequency.value = config.cutoff || 800;
        this.node.Q.value = config.resonance || 1.0;

        this.input = this.node;
        this.output = this.node;
    }

    setParam(param, value, time) {
        if (param === "cutoff") {
            this.node.frequency.setValueAtTime(value, time);
        }
        if (param === "resonance") {
            this.node.Q.setValueAtTime(value, time);
        }
    }
}
