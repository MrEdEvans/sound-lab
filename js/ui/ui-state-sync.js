import { engineState } from "../engine-state.js";
import { val, checked, setValue, setChecked } from "./ui-helpers.js";

export function syncStateFromUI() {

    // -----------------------------
    // OSCILLATOR
    // -----------------------------
    engineState.osc.freq = Number(val("freq"));
    engineState.osc.detune = Number(val("detune"));
    engineState.osc.inharm = Number(val("inharm"));
    engineState.osc.useInharm = checked("useInharm");
    engineState.osc.stereoSpread = checked("stereoSpread") ? 1.0 : 0.0;

    engineState.osc.waves.sine = checked("oscSine");
    engineState.osc.waves.triangle = checked("oscTriangle");
    engineState.osc.waves.square = checked("oscSquare");
    engineState.osc.waves.sawtooth = checked("oscSaw");

    // -----------------------------
    // MAIN FILTER
    // -----------------------------
    engineState.mainFilter.enabled = checked("mainFilterEnabled");
    engineState.mainFilter.type =
        document.querySelector('input[name="mainFilterType"]:checked').value;

    engineState.mainFilter.cutoff = Number(val("mainFilterCutoff"));
    engineState.mainFilter.resonance = Number(val("mainFilterResonance"));
    engineState.mainFilter.envAmount = Number(val("mainFilterEnvAmount"));

    engineState.mainFilter.env.attack = Number(val("mainFilterAttack"));
    engineState.mainFilter.env.decay = Number(val("mainFilterDecay"));
    engineState.mainFilter.env.sustain = Number(val("mainFilterSustain"));
    engineState.mainFilter.env.release = Number(val("mainFilterRelease"));

    // -----------------------------
    // AMP ENVELOPE
    // -----------------------------
    engineState.ampEnv.attack = Number(val("attack"));
    engineState.ampEnv.decay = Number(val("decay"));
    engineState.ampEnv.sustain = Number(val("sustain"));
    engineState.ampEnv.release = Number(val("release"));
    engineState.ampEnv.tail = Number(val("tail"));
    engineState.ampEnv.clickSafe = checked("clickSafe");

    // -----------------------------
    // PITCH ENVELOPE
    // -----------------------------
    engineState.pitchEnv.enabled = checked("pitchEnvEnable");
    engineState.pitchEnv.start = Number(val("pitchStart"));
    engineState.pitchEnv.end = Number(val("pitchEnd"));
    engineState.pitchEnv.time = Number(val("pitchTime"));
    engineState.pitchEnv.expo = checked("pitchExpo");
    engineState.pitchEnv.mode =
        checked("pitchModeRelative") ? "relative" : "absolute";

    // -----------------------------
    // FM
    // -----------------------------
    engineState.fm.enabled = checked("fmEnable");
    engineState.fm.mode =
        checked("fmModeRatio") ? "ratio" : "free";

    engineState.fm.waveform =
        document.querySelector('input[name="fmWave"]:checked').value;

    engineState.fm.ratio = Number(val("fmRatio"));
    engineState.fm.freq = Number(val("fmFreq"));
    engineState.fm.amount = Number(val("fmAmount"));
    engineState.fm.amountMode =
        checked("fmAmountLinear") ? "linear" : "index";

    engineState.fm.env.attack = Number(val("fmAttack"));
    engineState.fm.env.decay = Number(val("fmDecay"));
    engineState.fm.env.sustain = Number(val("fmSustain"));
    engineState.fm.env.release = Number(val("fmRelease"));

    // -----------------------------
    // VIBRATO
    // -----------------------------
    engineState.vibrato.enabled = checked("vibEnable");
    engineState.vibrato.rate = Number(val("vibRate"));
    engineState.vibrato.depth = Number(val("vibDepth"));
    engineState.vibrato.delay = Number(val("vibDelay"));
    engineState.vibrato.fade = Math.max(0.001, Number(val("vibFade")));
    engineState.vibrato.waveform =
        document.querySelector('input[name="vibWave"]:checked').value;

    // -----------------------------
    // POST FX
    // -----------------------------
    engineState.fx.reverb.enabled = checked("postFxEnableReverb");
    engineState.fx.reverb.amount = Number(val("postFxReverbAmount"));

    engineState.fx.drive.enabled = checked("fxDriveEnable");
    engineState.fx.drive.amount = Number(val("fxDrive"));

    engineState.fx.noise.enabled = checked("postFxEnableNoise");
    engineState.fx.noise.amount = Number(val("postFxNoise"));

    engineState.fx.width.amount = Number(val("postFxWidth"));


    // -----------------------------
    // POST FILTER
    // -----------------------------
    engineState.postFilter.enabled = checked("postFilterEnabled");
    engineState.postFilter.type =
        document.querySelector('input[name="postFilterType"]:checked').value;

    const freqEl = document.getElementById("postFilterFreq");
    const qEl = document.getElementById("postFilterQ");
    const gainEl = document.getElementById("postFilterGain");

    engineState.postFilter.freq = freqEl ? Number(freqEl.value) : 2000;
    engineState.postFilter.Q = qEl ? Number(qEl.value) : 1.0;
    engineState.postFilter.gain = gainEl ? Number(gainEl.value) : 0;
}

