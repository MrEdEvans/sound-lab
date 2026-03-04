// src/audio/fx/FXChain.js

import { FXFactory } from "./FXFactory.js";

export class FXChain {
    constructor(context, presetFX, impulseBuffer) {
        this.context = context;
        this.effects = [];

        this.input = context.createGain();
        this.output = context.createGain();

        this.buildChain(presetFX, impulseBuffer);
    }

    buildChain(presetFX, impulseBuffer) {
        let current = this.input;

        presetFX.forEach(entry => {
            const fx = FXFactory.create(this.context, entry, impulseBuffer);
            if (!fx) return;

            current.connect(fx.input);
            current = fx.output;

            this.effects.push(fx);
        });

        current.connect(this.output);
    }

    setParam(effectIndex, param, value) {
        const fx = this.effects[effectIndex];
        if (fx && fx.setParam) fx.setParam(param, value);
    }
}
