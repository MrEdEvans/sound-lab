// src/audio/fx/ReverbEffect.js

export class ReverbEffect {
    constructor(context, impulseBuffer, config = {}) {
        this.context = context;

        this.input = context.createGain();
        this.output = context.createGain();

        this.convolver = context.createConvolver();
        this.convolver.buffer = impulseBuffer;

        this.wet = context.createGain();
        this.wet.gain.value = config.wet || 0.4;

        this.dry = context.createGain();
        this.dry.gain.value = 1 - this.wet.gain.value;

        this.input.connect(this.convolver);
        this.convolver.connect(this.wet);

        this.input.connect(this.dry);

        this.wet.connect(this.output);
        this.dry.connect(this.output);
    }

    setParam(param, value) {
        if (param === "wet") {
            this.wet.gain.value = value;
            this.dry.gain.value = 1 - value;
        }
    }
}
