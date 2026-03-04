// src/audio/fx/CompressorEffect.js

export class CompressorEffect {
    constructor(context, config = {}) {
        this.context = context;

        this.input = context.createGain();
        this.output = context.createGain();

        this.comp = context.createDynamicsCompressor();

        this.comp.threshold.value = config.threshold || -24;
        this.comp.knee.value = config.knee || 30;
        this.comp.ratio.value = config.ratio || 12;
        this.comp.attack.value = config.attack || 0.003;
        this.comp.release.value = config.release || 0.25;

        this.input.connect(this.comp);
        this.comp.connect(this.output);
    }

    setParam(param, value) {
        if (param in this.comp) this.comp[param].value = value;
    }
}
