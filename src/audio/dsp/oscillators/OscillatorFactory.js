// src/audio/dsp/oscillators/OscillatorFactory.js

import { SineOscillator } from "./SineOscillator.js";
import { SawOscillator } from "./SawOscillator.js";
import { SquareOscillator } from "./SquareOscillator.js";
import { TriangleOscillator } from "./TriangleOscillator.js";
import { NoiseGenerator } from "./NoiseGenerator.js";

export class OscillatorFactory {
    static create(context, config) {
        if (!config || !config.type) {
            throw new Error("OscillatorFactory: Missing oscillator config or type.");
        }

        switch (config.type) {
            case "sine":
                return new SineOscillator(context, config);

            case "saw":
            case "sawtooth":
                return new SawOscillator(context, config);

            case "square":
                return new SquareOscillator(context, config);

            case "triangle":
                return new TriangleOscillator(context, config);

            case "noise":
                return new NoiseGenerator(context, config);

            default:
                console.warn(`OscillatorFactory: Unknown oscillator type '${config.type}', defaulting to sine.`);
                return new SineOscillator(context, config);
        }
    }
}
