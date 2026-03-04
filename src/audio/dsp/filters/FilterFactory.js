// src/audio/dsp/filters/FilterFactory.js

import { LowPassFilter } from "./LowPassFilter.js";
import { HighPassFilter } from "./HighPassFilter.js";
import { BandPassFilter } from "./BandPassFilter.js";

export class FilterFactory {
    static create(context, config) {
        if (!config || !config.type) {
            throw new Error("FilterFactory: Missing filter config or type.");
        }

        switch (config.type) {
            case "lowpass":
                return new LowPassFilter(context, config);

            case "highpass":
                return new HighPassFilter(context, config);

            case "bandpass":
                return new BandPassFilter(context, config);

            default:
                console.warn(`FilterFactory: Unknown filter type '${config.type}', defaulting to lowpass.`);
                return new LowPassFilter(context, config);
        }
    }
}
