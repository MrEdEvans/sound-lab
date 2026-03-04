// src/audio/fx/EQEffect.js

export class EQEffect {
    constructor(context, config = {}) {
        this.context = context;

        this.input = context.createGain();
        this.output = context.createGain();

        this.low = context.createBiquadFilter();
        this.low.type = "lowshelf";
        this.low.frequency.value = 200;
        this.low.gain.value = config.low || 0;

        this.mid = context.createBiquadFilter();
        this.mid.type = "peaking";
        this.mid.frequency.value = 1000;
        this.mid.Q.value = 1;
        this.mid.gain.value = config.mid || 0;

        this.high = context.createBiquadFilter();
        this.high.type = "highshelf";
        this.high.frequency.value = 5000;
        this.high.gain.value = config.high || 0;

        this.input.connect(this.low);
        this.low.connect(this.mid);
        this.mid.connect(this.high);
        this.high.connect(this.output);
    }

    setParam(param, value) {
        if (param === "low") this.low.gain.value = value;
        if (param === "mid") this.mid.gain.value = value;
        if (param === "high") this.high.gain.value = value;
    }
}
