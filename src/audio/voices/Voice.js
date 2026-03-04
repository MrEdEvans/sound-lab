// src/audio/voices/Voice.js

import { OscillatorFactory } from "../dsp/oscillators/OscillatorFactory.js";
import { EnvelopeFactory } from "../dsp/envelopes/EnvelopeFactory.js";
import { FilterFactory } from "../dsp/filters/FilterFactory.js";
import { LFO } from "../dsp/modulation/LFO.js";

export class Voice {
    constructor(context, preset) {
        this.context = context;
        this.note = null;
        this.active = false;
        this.releasing = false;

        // DSP containers
        this.oscillators = [];
        this.envelopes = {};
        this.filters = [];
        this.lfos = [];

        // Build DSP modules from preset
        this.buildFromPreset(preset);

        // Build per‑voice audio graph
        this.graph = createAudioGraph(context);

        // Inject DSP modules into the graph
        this.graph.oscillators = this.oscillators;
        this.graph.filters = this.filters;
        this.graph.ampEnv = this.envelopes.amp;

        // Wire everything together
        connectModules(this.graph);

        // Routing + modulation
        this.routing = new RoutingTable();
        this.modMatrix = new ModMatrix(context, this);

        this.routing.load(preset.routing);
        applyRouting(this.graph, this.routing);

        this.modMatrix.load(preset.modMatrix);

        // Start LFOs
        this.lfos.forEach(lfo => lfo.start());
    }


    buildFromPreset(preset) {
        this.oscillators = preset.oscillators.map(osc => 
            OscillatorFactory.create(this.context, osc)
        );

        this.envelopes = {
            amp: EnvelopeFactory.create(this.context, preset.envelopes.amp),
            filter: EnvelopeFactory.create(this.context, preset.envelopes.filter),
            pitch: EnvelopeFactory.create(this.context, preset.envelopes.pitch)
        };

        this.filters = preset.filters.map(f =>
            FilterFactory.create(this.context, f)
        );

        this.lfos = preset.lfos.map(lfo =>
            new LFO(this.context, lfo)
        );

        this.connectSignalPath();
    }

    connectSignalPath() {
        let node = null;

        this.oscillators.forEach(osc => {
            osc.output.connect(this.envelopes.amp.input);
        });

        this.envelopes.amp.output.connect(this.outputGain);

        this.filters.forEach(filter => {
            this.outputGain.connect(filter.input);
            filter.output.connect(this.graph.voiceBus);
        });
    }

    noteOn(note, velocity, time) {
        this.note = note;
        this.active = true;
        this.releasing = false;

        const freq = this.midiToFreq(note);

        this.oscillators.forEach(osc => osc.start(freq, time));
        this.envelopes.amp.triggerAttack(time);
        this.envelopes.filter.triggerAttack(time);
        this.envelopes.pitch.triggerAttack(time);

        this.outputGain.gain.setValueAtTime(velocity, time);
    }

    noteOff(time) {
        if (!this.active || this.releasing) return;

        this.releasing = true;

        this.envelopes.amp.triggerRelease(time);
        this.envelopes.filter.triggerRelease(time);
        this.envelopes.pitch.triggerRelease(time);

        const releaseTime = time + this.envelopes.amp.release;

        this.oscillators.forEach(osc => osc.stop(releaseTime));

        setTimeout(() => {
            this.active = false;
            this.releasing = false;
        }, (releaseTime - this.context.currentTime) * 1000);
    }

    updateParam(path, value, time) {
        const [module, param] = path.split(".");

        if (module === "osc1") this.oscillators[0].setParam(param, value, time);
        if (module === "osc2") this.oscillators[1].setParam(param, value, time);
        if (module === "filter") this.filters[0].setParam(param, value, time);
        if (module === "ampEnv") this.envelopes.amp.setParam(param, value, time);
    }

    midiToFreq(note) {
        return 440 * Math.pow(2, (note - 69) / 12);
    }

    stopAll() {
        this.oscillators.forEach(osc => osc.stop(this.context.currentTime));
        this.active = false;
        this.releasing = false;
    }
}
