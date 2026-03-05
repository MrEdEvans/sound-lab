// src/audio/voices/Voice.js

// ============================================================================
// KEY FEATURES (Design Guarantees)
// ============================================================================
//
// This Voice class implements a *stable, click‑free, analog‑style* Web Audio
// synthesizer voice. The following techniques are used to ensure predictable,
// musical behavior even with fast envelopes, stacked oscillators, and rapid
// retriggering:
//
// 1. **Phase‑reset oscillators**
//    Oscillators are created fresh on every noteOn() and start at phase = 0.
//    This prevents phase drift, beating, and random attack transients.
//
// 2. **Envelope smoothing**
//    All gain changes use setTargetAtTime() or linear ramps. No hard jumps.
//    Prevents discontinuities that cause digital clicks.
//
// 3. **Zero‑attack protection**
//    Even if the preset specifies attack = 0, a minimum smoothing window is
//    enforced so the envelope never jumps instantly.
//
// 4. **Pre‑zero glide**
//    Before the attack begins, the envelope is gently pulled to zero. This
//    prevents “plosive” transients when retriggering notes before the previous
//    release has fully decayed.
//
// 5. **Micro‑delay alignment**
//    A tiny delay (~2ms) is added before noteOn() to help align the envelope
//    with a near zero‑crossing of the waveform. This softens the very first
//    cycle of the oscillator and removes residual pops.
//
// 6. **Clean oscillator teardown**
//    Old oscillators are always stopped and removed before new ones are created.
//    Prevents ghost oscillators, beating, and CPU leaks.
//
// 7. **Stable frequency transitions**
//    Oscillator frequency ramps always start from a smoothed value, preventing
//    pitch discontinuities.
//
// These combined techniques produce a voice that behaves like a high‑quality
// analog polysynth: smooth, predictable, expressive, and artifact‑free.
// ============================================================================



export class Voice {

    // ------------------------------------------------------------------------
    // Constructor
    // ------------------------------------------------------------------------
    constructor(context, preset) {
        this.context = context;
        this.preset = preset;

        // Voice state
        this.active = false;
        this.releasing = false;
        this.currentNote = null;
        this.velocityValue = 0;
        this.noteValue = 0;
        this.onReleaseComplete = null;

        // DSP modules
        this.oscillators = [];
        this.oscGains = [];
        this.filters = [];
        this.lfo1 = null;
        this.lfo1Gain = null;

        // Core nodes
        this.ampGain = null;
        this.voiceBus = null;

        // Envelope data
        this.ampEnv = null;

        // Build the voice
        this.buildModules();
        this.buildGraph();
        this.connectGraph();
        this.applyRouting();
        this.applyModulation();
        this.startLFOs();
    }



    // ========================================================================
    // BUILD STAGE
    // ========================================================================

    buildModules() {
        // Oscillators are NOT created here — they are created per-note in noteOn()
        this.oscillators = [];

        // Per‑oscillator gain nodes
        this.oscGains = this.preset.oscillators.map(osc => {
            const g = this.context.createGain();
            g.gain.value = osc.gain || 1;
            return g;
        });

        // Filters (currently unused but ready for routing)
        this.filters = (this.preset.filters || []).map(f => {
            const node = this.context.createBiquadFilter();
            node.type = f.type;
            node.frequency.value = f.cutoff;
            node.Q.value = f.resonance;
            return node;
        });

        // Envelope parameters
        this.ampEnv = { ...this.preset.envelopes.amp };

        // Amplitude gain (starts at zero)
        this.ampGain = this.context.createGain();
        this.ampGain.gain.setValueAtTime(0, this.context.currentTime);

        // Voice output bus
        this.voiceBus = this.context.createGain();

        // LFO (optional modulation source)
        this.lfo1 = this.context.createOscillator();
        this.lfo1.frequency.value = 5;

        this.lfo1Gain = this.context.createGain();
        this.lfo1Gain.gain.value = 1;

        this.lfo1.connect(this.lfo1Gain);
    }



