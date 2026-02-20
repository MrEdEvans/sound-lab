import { updatePitchModeUI, updateFmModeUI, updateFmAmountLabel } from "./ui/ui-state.js";


/* Bright chime preset */
export function loadBrightChimePreset() {
    document.getElementById("freq").value = 880;
    document.getElementById("detune").value = 10;
    document.getElementById("inharm").value = 0.4;

    document.getElementById("attack").value = 0.004;
    document.getElementById("decay").value = 0.25;
    document.getElementById("sustain").value = 0.35;
    document.getElementById("release").value = 1.0;
    document.getElementById("tail").value = 1.4;

    document.getElementById("postFxNoise").value = 0.0;
    document.getElementById("postFxReverbAmount").value = 0.45;
    document.getElementById("postFxWidth").value = 0.7;

    // Pitch envelope defaults
    document.getElementById("pitchStart").value = 1200;
    document.getElementById("pitchEnd").value = 2600;
    document.getElementById("pitchTime").value = 0.12;
    document.getElementById("pitchEnvEnable").checked = true;
    document.getElementById("pitchModeRelative").checked = true;
    document.getElementById("pitchModeAbsolute").checked = false;

    // FM defaults: gentle bell-like
    document.getElementById("fmEnable").checked = true;
    document.getElementById("fmModeRatio").checked = true;
    document.getElementById("fmModeFree").checked = false;
    document.getElementById("fmRatio").value = 2.00;
    document.getElementById("fmFreq").value = 600;
    document.getElementById("fmAmountIndex").checked = true;
    document.getElementById("fmAmountLinear").checked = false;
    document.getElementById("fmAmount").value = 300;
    document.getElementById("fmWaveSine").checked = true;
    document.getElementById("fmWaveTriangle").checked = false;
    document.getElementById("fmWaveSquare").checked = false;

    document.getElementById("fmAttack").value = 0.01;
    document.getElementById("fmDecay").value = 0.25;
    document.getElementById("fmSustain").value = 0.3;
    document.getElementById("fmRelease").value = 0.6;

    // Vibrato defaults
    document.getElementById("vibEnable").checked = true;
    document.getElementById("vibRate").value = 5.0;
    document.getElementById("vibDepth").value = 15;
    document.getElementById("vibDelay").value = 0.00;
    document.getElementById("vibFade").value = 0.20;
    document.getElementById("vibWaveSine").checked = true;
    document.getElementById("vibWaveTriangle").checked = false;

    document.getElementById("oscSine").checked = true;
    document.getElementById("oscTriangle").checked = true;
    document.getElementById("oscSquare").checked = false;
    document.getElementById("oscSaw").checked = false;

    document.getElementById("useInharm").checked = true;
    document.getElementById("stereoSpread").checked = true;
    document.getElementById("postFxEnableReverb").checked = true;
    document.getElementById("postFxEnableNoise").checked = false;
    document.getElementById("clickSafe").checked = true;

    [
    "freq","detune","inharm",
    "attack","decay","sustain","release","tail",
    "mainFilterCutoff","mainFilterResonance","mainFilterEnvAmount",
    "mainFilterAttack","mainFilterDecay","mainFilterSustain","mainFilterRelease",
    "postFxNoise","postFxReverbAmount","postFxWidth",
    "pitchStart","pitchEnd","pitchTime",
    "fxDrive",
    "postFilterFreq",
    "postFilterQ",
    "postFilterGain"
    ].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            const event = new Event("input");
            el.dispatchEvent(event);
        }
    });
    
    document.getElementById("pitchModeRelative").checked = true;
    updatePitchModeUI();

    updateFmModeUI();
    updateFmAmountLabel();
}




/*         */
/* PRESETS */
/*         */

