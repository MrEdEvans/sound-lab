// src/audio/fx/DistortionEffect.js

export class DistortionEffect {
    constructor(context, config = {}) {
        this.context = context;

        this.input = context.createGain();
        this.output = context.createGain();

        this.shaper = context.createWaveShaper();
        this.shaper.curve = this.makeCurve(config.amount || 50);

        this.input.connect(this.shaper);
        this.shaper.connect(this.output);
    }

    makeCurve(amount) {
        const n = 2048;
        const curve = new Float32Array(n);
        for (let i = 0; i < n; i++) {
            const x = (i / n) * 2 - 1;
            curve[i] = ((3 + amount) * x * 20 * Math.PI) / (Math.PI + amount * Math.abs(x));
        }
        return curve;
    }

    setParam(param, value) {
        if (param === "amount") {
            this.shaper.curve = this.makeCurve(value);
        }
    }
}
