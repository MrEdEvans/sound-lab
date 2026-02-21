import { updatePitchModeUI, updateFmModeUI, updateFmAmountLabel, renderPostFilterControls } from "./ui/ui-state.js";


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
/* -------------------------------------------------------
   RANDOMIZATION HELPERS
------------------------------------------------------- */

function rand(min, max) {
    return min + Math.random() * (max - min);
}

function randInt(min, max) {
    return Math.floor(rand(min, max + 1));
}

function chance(p) {
    return Math.random() < p;
}

function choose(arr) {
    return arr[randInt(0, arr.length - 1)];
}

function chooseMultiple(arr, count) {
    const copy = [...arr];
    const result = [];
    for (let i = 0; i < count && copy.length > 0; i++) {
        const idx = randInt(0, copy.length - 1);
        result.push(copy.splice(idx, 1)[0]);
    }
    return result;
}

function setValue(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value;
}

function setChecked(id, value) {
    const el = document.getElementById(id);
    if (el) el.checked = value;
}

/* -------------------------------------------------------
   MAIN RANDOMIZER
------------------------------------------------------- */

export function randomizeSettings() {

    /* ---------------------------------------------
       1. OSCILLATOR WAVEFORMS + CORE PARAMS
    --------------------------------------------- */

    // Waveform mixer: oscSine, oscTriangle, oscSquare, oscSawtooth
    const oscWaves = ["Sine", "Triangle", "Square", "Sawtooth"];
    const chosen = chooseMultiple(oscWaves, randInt(1, 3));

    oscWaves.forEach(w => {
        setChecked(`osc${w}`, chosen.includes(w));
    });

    // Inharmonic partials
    const enableInharm = chance(0.3);
    setChecked("useInharm", enableInharm);
    if (enableInharm) {
        setValue("inharm", rand(0.5, 2.0));
    } else {
        setValue("inharm", 1.0);
    }

    // Core oscillator params
    setValue("freq", rand(100, 1200));
    setValue("detune", rand(-20, 20));

    // Stereo spread (slider 0–1)
    setValue("stereoSpread", rand(0, 1.0));

    /* ---------------------------------------------
       2. AMPLITUDE ENVELOPE
    --------------------------------------------- */

    setValue("attack", rand(0, 0.05));
    setValue("decay", rand(0.05, 0.4));
    setValue("sustain", rand(0, 0.8));
    setValue("release", rand(0.05, 0.4));
    setValue("tail", rand(0, 1.0));

    /* ---------------------------------------------
       3. PITCH ENVELOPE (panel usage + mode)
    --------------------------------------------- */

    const enablePitchEnv = chance(0.8);
    setChecked("pitchEnvEnable", enablePitchEnv);

    const pitchRelative = document.getElementById("pitchModeRelative")?.checked ?? false;

    if (enablePitchEnv) {
        if (pitchRelative) {
            // Ratio mode
            setValue("pitchStart", rand(0.5, 2.0));
            setValue("pitchEnd", rand(0.5, 3.0));
        } else {
            // Absolute Hz mode
            setValue("pitchStart", rand(100, 800));
            setValue("pitchEnd", rand(200, 2000));
        }
        setValue("pitchTime", rand(0.02, 0.3));
    } else {
        // Neutral pitch envelope
        setValue("pitchStart", pitchRelative ? 1.0 : 440);
        setValue("pitchEnd", pitchRelative ? 1.0 : 440);
        setValue("pitchTime", 0);
    }

    /* ---------------------------------------------
       4. FM OPERATOR (panel usage + modes)
    --------------------------------------------- */

    const enableFM = chance(0.6);
    setChecked("fmEnable", enableFM);

    // FM waveform (select)
    const fmWaves = ["sine", "triangle", "square"];
    setValue("fmWaveform", choose(fmWaves));

    // FM modes
    const useRatioMode = chance(0.5);
    setChecked("fmModeRatio", useRatioMode);
    setChecked("fmModeFree", !useRatioMode);

    const useLinearAmount = chance(0.5);
    setChecked("fmAmountLinear", useLinearAmount);
    setChecked("fmAmountIndex", !useLinearAmount);

    if (enableFM) {
        if (useRatioMode) {
            setValue("fmRatio", rand(0.25, 4.0));
            setValue("fmFreq", 440); // base reference
        } else {
            setValue("fmFreq", rand(50, 2000));
            setValue("fmRatio", 1.0);
        }

        if (useLinearAmount) {
            setValue("fmAmount", rand(0, 1.0));
        } else {
            setValue("fmAmount", rand(0, 5.0));
        }

        setValue("fmAttack", rand(0, 0.1));
        setValue("fmDecay", rand(0.05, 0.4));
        setValue("fmSustain", rand(0, 0.8));
        setValue("fmRelease", rand(0.05, 0.4));
    } else {
        // FM off → neutralize modulation
        setValue("fmAmount", 0);
        setValue("fmAttack", 0);
        setValue("fmDecay", 0);
        setValue("fmSustain", 0);
        setValue("fmRelease", 0);
    }

    /* ---------------------------------------------
       5. VIBRATO (panel usage + waveform)
    --------------------------------------------- */

    const enableVib = chance(0.5);
    setChecked("vibEnable", enableVib);

    const vibWave = choose(["sine", "triangle"]);
    setValue("vibWaveform", vibWave);

    if (enableVib) {
        setValue("vibRate", rand(3, 9));
        setValue("vibDepth", rand(0, 0.5));
        setValue("vibDelay", rand(0, 0.2));
        setValue("vibFade", rand(0, 0.3));
    } else {
        setValue("vibDepth", 0);
        setValue("vibRate", 5);
        setValue("vibDelay", 0);
        setValue("vibFade", 0);
    }

    /* ---------------------------------------------
       6. MAIN FILTER (always used, but musical)
    --------------------------------------------- */

    setValue("mainFilterCutoff", rand(300, 6000));
    setValue("mainFilterResonance", rand(0.1, 10));
    setValue("mainFilterEnvAmount", rand(-1, 1));

    setValue("mainFilterAttack", rand(0, 0.1));
    setValue("mainFilterDecay", rand(0.05, 0.4));
    setValue("mainFilterSustain", rand(0, 0.8));
    setValue("mainFilterRelease", rand(0.05, 0.4));

    /* ---------------------------------------------
       7. POST FILTER (panel usage + dynamic controls)
    --------------------------------------------- */

    const enablePostFilter = chance(0.4);
    setChecked("postFilterEnabled", enablePostFilter);

    if (enablePostFilter) {
        const type = choose(["peaking", "lowshelf", "highshelf", "bandpass"]);
        const typeRadio = document.getElementById(`postFilterType_${type}`);
        if (typeRadio) typeRadio.checked = true;

        // Build dynamic UI for chosen type
        renderPostFilterControls(type);

        setValue("postFilterFreq", rand(200, 6000));

        if (type === "peaking" || type === "bandpass") {
            setValue("postFilterQ", rand(0.2, 10));
        }

        if (type === "peaking" || type === "lowshelf" || type === "highshelf") {
            setValue("postFilterGain", rand(-6, 6));
        }
    } else {
        // Still ensure UI is in a valid state
        const defaultType = "peaking";
        const typeRadio = document.getElementById(`postFilterType_${defaultType}`);
        if (typeRadio) typeRadio.checked = true;
        renderPostFilterControls(defaultType);
        setValue("postFilterFreq", 2000);
    }

    /* ---------------------------------------------
       8. POST FX PANELS (noise, reverb, drive)
    --------------------------------------------- */

    // Noise
    const enableNoise = chance(0.4);
    setChecked("postFxEnableNoise", enableNoise);
    setValue("postFxNoise", enableNoise ? rand(0, 0.5) : 0);

    // Reverb
    const enableReverb = chance(0.5);
    setChecked("postFxEnableReverb", enableReverb);
    setValue("postFxReverbAmount", enableReverb ? rand(0, 0.6) : 0);

    // Drive / saturation
    const enableDrive = chance(0.4);
    setChecked("fxDriveEnable", enableDrive);
    setValue("fxDrive", enableDrive ? rand(0, 1.0) : 0);

    // Width
    setValue("postFxWidth", rand(0.5, 1.0));

    /* ---------------------------------------------
       9. FINAL UI UPDATES
    --------------------------------------------- */

    // These should be imported from your UI modules:
    // updatePitchModeUI, updateFmModeUI, updateFmAmountLabel, updateMainFilterUI

    if (typeof updatePitchModeUI === "function") updatePitchModeUI();
    if (typeof updateFmModeUI === "function") updateFmModeUI();
    if (typeof updateFmAmountLabel === "function") updateFmAmountLabel();
    if (typeof updateMainFilterUI === "function") updateMainFilterUI();

    if (enablePostFilter) {
        const selected = document.querySelector("input[name='postFilterType']:checked")?.value;
        if (selected) renderPostFilterControls(selected);
    }
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