/* Randomize settings */
export function randomizeSettings() {
    document.getElementById("freq").value = 1800 + Math.random() * 2500;
    document.getElementById("detune").value = 4 + Math.random() * 20;
    document.getElementById("inharm").value = (0.2 + Math.random() * 0.5).toFixed(2);

    document.getElementById("attack").value = (0.002 + Math.random() * 0.02).toFixed(3);
    document.getElementById("decay").value = (0.1 + Math.random() * 0.5).toFixed(2);
    document.getElementById("sustain").value = (0.2 + Math.random() * 0.6).toFixed(2);
    document.getElementById("release").value = (0.5 + Math.random() * 1.5).toFixed(2);
    document.getElementById("tail").value = (0.6 + Math.random() * 1.8).toFixed(1);

    document.getElementById("filterFreq").value = 2000 + Math.random() * 4000;
    document.getElementById("filterQ").value = (8 + Math.random() * 15).toFixed(1);
    document.getElementById("noise").value = (Math.random() * 0.4).toFixed(2);
    document.getElementById("reverb").value = (0.2 + Math.random() * 0.6).toFixed(2);
    document.getElementById("width").value = (0.3 + Math.random() * 0.7).toFixed(2);

    // Pitch envelope
    document.getElementById("pitchStart").value = 200 + Math.random() * 2000;
    document.getElementById("pitchEnd").value = 500 + Math.random() * 3000;
    document.getElementById("pitchTime").value = (0.05 + Math.random() * 0.3).toFixed(2);
    document.getElementById("pitchEnvEnable").checked = Math.random() > 0.2;
    document.getElementById(Math.random() > 0.5 ? "pitchModeRelative" : "pitchModeAbsolute").checked = true;

    // FM settings
    document.getElementById("fmRatio").value = (0.5 + Math.random() * 4).toFixed(2);
    document.getElementById("fmFreq").value = 100 + Math.random() * 2000;
    document.getElementById("fmAmount").value = (50 + Math.random() * 600).toFixed(0);
    document.getElementById("fmAttack").value = (0.001 + Math.random() * 0.1).toFixed(3);
    document.getElementById("fmDecay").value = (0.05 + Math.random() * 0.6).toFixed(2);
    document.getElementById("fmSustain").value = (0.1 + Math.random() * 0.7).toFixed(2);
    document.getElementById("fmRelease").value = (0.1 + Math.random() * 1.0).toFixed(2);

    ["oscSine","oscTriangle","oscSquare","oscSaw"].forEach(id => {
        document.getElementById(id).checked = Math.random() > 0.3;
    });

    document.getElementById("useInharm").checked = Math.random() > 0.2;
    document.getElementById("stereoSpread").checked = true;
    document.getElementById("enableReverb").checked = true;
    document.getElementById("enableFilter").checked = true;
    document.getElementById("enableNoise").checked = Math.random() > 0.5;

    document.getElementById("fmEnable").checked = Math.random() > 0.2;

    // Random FM modes
    document.getElementById(Math.random() > 0.5 ? "fmModeRatio" : "fmModeFree").checked = true;
    document.getElementById(Math.random() > 0.5 ? "fmAmountLinear" : "fmAmountIndex").checked = true;

    // Random FM waveform
    const fmWaves = ["fmWaveSine","fmWaveTriangle","fmWaveSquare"];
    document.getElementById(fmWaves[Math.floor(Math.random()*fmWaves.length)]).checked = true;

    // Vibrato
    document.getElementById("vibEnable").checked = Math.random() > 0.2;
    document.getElementById("vibRate").value = (2 + Math.random() * 8).toFixed(1);
    document.getElementById("vibDepth").value = Math.floor(Math.random() * 150);
    document.getElementById("vibDelay").value = (Math.random() * 0.5).toFixed(2);
    document.getElementById("vibFade").value = (Math.random() * 0.5).toFixed(2);
    const vibWaves = ["vibWaveSine","vibWaveTriangle"];
    document.getElementById(vibWaves[Math.floor(Math.random()*vibWaves.length)]).checked = true;

    // Refresh labels
    [
        "freq","detune","inharm","attack","decay","sustain","release","tail",
        "filterFreq","filterQ","noise","reverb","width",
        "pitchStart","pitchEnd","pitchTime",
        "fmRatio","fmFreq","fmAmount","fmAttack","fmDecay","fmSustain","fmRelease",
        "vibRate","vibDepth","vibDelay","vibFade"
    ].forEach(id => {
        const event = new Event("input");
        document.getElementById(id).dispatchEvent(event);
    });

    document.getElementById("pitchModeRelative").checked = true;
    updatePitchModeUI();

    updateFmModeUI();
    updateFmAmountLabel();
}




