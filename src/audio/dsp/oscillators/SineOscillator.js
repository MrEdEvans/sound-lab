// src/audio/dsp/oscillators/SineOscillator.js

export class SineOscillator {
    constructor(context, config) {
        this.context = context;
        this.config = config;

        this.node = context.createOscillator();
        this.node.type = "sine";

        this.output = this.node;
    }

    start(freq, time) {
        this.node.frequency.setValueAtTime(freq, time);
        this.node.start(time);
    }

    stop(time) {
        this.node.stop(time);
    }

    setParam(param, value, time) {
        if (param === "frequency") {
            this.node.frequency.setValueAtTime(value, time);
        }
    }
}
