// src/audio/dsp/modulation/ModMatrix.js

export class ModMatrix {
    constructor(context, voice) {
        this.context = context;
        this.voice = voice;
        this.routes = [];
    }

    load(routes) {
        this.routes = routes || [];
        this.apply();
    }

    apply() {
        this.routes.forEach(route => {
            const source = this.getSource(route.source);
            const dest = this.getDestination(route.destination);

            if (!source || !dest) return;

            const gain = this.context.createGain();
            gain.gain.value = route.amount;

            source.output.connect(gain);
            gain.connect(dest);
        });
    }

    getSource(name) {
        if (name.startsWith("lfo")) {
            const index = parseInt(name.replace("lfo", "")) - 1;
            return this.voice.lfos[index];
        }
        if (name === "ampEnv") return this.voice.envelopes.amp;
        if (name === "filterEnv") return this.voice.envelopes.filter;
        if (name === "pitchEnv") return this.voice.envelopes.pitch;
        return null;
    }

    getDestination(path) {
        const [module, param] = path.split(".");

        if (module === "osc1") return this.voice.oscillators[0].node[param];
        if (module === "osc2") return this.voice.oscillators[1].node[param];
        if (module === "filter") return this.voice.filters[0].node[param];
        if (module === "amp") return this.voice.outputGain.gain;

        return null;
    }
}
