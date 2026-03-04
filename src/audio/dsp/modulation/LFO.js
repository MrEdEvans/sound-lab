// src/audio/dsp/modulation/LFO.js

export class LFO {
    constructor(context, config) {
        this.context = context;
        this.config = config;

        this.node = context.createOscillator();
        this.node.type = config.waveform || "sine";
        this.node.frequency.value = config.rate || 5;

        this.depth = context.createGain();
        this.depth.gain.value = config.depth || 50;

        this.node.connect(this.depth);
        this.output = this.depth;

        this.started = false;
    }

    start(time = this.context.currentTime) {
        if (!this.started) {
            this.node.start(time);
            this.started = true;
        }
    }

    stop(time = this.context.currentTime) {
        if (this.started) {
            this.node.stop(time);
            this.started = false;
        }
    }

    setParam(param, value, time = this.context.currentTime) {
        if (param === "rate") {
            this.node.frequency.setValueAtTime(value, time);
        }
        if (param === "depth") {
            this.depth.gain.setValueAtTime(value, time);
        }
    }
}
