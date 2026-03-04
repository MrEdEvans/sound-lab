// src/audio/fx/FXFactory.js

import { FXRegistry } from "./FXRegistry.js";

export class FXFactory {
    static create(context, entry, impulseBuffer = null) {
        if (!entry.enabled) return null;

        const EffectClass = FXRegistry[entry.type];
        if (!EffectClass) {
            console.warn(`Unknown FX type: ${entry.type}`);
            return null;
        }

        if (entry.type === "reverb") {
            return new EffectClass(context, impulseBuffer, entry.params);
        }

        return new EffectClass(context, entry.params);
    }
}
