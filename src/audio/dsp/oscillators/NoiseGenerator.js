// src/audio/dsp/oscillators/NoiseGenerator.js

export class NoiseGenerator {
    constructor(context, config) {
        this.context = context;
        this.config = config;

        const bufferSize = 2 * context.sampleRate;
        const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        this.node = context.createBufferSource();
        this.node.buffer = buffer;
        this.node.loop = true;

        this.output = this.node;
    }

    start(freq, time) {
        this.node.start(time);
    }

    stop(time) {
        this.node.stop(time);
    }

    setParam(param, value, time) {
        // Noise has no frequency parameter
    }
}
