// src/audio/sequencer/Sequencer.js

// ============================================================================
// KEY FEATURES
// ============================================================================
//
// Pattern-based, polyphonic sequencer with:
//
// - Unlimited notes per step
// - Per-note velocity with step-level default
// - Tempo (BPM) and swing
// - Looping
// - Start / stop / restart
// - Cancelable scheduling (no overlapping sequences)
// - AudioContext-time based clock (tight timing)
//
// This sequencer does NOT own the synth; it calls:
//   engine.noteOn(note, velocity, time)
//   engine.noteOff(note, time)
//
// ============================================================================

export class Sequencer {
    /**
     * @param {AudioEngine} engine - instance of your AudioEngine
     */
    constructor(engine) {
        this.engine = engine;
        this.context = engine.context;

        // Transport
        this.isPlaying = false;
        this.currentStepIndex = 0;

        // Pattern
        this.pattern = null;

        // Timing
        this.bpm = 120;
        this.swing = 0.0; // 0–1
        this.stepDuration = 0.5; // seconds per step (computed from bpm)

        // Scheduling
        this.lookahead = 0.1; // seconds
        this.scheduleInterval = null;
        this.nextStepTime = 0;

        // Cancellation
        this.runId = 0; // increments on each start/restart
    }

    // ------------------------------------------------------------------------
    // Public API
    // ------------------------------------------------------------------------

    setPattern(pattern) {
        this.pattern = this._normalizePattern(pattern);
        this.bpm = this.pattern.tempo ?? this.bpm;
        this.swing = this.pattern.swing ?? 0.0;
        this._updateStepDuration();
    }

    setTempo(bpm) {
        this.bpm = bpm;
        this._updateStepDuration();
    }

    setSwing(amount) {
        this.swing = Math.max(0, Math.min(1, amount));
    }

    start(pattern = null) {
        if (pattern) {
            this.setPattern(pattern);
        }
        if (!this.pattern || this.isPlaying) return;

        this.isPlaying = true;
        this.runId++;
        const myRun = this.runId;

        this.currentStepIndex = 0;
        this.nextStepTime = this.context.currentTime + 0.05; // small offset

        this._scheduleLoop(myRun);
    }

    stop() {
        if (!this.isPlaying) return;
        this.isPlaying = false;
        this.runId++; // invalidate any pending scheduling
        this._clearTimer();
        this.engine.stopAllNotes?.();
    }

    restart() {
        this.stop();
        this.start();
    }

    // ------------------------------------------------------------------------
    // Internal scheduling loop
    // ------------------------------------------------------------------------

    _scheduleLoop(myRun) {
        if (!this.isPlaying || myRun !== this.runId) return;

        const now = this.context.currentTime;

        while (this.nextStepTime < now + this.lookahead) {
            this._scheduleStep(this.currentStepIndex, this.nextStepTime, myRun);
            this._advanceStep();
        }

        this._clearTimer();
        this.scheduleInterval = setTimeout(() => {
            this._scheduleLoop(myRun);
        }, this.lookahead * 1000 * 0.5);
    }

    _scheduleStep(stepIndex, stepTime, myRun) {
        if (!this.pattern || myRun !== this.runId) return;

        const step = this.pattern.steps[stepIndex];
        if (!step) return;

        // Probability
        const prob = step.probability ?? 1.0;
        if (Math.random() > prob) return;

        // Swing (applied to every 2nd step: index 1,3,5,...)
        let time = stepTime;
        if (this.swing > 0 && stepIndex % 2 === 1) {
            const swingOffset = this.stepDuration * 0.5 * this.swing;
            time += swingOffset;
        }

        const stepVel = step.velocity ?? 1.0;
        const gate = step.gate ?? 0.9;
        const noteDuration = this.stepDuration * gate;

        const notes = step.notes || [];
        notes.forEach(n => {
            const noteNumber = n.note;
            if (noteNumber == null) return;

            const vel = n.velocity ?? stepVel;
            const tOn = time;
            const tOff = time + noteDuration;

            this.engine.noteOn(noteNumber, vel, tOn);
            this.engine.noteOff(noteNumber, tOff);
        });
    }

    _advanceStep() {
        if (!this.pattern) return;

        this.currentStepIndex++;

        if (this.currentStepIndex >= this.pattern.length) {
            if (this.pattern.loop === false) {
                this.stop();
                return;
            }
            this.currentStepIndex = 0;
        }

        this.nextStepTime += this.stepDuration;
    }

    // ------------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------------

    _updateStepDuration() {
        // 16th-note steps by default: 4 steps per beat
        const beatsPerSecond = this.bpm / 60;
        const beatDuration = 1 / beatsPerSecond;
        this.stepDuration = beatDuration / 4;
    }

    _clearTimer() {
        if (this.scheduleInterval) {
            clearTimeout(this.scheduleInterval);
            this.scheduleInterval = null;
        }
    }

    _normalizePattern(pattern) {
        const steps = pattern.steps || [];
        const length = pattern.length ?? steps.length ?? 16;

        return {
            steps: steps.map(s => this._normalizeStep(s)),
            length,
            tempo: pattern.tempo ?? this.bpm,
            swing: pattern.swing ?? 0.0,
            loop: pattern.loop ?? true
        };
    }

    _normalizeStep(step) {
        if (!step) return { notes: [] };

        const notes = (step.notes || []).map(n => {
            if (typeof n === "number") {
                return { note: n };
            }
            return {
                note: n.note,
                velocity: n.velocity
            };
        });

        return {
            notes,
            velocity: step.velocity,
            gate: step.gate ?? 0.9,
            probability: step.probability ?? 1.0,
            tie: step.tie ?? false
        };
    }
}

export default Sequencer;