export function loadMarioJumpPreset() {

    // -----------------------------
    // OSCILLATORS
    // -----------------------------
    document.getElementById("freq").value = 1200;
    document.getElementById("detune").value = 0;
    document.getElementById("inharm").value = 0;

    document.getElementById("oscSine").checked = false;
    document.getElementById("oscTriangle").checked = false;
    document.getElementById("oscSquare").checked = true;
    document.getElementById("oscSaw").checked = false;

    document.getElementById("useInharm").checked = false;
    document.getElementById("stereoSpread").checked = false;

    // -----------------------------
    // AMP ENVELOPE
    // -----------------------------
    document.getElementById("attack").value = 0.001;
    document.getElementById("decay").value = 0.12;
    document.getElementById("sustain").value = 0.0;
    document.getElementById("release").value = 0.08;
    document.getElementById("tail").value = 0.2;
    document.getElementById("clickSafe").checked = true;

    // -----------------------------
    // MAIN FILTER (correct IDs)
    // -----------------------------
    document.getElementById("mainFilterEnabled").checked = true;
    document.getElementById("mainFilterCutoff").value = 20000;
    document.getElementById("mainFilterResonance").value = 0;
    document.getElementById("mainFilterEnvAmount").value = 0;

    document.getElementById("mainFilterAttack").value = 0.001;
    document.getElementById("mainFilterDecay").value = 0.001;
    document.getElementById("mainFilterSustain").value = 1.0;
    document.getElementById("mainFilterRelease").value = 0.001;

    // -----------------------------
    // POST FX (correct IDs)
    // -----------------------------
    document.getElementById("postFxNoise").value = 0.0;
    document.getElementById("postFxReverbAmount").value = 0.0;
    document.getElementById("postFxWidth").value = 0.0;

    document.getElementById("postFxEnableNoise").checked = false;
    document.getElementById("postFxEnableReverb").checked = false;

    // -----------------------------
    // PITCH ENVELOPE
    // -----------------------------
    document.getElementById("pitchEnvEnable").checked = true;
    document.getElementById("pitchModeRelative").checked = true;
    document.getElementById("pitchModeAbsolute").checked = false;

    document.getElementById("pitchStart").value = 2.0;
    document.getElementById("pitchEnd").value = 0.5;
    document.getElementById("pitchTime").value = 0.12;
    document.getElementById("pitchExpo").checked = true;

    // -----------------------------
    // FM (disabled)
    // -----------------------------
    document.getElementById("fmEnable").checked = false;

    // -----------------------------
    // VIBRATO (disabled)
    // -----------------------------
    document.getElementById("vibEnable").checked = false;

    // -----------------------------
    // SATURATION (correct IDs)
    // -----------------------------
    document.getElementById("fxDriveEnable").checked = true;
    document.getElementById("fxDrive").value = 0.15;

    // -----------------------------
    // DISPATCH INPUT EVENTS
    // -----------------------------
    [
        "freq","detune","inharm",
        "attack","decay","sustain","release","tail",
        "mainFilterCutoff","mainFilterResonance","mainFilterEnvAmount",
        "mainFilterAttack","mainFilterDecay","mainFilterSustain","mainFilterRelease",
        "postFxNoise","postFxReverbAmount","postFxWidth",
        "pitchStart","pitchEnd","pitchTime",
        "fxDrive"
    ].forEach(id => {
        const event = new Event("input");
        document.getElementById(id).dispatchEvent(event);
    });

    document.getElementById("pitchModeRelative").checked = true;
    updatePitchModeUI();

    updateFmModeUI();
    updateFmAmountLabel();
}