export function syncUIFromState() {

    /* ------------------------------------------------------------
       OSCILLATOR
    ------------------------------------------------------------ */
    setValue("freq", engineState.osc.freq);
    setValue("detune", engineState.osc.detune);
    setValue("inharm", engineState.osc.inharm);
    setChecked("useInharm", engineState.osc.useInharm);
    setChecked("stereoSpread", engineState.osc.stereoSpread > 0);

    setChecked("oscSine", engineState.osc.waves.sine);
    setChecked("oscTriangle", engineState.osc.waves.triangle);
    setChecked("oscSquare", engineState.osc.waves.square);
    setChecked("oscSaw", engineState.osc.waves.sawtooth);

    /* ------------------------------------------------------------
       MAIN FILTER
    ------------------------------------------------------------ */
    setChecked("mainFilterEnabled", engineState.mainFilter.enabled);
    setValue("mainFilterCutoff", engineState.mainFilter.cutoff);
    setValue("mainFilterResonance", engineState.mainFilter.resonance);
    setValue("mainFilterEnvAmount", engineState.mainFilter.envAmount);

    setValue("mainFilterAttack", engineState.mainFilter.env.attack);
    setValue("mainFilterDecay", engineState.mainFilter.env.decay);
    setValue("mainFilterSustain", engineState.mainFilter.env.sustain);
    setValue("mainFilterRelease", engineState.mainFilter.env.release);

    const mfType = engineState.mainFilter.type;
    const mfRadio = document.querySelector(
        `input[name="mainFilterType"][value="${mfType}"]`
    );
    if (mfRadio) mfRadio.checked = true;

    /* ------------------------------------------------------------
       AMP ENVELOPE
    ------------------------------------------------------------ */
    setValue("attack", engineState.ampEnv.attack);
    setValue("decay", engineState.ampEnv.decay);
    setValue("sustain", engineState.ampEnv.sustain);
    setValue("release", engineState.ampEnv.release);
    setValue("tail", engineState.ampEnv.tail);
    setChecked("clickSafe", engineState.ampEnv.clickSafe);

    /* ------------------------------------------------------------
       PITCH ENVELOPE
    ------------------------------------------------------------ */
    setChecked("pitchEnvEnable", engineState.pitchEnv.enabled);
    setValue("pitchStart", engineState.pitchEnv.start);
    setValue("pitchEnd", engineState.pitchEnv.end);
    setValue("pitchTime", engineState.pitchEnv.time);
    setChecked("pitchExpo", engineState.pitchEnv.expo);

    const pitchMode = engineState.pitchEnv.mode;
    setChecked("pitchModeRelative", pitchMode === "relative");
    setChecked("pitchModeAbsolute", pitchMode === "absolute");

    /* ------------------------------------------------------------
       FM
    ------------------------------------------------------------ */
    setChecked("fmEnable", engineState.fm.enabled);
    setValue("fmRatio", engineState.fm.ratio);
    setValue("fmFreq", engineState.fm.freq);
    setValue("fmAmount", engineState.fm.amount);

    setChecked("fmAmountLinear", engineState.fm.amountMode === "linear");
    setChecked("fmAmountIndex", engineState.fm.amountMode === "index");

    setValue("fmAttack", engineState.fm.env.attack);
    setValue("fmDecay", engineState.fm.env.decay);
    setValue("fmSustain", engineState.fm.env.sustain);
    setValue("fmRelease", engineState.fm.env.release);

    const fmWave = engineState.fm.waveform;
    const fmRadio = document.querySelector(
        `input[name="fmWave"][value="${fmWave}"]`
    );
    if (fmRadio) fmRadio.checked = true;

    setChecked("fmModeRatio", engineState.fm.mode === "ratio");
    setChecked("fmModeFree", engineState.fm.mode === "free");

    /* ------------------------------------------------------------
       VIBRATO
    ------------------------------------------------------------ */
    setChecked("vibEnable", engineState.vibrato.enabled);
    setValue("vibRate", engineState.vibrato.rate);
    setValue("vibDepth", engineState.vibrato.depth);
    setValue("vibDelay", engineState.vibrato.delay);
    setValue("vibFade", engineState.vibrato.fade);

    const vibWave = engineState.vibrato.waveform;
    const vibRadio = document.querySelector(
        `input[name="vibWave"][value="${vibWave}"]`
    );
    if (vibRadio) vibRadio.checked = true;

    /* ------------------------------------------------------------
       POST FX
    ------------------------------------------------------------ */
    setChecked("postFxEnableReverb", engineState.fx.reverb.enabled);
    setValue("postFxReverbAmount", engineState.fx.reverb.amount);

    setChecked("fxDriveEnable", engineState.fx.drive.enabled);
    setValue("fxDrive", engineState.fx.drive.amount);

    setChecked("postFxEnableNoise", engineState.fx.noise.enabled);
    setValue("postFxNoise", engineState.fx.noise.amount);

    setValue("postFxWidth", engineState.fx.width.amount);


    /* ------------------------------------------------------------
       POST FILTER
    ------------------------------------------------------------ */
    setChecked("postFilterEnabled", engineState.postFilter.enabled);

    const pfType = engineState.postFilter.type;
    const pfRadio = document.querySelector(
        `input[name="postFilterType"][value="${pfType}"]`
    );
    if (pfRadio) pfRadio.checked = true;

    const freqEl = document.getElementById("postFilterFreq");
    const qEl = document.getElementById("postFilterQ");
    const gainEl = document.getElementById("postFilterGain");

    if (freqEl) freqEl.value = engineState.postFilter.freq;
    if (qEl) qEl.value = engineState.postFilter.Q;
    if (gainEl) gainEl.value = engineState.postFilter.gain;
}
