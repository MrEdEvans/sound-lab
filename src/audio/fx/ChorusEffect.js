// src/audio/fx/ChorusEffect.js

export class ChorusEffect {
    constructor(context, config = {}) {
        this.context = context;

        this.input = context.createGain();
        this.output = context.createGain();

        this.delay = context.createDelay();
        this.delay.delayTime.value = config.delay || 0.015;

        this.lfo = context.createOscillator();
        this.lfo.frequency.value = config.rate || 0.25;

        this.depth = context.createGain();
        this.depth.gain.value = config.depth || 0.005;

        this.lfo.connect(this.depth);
        this.depth.connect(this.delay.delayTime);

        this.input.connect(this.delay);
        this.delay.connect(this.output);

        this.lfo.start();
    }

    setParam(param, value) {
        if (param === "rate") this.lfo.frequency.value = value;
        if (param === "depth") this.depth.gain.value = value;
        if (param === "delay") this.delay.delayTime.value = value;
    }
}
