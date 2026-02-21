// ============================================================
//  AUDIO ENGINE CORE — PURE DSP, STATE-DRIVEN
// ============================================================

import { engineState } from "./engine-state.js";

import {
    getAudioCtx,
    clearCurrentNodes,
    createImpulseResponse,
    currentNodes
} from "./audio-core.js";

// ------------------------------------------------------------
// resumeAudio()
// ------------------------------------------------------------
export async function resumeAudio() {
    const ctx = getAudioCtx();
    if (ctx.state === "suspended") {
        await ctx.resume();
    }
}

// ------------------------------------------------------------
// createNoiseBuffer()
// ------------------------------------------------------------
function createNoiseBuffer(ctx) {
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
        data[i] = Math.random() * 2 - 1; // white noise
    }

    return buffer;
}

// ------------------------------------------------------------
// stopSound() - Stop all sound immediately
// ------------------------------------------------------------
export function stopSound() {
    // Stop and disconnect all active nodes
    currentNodes.forEach(node => {
        try {
            if (typeof node.stop === "function") {
                // Stop slightly in the future to avoid DOMException
                node.stop(audio.currentTime + 0.01);
            }
        } catch (e) {
            // Ignore nodes that can't be stopped
        }

        try {
            node.disconnect();
        } catch (e) {
            // Ignore nodes that can't be disconnected
        }
    });

    // Clear the list
    currentNodes.length = 0;
}



// ------------------------------------------------------------
// playSoundFromState() — PURE DSP
// ------------------------------------------------------------
export function playSoundFromState() {
    const audio = getAudioCtx();
    clearCurrentNodes();
    const now = audio.currentTime;

    // ------------------------------------------------------------
    // MASTER GAIN (ADSR)
    // ------------------------------------------------------------
    const master = audio.createGain();
    const a = engineState.ampEnv.attack;
    const d = engineState.ampEnv.decay;
    const s = Math.max(engineState.ampEnv.sustain, 0.0001);
    const r = engineState.ampEnv.release;
    const tail = engineState.ampEnv.tail;

    master.gain.setValueAtTime(0.0001, now);
    master.gain.exponentialRampToValueAtTime(1.0, now + a);
    master.gain.exponentialRampToValueAtTime(s, now + a + d);
    master.gain.setValueAtTime(s, now + tail);
    master.gain.exponentialRampToValueAtTime(0.0001, now + tail + r);
    master.connect(audio.destination);
    currentNodes.push(master);

    // ------------------------------------------------------------
    // MAIN FILTER
    // ------------------------------------------------------------
    const mainFilterInput = audio.createGain();
    let mainFilterOutput = mainFilterInput;

    if (engineState.mainFilter.enabled) {
        const mf = audio.createBiquadFilter();
        mf.type = engineState.mainFilter.type;

        const base = engineState.mainFilter.cutoff;
        const envAmt = engineState.mainFilter.envAmount;
        const mfEnv = engineState.mainFilter.env;

        const peakRaw = base + envAmt * 3000;
        const peak = Math.min(Math.max(peakRaw, 0), audio.sampleRate / 2);

        const sustainRaw = base + (peak - base) * mfEnv.sustain;
        const sustain = Math.min(Math.max(sustainRaw, 0), audio.sampleRate / 2);

        mf.frequency.setValueAtTime(base, now);
        mf.frequency.linearRampToValueAtTime(peak, now + mfEnv.attack);
        mf.frequency.linearRampToValueAtTime(
            sustain,
            now + mfEnv.attack + mfEnv.decay
        );
        mf.frequency.linearRampToValueAtTime(
            base,
            now + tail + mfEnv.release
        );

        mf.Q.setValueAtTime(engineState.mainFilter.resonance, now);

        mainFilterInput.connect(mf);
        mainFilterOutput = mf;
        currentNodes.push(mf);
    }

    // ------------------------------------------------------------
    // POST FX
    // ------------------------------------------------------------
    const postOutput = buildPostFX(audio, now, mainFilterOutput, master, mainFilterInput);

    // ------------------------------------------------------------
    // OSCILLATORS (FM + vibrato inside)
    // ------------------------------------------------------------
    buildOscillators(audio, now, mainFilterInput);
}