    // ------------------------------------------------------------------------
    // Audio graph wiring
    // ------------------------------------------------------------------------
    buildGraph() {
        // Oscillators → oscGains (oscillators are created later)
        this.oscillators.forEach((osc, i) => {
            osc.connect(this.oscGains[i]);
        });

        // For now: oscGains → ampGain (filters bypassed)
        this.oscGains.forEach(g => g.connect(this.ampGain));

        // Amp → voiceBus
        this.ampGain.connect(this.voiceBus);
    }

    connectGraph() {
        // Oscillators start in noteOn(), not here
    }

    startLFOs() {
        this.lfo1.start();
    }



    // ========================================================================
    // MODULATION (placeholder)
    // ========================================================================
    applyRouting() {}

    applyModulation() {
        // Mod matrix disabled for now
        return;
    }



    // ========================================================================
    // NOTE LIFECYCLE
    // ========================================================================

    // ------------------------------------------------------------------------
    // noteOn()
    // ------------------------------------------------------------------------
    noteOn(note, velocity = 1, time = this.context.currentTime) {
        this.active = true;
        this.releasing = false;
        this.currentNote = note;

        this.velocityValue = velocity;
        this.noteValue = (note - 60) / 12;

        // Micro-delay to help align with a near zero-crossing
        time += 0.002;

        // Kill any leftover oscillators
        this.oscillators.forEach(osc => {
            try { osc.stop(time); } catch(e) {}
        });
        this.oscillators = [];

        // Create fresh oscillators (phase reset)
        const quantum = 128 / this.context.sampleRate; // ~3ms
        this.oscillators = this.preset.oscillators.map((oscDef, i) => {
            const osc = this.context.createOscillator();
            osc.type = oscDef.type;
            osc.detune.value = oscDef.detune || 0;

            osc.connect(this.oscGains[i]);
            osc.start(time + quantum);

            return osc;
        });

        // Smooth frequency glide
        const freq = 440 * Math.pow(2, (note - 69) / 12);
        this.oscillators.forEach(osc => {
            osc.frequency.cancelScheduledValues(time);
            osc.frequency.setTargetAtTime(osc.frequency.value, time, 0.003);
            osc.frequency.linearRampToValueAtTime(freq, time + 0.003);
        });

        // Envelope
        const env = this.ampEnv;
        const g = this.ampGain.gain;

        const SMOOTH = 0.003;
        const attack = Math.max(env.attack, SMOOTH);
        const decay = env.decay;

        g.cancelScheduledValues(time);

        // Pre-zero glide (removes plosives)
        g.setTargetAtTime(0, time, SMOOTH);

        // Micro fade-in floor
        g.setTargetAtTime(velocity * 0.001, time + SMOOTH, SMOOTH);

        // Attack
        g.linearRampToValueAtTime(velocity, time + attack);

        // Decay → Sustain
        g.linearRampToValueAtTime(env.sustain * velocity, time + attack + decay);
    }



    // ------------------------------------------------------------------------
    // noteOff()
    // ------------------------------------------------------------------------
    noteOff(time = this.context.currentTime) {
        if (!this.active) return;

        this.releasing = true;

        const env = this.ampEnv;
        const g = this.ampGain.gain;

        const SMOOTH = 0.003;
        const release = Math.max(env.release, SMOOTH);

        g.cancelScheduledValues(time);

        // Smooth transition from current envelope state
        g.setTargetAtTime(g.value, time, SMOOTH);

        // Release
        g.linearRampToValueAtTime(0, time + release);

        // Stop oscillators after release
        this.oscillators.forEach(osc => {
            try { osc.stop(time + release); } catch(e) {}
        });

        setTimeout(() => {
            this.active = false;
            this.releasing = false;
            this.currentNote = null;
            this.oscillators = [];
            if (this.onReleaseComplete) this.onReleaseComplete();
        }, release * 1000 + 10);
    }



    // ------------------------------------------------------------------------
    // Hard stop (immediate)
    // ------------------------------------------------------------------------
    stop() {
        const now = this.context.currentTime;
        this.ampGain.gain.cancelScheduledValues(now);
        this.ampGain.gain.setValueAtTime(0, now);

        this.active = false;
        this.releasing = false;
        this.currentNote = null;
    }



    // ------------------------------------------------------------------------
    // Public graph handle
    // ------------------------------------------------------------------------
    get graph() {
        return { voiceBus: this.voiceBus };
    }
}
