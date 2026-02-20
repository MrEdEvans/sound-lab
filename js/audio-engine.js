import { val, checked } from "./ui/ui-helpers.js";



let audioCtx = null;
let currentNodes = [];

let fxDriveEnabled = false;
let fxDrive = 0.5;

let postFilterType = "peaking";
let postFilterFreq = 2000;
let postFilterQ = 1.0;
let postFilterGain = 0;

function getAudioCtx() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
}

export function clearCurrentNodes() {
    currentNodes.forEach(node => {
        try { node.disconnect(); } catch(e) {}
    });
    currentNodes = [];
}

/* Simple impulse reverb generator */
function createImpulseResponse(audio, seconds = 2.5, decay = 2.0) {
    const rate = audio.sampleRate;
    const length = rate * seconds;
    const impulse = audio.createBuffer(2, length, rate);
    for (let c = 0; c < 2; c++) {
        const channel = impulse.getChannelData(c);
        for (let i = 0; i < length; i++) {
            const n = (length - i) / length;
            channel[i] = (Math.random() * 2 - 1) * Math.pow(n, decay);
        }
    }
    return impulse;
}


/* Core: build and play one sound */
export function playSoundFromUI() {
    const audio = getAudioCtx();
    clearCurrentNodes();
    const now = audio.currentTime;


    /* ------------------------------------------------------------
       DEBUG
    ------------------------------------------------------------ */
    console.log("freq:", val("freq"));
    console.log("detune:", val("detune"));
    console.log("inharm:", val("inharm"));

    console.log("mainFilterCutoff:", val("mainFilterCutoff"));
    console.log("mainFilterResonance:", val("mainFilterResonance"));

    console.log("attack:", val("attack"));
    console.log("decay:", val("decay"));
    console.log("sustain:", val("sustain"));
    console.log("release:", val("release"));

    console.log("pitchStart:", val("pitchStart"));
    console.log("pitchEnd:", val("pitchEnd"));
    console.log("pitchTime:", val("pitchTime"));


    /* ------------------------------------------------------------
       1. READ UI VALUES
    ------------------------------------------------------------ */
    const baseFreq = Number(val("freq"));
    const detuneAmount = Number(val("detune"));
    const inharmSpread = Number(val("inharm"));
    const useSine = checked("oscSine");
    const useTriangle = checked("oscTriangle");
    const useSquare = checked("oscSquare");
    const useSaw = checked("oscSaw");
    const useInharm = checked("useInharm");
    const useStereoSpread = checked("stereoSpread");

    const mainFilterEnabled = checked("mainFilterEnabled");
    const mainFilterType = document.querySelector('input[name="mainFilterType"]:checked').value;
    const mainFilterCutoff = Number(val("mainFilterCutoff"));
    const mainFilterResonance = Number(val("mainFilterResonance"));
    const mainFilterEnvAmount = Number(val("mainFilterEnvAmount"));
    const mainFilterAttack = Number(val("mainFilterAttack"));
    const mainFilterDecay = Number(val("mainFilterDecay"));
    const mainFilterSustain = Number(val("mainFilterSustain"));
    const mainFilterRelease = Number(val("mainFilterRelease"));

    const attack = Number(val("attack"));
    const decay = Number(val("decay"));
    const sustain = Number(val("sustain"));
    const release = Number(val("release"));
    const tail = Number(val("tail"));
    const clickSafe = checked("clickSafe");

    const pitchStart = Number(val("pitchStart"));
    const pitchEnd = Number(val("pitchEnd"));
    const pitchTime = Number(val("pitchTime"));
    const pitchExpo = checked("pitchExpo");
    const pitchEnvEnable = checked("pitchEnvEnable");
    const pitchModeRelative = document.getElementById("pitchModeRelative").checked;

    const fmEnabled = checked("fmEnable");
    const fmModeRatio = document.getElementById("fmModeRatio").checked;
    const fmWave = document.querySelector('input[name="fmWave"]:checked').value;
    const fmRatio = Number(val("fmRatio"));
    const fmFreqFree = Number(val("fmFreq"));
    const fmAmount = Number(val("fmAmount"));
    const fmAmountLinear = document.getElementById("fmAmountLinear").checked;
    const fmAttack = Number(val("fmAttack"));
    const fmDecay = Number(val("fmDecay"));
    const fmSustain = Number(val("fmSustain"));
    const fmRelease = Number(val("fmRelease"));

    const vibEnabled = checked("vibEnable");
    const vibRate = Number(val("vibRate"));
    const vibDepthCents = Number(val("vibDepth"));
    const vibDelay = Number(val("vibDelay"));
    const vibFade = Math.max(0.001, Number(val("vibFade")));
    const vibWave = document.querySelector('input[name="vibWave"]:checked').value;

    const postFxReverbAmount = Number(val("postFxReverbAmount"));
    const postFxEnableReverb = checked("postFxEnableReverb");

    const postFilterEnabled = checked("postFilterEnabled");
    const postFilterType = document.querySelector('input[name="postFilterType"]:checked').value;

    const freqEl = document.getElementById("postFilterFreq");
    const qEl = document.getElementById("postFilterQ");
    const gainEl = document.getElementById("postFilterGain");

    const postFilterFreq = freqEl ? Number(freqEl.value) : 1000;
    const postFilterQ = qEl ? Number(qEl.value) : 1.0;
    const postFilterGain = gainEl ? Number(gainEl.value) : 0;



    /* ------------------------------------------------------------
       2. MASTER GAIN (ADSR)
    ------------------------------------------------------------ */
    const master = audio.createGain();
    master.gain.setValueAtTime(0.0001, now);
    master.gain.exponentialRampToValueAtTime(1.0, now + attack);
    master.gain.exponentialRampToValueAtTime(Math.max(sustain, 0.0001), now + attack + decay);
    master.gain.setValueAtTime(Math.max(sustain, 0.0001), now + tail);
    master.gain.exponentialRampToValueAtTime(0.0001, now + tail + release);
    master.connect(audio.destination);
    currentNodes.push(master);

    /* ------------------------------------------------------------
       3. MAIN FILTER (with bypass)
    ------------------------------------------------------------ */
    const mainFilterInput = audio.createGain();
    let mainFilterOutput = mainFilterInput;

    if (mainFilterEnabled) {
        const mf = audio.createBiquadFilter();
        mf.type = mainFilterType;
        mf.frequency.setValueAtTime(mainFilterCutoff, now);
        mf.Q.setValueAtTime(mainFilterResonance, now);

        const peakFreq = mainFilterCutoff + mainFilterEnvAmount * 3000;

        mf.frequency.setValueAtTime(mainFilterCutoff, now);
        mf.frequency.linearRampToValueAtTime(peakFreq, now + mainFilterAttack);
        mf.frequency.linearRampToValueAtTime(
            mainFilterCutoff + (peakFreq - mainFilterCutoff) * mainFilterSustain,
            now + mainFilterAttack + mainFilterDecay
        );
        mf.frequency.linearRampToValueAtTime(
            mainFilterCutoff,
            now + tail + mainFilterRelease
        );

        mainFilterInput.connect(mf);
        mainFilterOutput = mf;
        currentNodes.push(mf);
    }

    /* ------------------------------------------------------------
       4. REVERB (optional)
    ------------------------------------------------------------ */
    let fxInput = mainFilterOutput;
    let fxOutput = mainFilterOutput;

    if (postFxEnableReverb && postFxReverbAmount > 0.01) {
        const dry = audio.createGain();
        const wet = audio.createGain();
        dry.gain.setValueAtTime(1 - postFxReverbAmount, now);
        wet.gain.setValueAtTime(postFxReverbAmount, now);

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

    /* ------------------------------------------------------------
    4a. Drive (optional)
    ------------------------------------------------------------ */
    if (fxDriveEnabled) {
        const shaper = audio.createWaveShaper();

        const curveSize = 1024;
        const curve = new Float32Array(curveSize);

        // Drive scaling: 0–1 → 1–11
        const drive = fxDrive * 10 + 1;

        for (let i = 0; i < curveSize; i++) {
            const x = (i / (curveSize - 1)) * 2 - 1; // -1 to 1
            curve[i] = Math.tanh(drive * x);
        }

        shaper.curve = curve;
        shaper.oversample = "4x";

        fxOutput.connect(shaper);

        // --------------------------------------------------------
        // Stronger output gain compensation
        // --------------------------------------------------------
        const outGain = audio.createGain();
        const compensation = 1 / (drive ** 1.05);
        outGain.gain.setValueAtTime(compensation, now);

        shaper.connect(outGain);

        fxOutput = outGain;

        currentNodes.push(shaper, outGain);
    }




    /* ------------------------------------------------------------
    5. POST FILTER (optional)
    ------------------------------------------------------------ */
    let postOutput = fxOutput;

    if (postFilterEnabled) {
        const pf = audio.createBiquadFilter();
        pf.type = postFilterType;

        // Always set frequency
        const safeFreq = Number(postFilterFreq);
        pf.frequency.cancelScheduledValues(now);
        pf.frequency.linearRampToValueAtTime(
            isFinite(safeFreq) ? safeFreq : 1000,
            now + 0.02
        );

        // Q applies to: peaking, bandpass, lowpass, highpass, notch, allpass
        if (["peaking", "bandpass", "lowpass", "highpass", "notch", "allpass"].includes(postFilterType)) {
            const safeQ = Number(postFilterQ);
            pf.Q.cancelScheduledValues(now);
            pf.Q.linearRampToValueAtTime(
                isFinite(safeQ) ? safeQ : 1.0,
                now + 0.02
            );
        }

        // Gain applies to: peaking, lowshelf, highshelf
        if (["peaking", "lowshelf", "highshelf"].includes(postFilterType)) {
            const safeGain = Number(postFilterGain);
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

postOutput.connect(master);


    /* ⭐ FINAL CONNECTION — REQUIRED FOR SOUND ⭐ */
    postOutput.connect(master);


    /* ------------------------------------------------------------
       6. FM MODULATOR (optional)
    ------------------------------------------------------------ */
    let fmOsc = null;
    let fmGain = null;

    if (fmEnabled && fmAmount > 0) {
        fmOsc = audio.createOscillator();
        fmOsc.type = fmWave;

        fmGain = audio.createGain();
        fmGain.gain.setValueAtTime(0.0001, now);
        fmGain.gain.exponentialRampToValueAtTime(1.0, now + fmAttack);
        fmGain.gain.exponentialRampToValueAtTime(Math.max(fmSustain, 0.0001), now + fmAttack + fmDecay);
        fmGain.gain.setValueAtTime(Math.max(fmSustain, 0.0001), now + tail);
        fmGain.gain.exponentialRampToValueAtTime(0.0001, now + tail + fmRelease);

        fmOsc.connect(fmGain);
        fmOsc.start(now);
        fmOsc.stop(now + tail + fmRelease + 0.2);

        currentNodes.push(fmOsc, fmGain);
    }

    /* ------------------------------------------------------------
       7. VIBRATO LFO (optional)
    ------------------------------------------------------------ */
    let vibOsc = null;
    let vibGain = null;

    if (vibEnabled && vibDepthCents > 0) {
        vibOsc = audio.createOscillator();
        vibGain = audio.createGain();

        vibOsc.type = vibWave;
        vibOsc.frequency.setValueAtTime(vibRate, now);
        vibGain.gain.setValueAtTime(1, now);

        vibOsc.connect(vibGain);
        vibOsc.start(now);
        vibOsc.stop(now + tail + release + 0.5);

        currentNodes.push(vibOsc, vibGain);
    }

    /* ------------------------------------------------------------
       8. BUILD CARRIER PARTIALS
    ------------------------------------------------------------ */
    const oscTypes = [];
    if (useSine) oscTypes.push("sine");
    if (useTriangle) oscTypes.push("triangle");
    if (useSquare) oscTypes.push("square");
    if (useSaw) oscTypes.push("sawtooth");
    if (oscTypes.length === 0) oscTypes.push("sine");

    const partialRatios = useInharm
        ? [1.0, 2.71, 3.99, 5.41]
        : [1.0, 2.0, 3.0];

    partialRatios.forEach((ratio, index) => {
        const osc = audio.createOscillator();
        osc.type = oscTypes[index % oscTypes.length];

        // const carrierFreq = baseFreq * (1 + inharmSpread * (ratio - 1));
        const carrierFreq = (baseFreq || 440) * (1 + inharmSpread * (ratio - 1));

        osc.frequency.setValueAtTime(Math.max(carrierFreq, 1), now);

        /* Pitch Envelope */
        if (pitchEnvEnable) {
            const start = pitchModeRelative ? carrierFreq : Math.max(pitchStart, 1);
            const end = pitchModeRelative ? carrierFreq * (pitchEnd / Math.max(pitchStart, 1)) : Math.max(pitchEnd, 1);

            osc.frequency.setValueAtTime(start, now);
            if (pitchExpo) {
                osc.frequency.exponentialRampToValueAtTime(end, now + pitchTime);
            } else {
                osc.frequency.linearRampToValueAtTime(end, now + pitchTime);
            }
        }

        /* Detune */
        const detuneDir = index % 2 === 0 ? 1 : -1;
        osc.detune.setValueAtTime(detuneDir * detuneAmount * 10, now);

        /* Vibrato */
        if (vibGain && vibDepthCents > 0) {
            const vibDepthGain = audio.createGain();
            const depthRatio = Math.pow(2, vibDepthCents / 1200) - 1;
            const vibratoDepthHz = carrierFreq * depthRatio;

            vibDepthGain.gain.setValueAtTime(0, now);
            vibDepthGain.gain.setValueAtTime(0, now + vibDelay);
            vibDepthGain.gain.linearRampToValueAtTime(vibratoDepthHz, now + vibDelay + vibFade);

            vibGain.connect(vibDepthGain);
            vibDepthGain.connect(osc.frequency);
            currentNodes.push(vibDepthGain);
        }

        /* FM */
        if (fmEnabled && fmOsc && fmGain && fmAmount > 0) {
            const fmDepthGain = audio.createGain();
            const fmDepth = fmAmountLinear
                ? fmAmount
                : (fmAmount * carrierFreq) / 1000;

            fmDepthGain.gain.setValueAtTime(fmDepth, now);

            if (fmModeRatio) {
                fmOsc.frequency.setValueAtTime(carrierFreq * fmRatio, now);
            } else {
                fmOsc.frequency.setValueAtTime(fmFreqFree, now);
            }

            fmGain.connect(fmDepthGain);
            fmDepthGain.connect(osc.frequency);
            currentNodes.push(fmDepthGain);
        }

        /* Stereo Spread */
        let oscOutput = osc;
        if (useStereoSpread) {
            const pan = audio.createStereoPanner();
            const panPos = ((index / (partialRatios.length - 1 || 1)) - 0.5) * 2;
            pan.pan.setValueAtTime(panPos, now);
            osc.connect(pan);
            oscOutput = pan;
            currentNodes.push(pan);
        }

        /* Per‑oscillator gain */
        const oscGain = audio.createGain();
        const baseGain = 0.5 / partialRatios.length;

        oscGain.gain.setValueAtTime(clickSafe ? 0.0001 : baseGain, now);
        oscGain.gain.exponentialRampToValueAtTime(baseGain, now + (clickSafe ? attack : 0.001));
        oscGain.gain.exponentialRampToValueAtTime(0.0001, now + tail + release);

        oscOutput.connect(oscGain);
        oscGain.connect(mainFilterInput);

        osc.start(now);
        osc.stop(now + tail + release + 0.2);

        currentNodes.push(osc, oscGain);
    });
}

