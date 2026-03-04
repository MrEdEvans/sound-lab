// src/audio/dsp/filters/HighPassFilter.js

export class HighPassFilter {
    constructor(context, config) {
        this.context = context;
        this.config = config;

        this.node = context.createBiquadFilter();
        this.node.type = "highpass";

        this.node.frequency.value = config.cutoff || 500;
        this.node.Q.value = config.resonance || 0.7;

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
