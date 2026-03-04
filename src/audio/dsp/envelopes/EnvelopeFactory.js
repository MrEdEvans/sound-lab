// src/audio/dsp/envelopes/EnvelopeFactory.js

import { ADSREnvelope } from "./ADSREnvelope.js";

export class EnvelopeFactory {
    static create(context, config) {
        if (!config || !config.type) {
            throw new Error("EnvelopeFactory: Missing envelope config or type.");
        }

        switch (config.type) {
            case "adsr":
                return new ADSREnvelope(context, config);

            default:
                console.warn(`EnvelopeFactory: Unknown type '${config.type}', defaulting to ADSR.`);
                return new ADSREnvelope(context, config);
        }
    }
}
