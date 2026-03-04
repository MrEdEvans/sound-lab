// src/audio/fx/DelayEffect.js

export class DelayEffect {
    constructor(context, config = {}) {
        this.context = context;

        this.input = context.createGain();
        this.output = context.createGain();

        this.delay = context.createDelay();
        this.delay.delayTime.value = config.time || 0.3;

        this.feedback = context.createGain();
        this.feedback.gain.value = config.feedback || 0.4;

        this.wet = context.createGain();
        this.wet.gain.value = config.wet || 0.5;

        this.dry = context.createGain();
        this.dry.gain.value = 1 - this.wet.gain.value;

        this.input.connect(this.delay);
        this.delay.connect(this.feedback);
        this.feedback.connect(this.delay);

        this.delay.connect(this.wet);
        this.input.connect(this.dry);

        this.wet.connect(this.output);
        this.dry.connect(this.output);
    }

    setParam(param, value) {
        if (param === "time") this.delay.delayTime.value = value;
        if (param === "feedback") this.feedback.gain.value = value;
        if (param === "wet") {
            this.wet.gain.value = value;
            this.dry.gain.value = 1 - value;
        }
    }
}
