// src/audio/dsp/envelopes/ADSREnvelope.js

export class ADSREnvelope {
    constructor(context, config) {
        this.context = context;
        this.attack = config.attack || 0.01;
        this.decay = config.decay || 0.1;
        this.sustain = config.sustain || 0.7;
        this.release = config.release || 0.2;

        this.output = context.createGain();

        const now = context.currentTime;
        this.output.gain.cancelScheduledValues(now);
        this.output.gain.setValueAtTime(0, now);
    }

    triggerAttack(time) {
        const g = this.output.gain;
        g.cancelScheduledValues(time);
        g.setValueAtTime(0, time);
        g.linearRampToValueAtTime(1, time + this.attack);
        g.linearRampToValueAtTime(this.sustain, time + this.attack + this.decay);
    }

    triggerRelease(time) {
        const g = this.output.gain;
        g.cancelScheduledValues(time);
        g.setValueAtTime(g.value, time);
        g.linearRampToValueAtTime(0, time + this.release);
    }

    setParam(param, value, time) {
        if (param === "attack") this.attack = value;
        if (param === "decay") this.decay = value;
        if (param === "sustain") this.sustain = value;
        if (param === "release") this.release = value;
    }
}