// ------------------------------------------------------------
// buildOscillators()
// ------------------------------------------------------------
export function buildOscillators(audio, now, mainFilterInput) {

    const tail = engineState.ampEnv.tail;
    const release = engineState.ampEnv.release;

    // ------------------------------------------------------------
    // FM MODULATOR
    // ------------------------------------------------------------
    let fmOsc = null;
    let fmGain = null;

    if (engineState.fm.enabled && engineState.fm.amount > 0) {
        fmOsc = audio.createOscillator();
        fmOsc.type = engineState.fm.waveform;

        fmGain = audio.createGain();
        const fmEnv = engineState.fm.env;

        fmGain.gain.setValueAtTime(0.0001, now);
        fmGain.gain.exponentialRampToValueAtTime(1.0, now + fmEnv.attack);
        fmGain.gain.exponentialRampToValueAtTime(
            Math.max(fmEnv.sustain, 0.0001),
            now + fmEnv.attack + fmEnv.decay
        );
        fmGain.gain.setValueAtTime(
            Math.max(fmEnv.sustain, 0.0001),
            now + tail
        );
        fmGain.gain.exponentialRampToValueAtTime(
            0.0001,
            now + tail + fmEnv.release
        );

        fmOsc.connect(fmGain);
        fmOsc.start(now);
        fmOsc.stop(now + tail + fmEnv.release + 0.2);

        currentNodes.push(fmOsc, fmGain);
    }

    // ------------------------------------------------------------
    // VIBRATO LFO
    // ------------------------------------------------------------
    let vibOsc = null;
    let vibGain = null;

    if (engineState.vibrato.enabled && engineState.vibrato.depth > 0) {
        vibOsc = audio.createOscillator();
        vibGain = audio.createGain();

        vibOsc.type = engineState.vibrato.waveform;
        vibOsc.frequency.setValueAtTime(engineState.vibrato.rate, now);
        vibGain.gain.setValueAtTime(1, now);

        vibOsc.connect(vibGain);
        vibOsc.start(now);
        vibOsc.stop(now + tail + release + 0.5);

        currentNodes.push(vibOsc, vibGain);
    }

    // ------------------------------------------------------------
    // CARRIER PARTIALS
    // ------------------------------------------------------------
    const oscTypes = [];
    if (engineState.osc.waves.sine) oscTypes.push("sine");
    if (engineState.osc.waves.triangle) oscTypes.push("triangle");
    if (engineState.osc.waves.square) oscTypes.push("square");
    if (engineState.osc.waves.sawtooth) oscTypes.push("sawtooth");
    if (oscTypes.length === 0) oscTypes.push("sine");

    const partialRatios = engineState.osc.useInharm
        ? [1.0, 2.71, 3.99, 5.41]
        : [1.0, 2.0, 3.0];

    partialRatios.forEach((ratio, index) => {
        const osc = audio.createOscillator();
        osc.type = oscTypes[index % oscTypes.length];

        const baseFreq = engineState.osc.freq || 440;
        const inharmSpread = engineState.osc.inharm;
        const carrierFreq = baseFreq * (1 + inharmSpread * (ratio - 1));

        osc.frequency.setValueAtTime(Math.max(carrierFreq, 1), now);

        // Pitch Envelope
        if (engineState.pitchEnv.enabled) {

            const env = engineState.pitchEnv;
            const base = carrierFreq;

            let startFreq, endFreq;

            if (env.mode === "relative") {
                // Relative mode: start/end are multipliers
                startFreq = base * env.start;
                endFreq   = base * env.end;
            } else {
                // Absolute mode: start/end are literal frequencies
                startFreq = env.start;
                endFreq   = env.end;
            }

            // Clamp to safe, sensible ranges
            const clamp = f => Math.min(Math.max(f, 20), 20000);

            startFreq = clamp(startFreq);
            endFreq   = clamp(endFreq);

            // Apply envelope
            osc.frequency.setValueAtTime(startFreq, now);

            if (env.expo) {
                // Exponential ramp cannot go to or from 0
                const safeStart = Math.max(startFreq, 1);
                const safeEnd   = Math.max(endFreq, 1);

                osc.frequency.setValueAtTime(safeStart, now);
                osc.frequency.exponentialRampToValueAtTime(safeEnd, now + env.time);
            } else {
                osc.frequency.linearRampToValueAtTime(endFreq, now + env.time);
            }
        }


        // Detune
        const detuneDir = index % 2 === 0 ? 1 : -1;
        osc.detune.setValueAtTime(detuneDir * engineState.osc.detune * 10, now);

        // Vibrato
        if (vibGain && engineState.vibrato.depth > 0) {
            const vibDepthGain = audio.createGain();
            const depthRatio = Math.pow(2, engineState.vibrato.depth / 1200) - 1;
            const vibratoDepthHz = carrierFreq * depthRatio;

            vibDepthGain.gain.setValueAtTime(0, now);
            vibDepthGain.gain.setValueAtTime(0, now + engineState.vibrato.delay);
            vibDepthGain.gain.linearRampToValueAtTime(
                vibratoDepthHz,
                now + engineState.vibrato.delay + engineState.vibrato.fade
            );

            vibGain.connect(vibDepthGain);
            vibDepthGain.connect(osc.frequency);
            currentNodes.push(vibDepthGain);
        }

        // FM
        if (engineState.fm.enabled && fmOsc && fmGain && engineState.fm.amount > 0) {
            const fmDepthGain = audio.createGain();
            const fmDepth = engineState.fm.amountMode === "linear"
                ? engineState.fm.amount
                : (engineState.fm.amount * carrierFreq) / 1000;

            fmDepthGain.gain.setValueAtTime(fmDepth, now);

            if (engineState.fm.mode === "ratio") {
                fmOsc.frequency.setValueAtTime(carrierFreq * engineState.fm.ratio, now);
            } else {
                fmOsc.frequency.setValueAtTime(engineState.fm.freq, now);
            }

            fmGain.connect(fmDepthGain);
            fmDepthGain.connect(osc.frequency);
            currentNodes.push(fmDepthGain);
        }

        // Stereo Spread
        let oscOutput = osc;
        if (engineState.osc.stereoSpread > 0) {
            const pan = audio.createStereoPanner();
            const panPos = ((index / (partialRatios.length - 1 || 1)) - 0.5) * 2;
            pan.pan.setValueAtTime(panPos, now);
            osc.connect(pan);
            oscOutput = pan;
            currentNodes.push(pan);
        }

        // Per‑oscillator gain
        const oscGain = audio.createGain();
        const baseGain = 0.5 / partialRatios.length;

        const clickSafe = engineState.ampEnv.clickSafe;
        const attack = engineState.ampEnv.attack;

        oscGain.gain.setValueAtTime(clickSafe ? 0.0001 : baseGain, now);
        oscGain.gain.exponentialRampToValueAtTime(
            baseGain,
            now + (clickSafe ? attack : 0.001)
        );
        oscGain.gain.exponentialRampToValueAtTime(
            0.0001,
            now + tail + release
        );

        oscOutput.connect(oscGain);
        oscGain.connect(mainFilterInput);

        osc.start(now);
        osc.stop(now + tail + release + 0.2);

        currentNodes.push(osc, oscGain);
    });
}



