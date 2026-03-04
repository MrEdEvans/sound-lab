// src/audio/dsp/oscillators/SquareOscillator.js

export class SquareOscillator {
    constructor(context, config) {
        this.context = context;
        this.config = config;

        this.node = context.createOscillator();
        this.node.type = "square";

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