export function loadMarioCoinPreset() {

    // -----------------------------
    // OSCILLATORS
    // -----------------------------
    document.getElementById("freq").value = 900;
    document.getElementById("detune").value = 0;
    document.getElementById("inharm").value = 0;

    document.getElementById("oscSine").checked = false;
    document.getElementById("oscTriangle").checked = false;
    document.getElementById("oscSquare").checked = true;
    document.getElementById("oscSaw").checked = false;

    document.getElementById("useInharm").checked = false;
    document.getElementById("stereoSpread").checked = false;

    // -----------------------------
    // AMP ENVELOPE
    // -----------------------------
    document.getElementById("attack").value = 0.001;
    document.getElementById("decay").value = 0.15;
    document.getElementById("sustain").value = 0.0;
    document.getElementById("release").value = 0.08;
    document.getElementById("tail").value = 0.2;
    document.getElementById("clickSafe").checked = true;

    // -----------------------------
    // MAIN FILTER
    // -----------------------------
    document.getElementById("mainFilterEnabled").checked = true;
    document.getElementById("mainFilterCutoff").value = 20000;
    document.getElementById("mainFilterResonance").value = 0;
    document.getElementById("mainFilterEnvAmount").value = 0;

    document.getElementById("mainFilterAttack").value = 0.001;
    document.getElementById("mainFilterDecay").value = 0.001;
    document.getElementById("mainFilterSustain").value = 1.0;
    document.getElementById("mainFilterRelease").value = 0.001;

    // -----------------------------
    // POST FX
    // -----------------------------
    document.getElementById("postFxNoise").value = 0.0;
    document.getElementById("postFxReverbAmount").value = 0.0;
    document.getElementById("postFxWidth").value = 0.0;

    document.getElementById("postFxEnableNoise").checked = false;
    document.getElementById("postFxEnableReverb").checked = false;

    // -----------------------------
    // PITCH ENVELOPE (UPWARD CHIRP)
    // -----------------------------
    document.getElementById("pitchEnvEnable").checked = true;
    document.getElementById("pitchModeRelative").checked = true;

    document.getElementById("pitchStart").value = 0.8;
    document.getElementById("pitchEnd").value = 2.2;
    document.getElementById("pitchTime").value = 0.10;
    document.getElementById("pitchExpo").checked = true;

    // -----------------------------
    // FM (disabled)
    // -----------------------------
    document.getElementById("fmEnable").checked = false;

    // -----------------------------
    // VIBRATO (disabled)
    // -----------------------------
    document.getElementById("vibEnable").checked = false;

    // -----------------------------
    // SATURATION
    // -----------------------------
    document.getElementById("fxDriveEnable").checked = true;
    document.getElementById("fxDrive").value = 0.12;

    // -----------------------------
    // DISPATCH INPUT EVENTS
    // -----------------------------
    [
    "freq","detune","inharm",
    "attack","decay","sustain","release","tail",
    "mainFilterCutoff","mainFilterResonance","mainFilterEnvAmount",
    "mainFilterAttack","mainFilterDecay","mainFilterSustain","mainFilterRelease",
    "postFxNoise","postFxReverbAmount","postFxWidth",
    "pitchStart","pitchEnd","pitchTime",
    "fxDrive",
    "postFilterFreq",
    "postFilterQ",
    "postFilterGain"
    ].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            const event = new Event("input");
            el.dispatchEvent(event);
        }
    });


    document.getElementById("pitchModeRelative").checked = true;
    updatePitchModeUI();

    updateFmModeUI();
    updateFmAmountLabel();
}