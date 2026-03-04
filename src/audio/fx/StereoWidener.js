// src/audio/fx/StereoWidener.js

export class StereoWidener {
    constructor(context, config = {}) {
        this.context = context;

        this.input = context.createGain();
        this.output = context.createGain();

        this.splitter = context.createChannelSplitter(2);
        this.merger = context.createChannelMerger(2);

        this.leftGain = context.createGain();
        this.rightGain = context.createGain();

        const amount = config.amount || 0.3;
        this.leftGain.gain.value = 1 + amount;
        this.rightGain.gain.value = 1 - amount;

        this.input.connect(this.splitter);

        this.splitter.connect(this.leftGain, 0);
        this.splitter.connect(this.rightGain, 1);

        this.leftGain.connect(this.merger, 0, 0);
        this.rightGain.connect(this.merger, 0, 1);

        this.merger.connect(this.output);
    }

    setParam(param, value) {
        if (param === "amount") {
            this.leftGain.gain.value = 1 + value;
            this.rightGain.gain.value = 1 - value;
        }
    }
}