// ------------------------------------------------------------
// buildPostFX()
// ------------------------------------------------------------
export function buildPostFX(audio, now, mainFilterOutput, master, mainFilterInput) {


    let fxInput = mainFilterOutput;
    let fxOutput = mainFilterOutput;

    // Reverb
    if (engineState.fx.reverb.enabled && engineState.fx.reverb.amount > 0.01) {
        const amount = engineState.fx.reverb.amount;

        const dry = audio.createGain();
        const wet = audio.createGain();
        dry.gain.setValueAtTime(1 - amount, now);
        wet.gain.setValueAtTime(amount, now);

        const conv = audio.createConvolver();
        conv.buffer = createImpulseResponse(audio, 2.5, 2.5);

        const reverbInput = audio.createGain();
        fxInput.connect(reverbInput);
        reverbInput.connect(dry);
        reverbInput.connect(conv);
        conv.connect(wet);

        const mix = audio.createGain();
        dry.connect(mix);
        wet.connect(mix);

        fxOutput = mix;
        currentNodes.push(dry, wet, conv, reverbInput, mix);
    }

    // Drive
    if (engineState.fx.drive.enabled && engineState.fx.drive.amount > 0) {
        const shaper = audio.createWaveShaper();

        const curveSize = 1024;
        const curve = new Float32Array(curveSize);

        const drive = engineState.fx.drive.amount * 10 + 1;

        for (let i = 0; i < curveSize; i++) {
            const x = (i / (curveSize - 1)) * 2 - 1;
            curve[i] = Math.tanh(drive * x);
        }

        shaper.curve = curve;
        shaper.oversample = "4x";

        fxOutput.connect(shaper);

        const outGain = audio.createGain();
        const compensation = 1 / (drive ** 1.05);
        outGain.gain.setValueAtTime(compensation, now);

        shaper.connect(outGain);

        fxOutput = outGain;

        currentNodes.push(shaper, outGain);
    }

    // Post Filter
    let postOutput = fxOutput;

    if (engineState.postFilter.enabled) {
        const pf = audio.createBiquadFilter();
        pf.type = engineState.postFilter.type;

        const safeFreq = Number(engineState.postFilter.freq);
        pf.frequency.cancelScheduledValues(now);
        pf.frequency.linearRampToValueAtTime(
            isFinite(safeFreq) ? safeFreq : 1000,
            now + 0.02
        );

        if (["peaking", "bandpass", "lowpass", "highpass", "notch", "allpass"]
            .includes(engineState.postFilter.type)) {
            const safeQ = Number(engineState.postFilter.Q);
            pf.Q.cancelScheduledValues(now);
            pf.Q.linearRampToValueAtTime(
                isFinite(safeQ) ? safeQ : 1.0,
                now + 0.02
            );
        }

        if (["peaking", "lowshelf", "highshelf"].includes(engineState.postFilter.type)) {
            const safeGain = Number(engineState.postFilter.gain);
            pf.gain.cancelScheduledValues(now);
            pf.gain.linearRampToValueAtTime(
                isFinite(safeGain) ? safeGain : 0,
                now + 0.02
            );
        }

        fxOutput.connect(pf);
        postOutput = pf;
        currentNodes.push(pf);
    }

    // ------------------------------------------------------------
    // NOISE (post-FX mix)
    // ------------------------------------------------------------
    if (engineState.fx.noise.enabled && engineState.fx.noise.amount > 0) {

        // Create looping noise buffer
        const noiseBuffer = audio.createBuffer(1, audio.sampleRate * 2, audio.sampleRate);
        const noiseData = noiseBuffer.getChannelData(0);
        for (let i = 0; i < noiseData.length; i++) {
            noiseData[i] = Math.random() * 2 - 1;
        }

        const noiseSource = audio.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        noiseSource.loop = true;

        const noiseGain = audio.createGain();
        noiseGain.gain.setValueAtTime(engineState.fx.noise.amount * 0.02, now);

        noiseSource.connect(noiseGain);
        noiseGain.connect(mainFilterInput);

        noiseSource.start(now);
        noiseSource.stop(now + engineState.ampEnv.tail + engineState.ampEnv.release + 0.5);

        currentNodes.push(noiseSource, noiseGain);
    }

    // ------------------------------------------------------------
    // STEREO WIDTH (final stage mid/side processor)
    // ------------------------------------------------------------
    if (engineState.fx.width.amount !== 1.0) {

        // Split into L/R
        const splitter = audio.createChannelSplitter(2);
        const merger = audio.createChannelMerger(2);

        // Mid = (L + R) / 2
        const midGain = audio.createGain();
        midGain.gain.setValueAtTime(0.5, now);

        // Side = (L - R) / 2
        const sideGainL = audio.createGain();
        const sideGainR = audio.createGain();
        sideGainL.gain.setValueAtTime(0.5, now);
        sideGainR.gain.setValueAtTime(-0.5, now);

        // Width control
        const widthGain = audio.createGain();
        widthGain.gain.setValueAtTime(engineState.fx.width.amount, now);

        // Routing:
        // postOutput → splitter
        postOutput.connect(splitter);

        // Left channel
        splitter.connect(midGain, 0);
        splitter.connect(sideGainL, 0);

        // Right channel
        splitter.connect(midGain, 1);
        splitter.connect(sideGainR, 1);

        // Combine side channels
        sideGainL.connect(widthGain);
        sideGainR.connect(widthGain);

        // Reconstruct L/R
        const leftOut = audio.createGain();
        const rightOut = audio.createGain();

        midGain.connect(leftOut);
        widthGain.connect(leftOut);

        midGain.connect(rightOut);
        widthGain.connect(rightOut);

        // Merge back to stereo
        leftOut.connect(merger, 0, 0);
        rightOut.connect(merger, 0, 1);

        // Replace postOutput with widened signal
        postOutput = merger;

        currentNodes.push(
            splitter, merger,
            midGain, sideGainL, sideGainR,
            widthGain, leftOut, rightOut
        );
    }


    // Final Routing
    postOutput.connect(master);

    return postOutput;
}
