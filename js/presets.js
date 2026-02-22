// ============================================================
//  MODERN PRESET SYSTEM (PURE STATE OBJECTS)
// ============================================================

// ------------------------------------------------------------
// IMPORT ENGINE + UI SYNC
// ------------------------------------------------------------
import { engineState } from "./engine-state.js";
import { syncUIFromState } from "./ui/ui-state-sync.js";
import { playSoundFromState } from "./audio-engine.js";


// ============================================================
//  PRESET DEFINITIONS
// ============================================================


// ============================================================
//  PRESET: BRIGHT CHIME
// ============================================================

export const presetBrightChime = {
    osc: {
        freq: 880,
        detune: 10,
        inharm: 0.4,
        useInharm: true,
        stereoSpread: 1.0,
        waves: {
            sine: true,
            triangle: true,
            square: false,
            sawtooth: false
        }
    },

    mainFilter: {
        enabled: false,
        type: "lowpass",
        cutoff: 2000,
        resonance: 0.7,
        envAmount: 0,
        env: {
            attack: 0.01,
            decay: 0.2,
            sustain: 0.5,
            release: 0.3
        }
    },

    ampEnv: {
        attack: 0.004,
        decay: 0.25,
        sustain: 0.35,
        release: 1.0,
        tail: 1.4,
        clickSafe: true
    },

    pitchEnv: {
        enabled: true,
        start: 1200,
        end: 2600,
        time: 0.12,
        expo: false,
        mode: "relative"
    },

    fm: {
        enabled: true,
        mode: "ratio",
        waveform: "sine",
        ratio: 2.0,
        freq: 600,
        amount: 300,
        amountMode: "index",
        env: {
            attack: 0.01,
            decay: 0.25,
            sustain: 0.3,
            release: 0.6
        }
    },

    vibrato: {
        enabled: true,
        rate: 5.0,
        depth: 15,
        delay: 0.0,
        fade: 0.20,
        waveform: "sine"
    },

    fx: {
        reverb: {
            enabled: true,
            amount: 0.45
        },
        drive: {
            enabled: false,
            amount: 0
        },
        noise: {
            enabled: true,
            amount: 0.18
        },
        width: {
            amount: 0.6
        }

    },

    postFilter: {
        enabled: false,
        type: "peaking",
        freq: 2000,
        Q: 1.0,
        gain: 0
    }
};



// ============================================================
//  PRESET: MARIO JUMP (MODERNIZED)
// ============================================================

export const presetMarioJump = {
    osc: {
        freq: 1200,
        detune: 0,
        inharm: 1.0,
        useInharm: false,
        stereoSpread: 0.0,
        waves: {
            sine: false,
            triangle: false,
            square: true,
            sawtooth: false
        }
    },

    ampEnv: {
        attack: 0.001,
        decay: 0.12,
        sustain: 0.0,
        release: 0.08,
        tail: 0.2,
        clickSafe: true
    },

    mainFilter: {
        enabled: true,
        type: "lowpass",
        cutoff: 20000,
        resonance: 0,
        envAmount: 0,
        env: {
            attack: 0.001,
            decay: 0.001,
            sustain: 1.0,
            release: 0.001
        }
    },

    pitchEnv: {
        enabled: true,
        mode: "relative",
        start: 2.0,
        end: 0.5,
        time: 0.12,
        expo: true
    },

    fm: {
        enabled: false,
        waveform: "sine",
        mode: "ratio",
        ratio: 1.0,
        freq: 440,
        amount: 0,
        amountMode: "linear",
        env: {
            attack: 0,
            decay: 0,
            sustain: 0,
            release: 0
        }
    },

    vibrato: {
        enabled: false,
        rate: 5,
        depth: 0,
        delay: 0,
        fade: 0,
        waveform: "sine"
    },

    fx: {
        reverb: {
            enabled: false,
            amount: 0
        },
        drive: {
            enabled: true,
            amount: 0.15
        },
        noise: {
            enabled: true,
            amount: 0.18
        },
        width: {
            amount: 0.6
        }
    },

    postFilter: {
        enabled: false,
        type: "peaking",
        freq: 2000,
        Q: 1.0,
        gain: 0
    }
};



// ============================================================
//  PRESET: MARIO COIN (MODERNIZED)
// ============================================================

export const presetMarioCoin = {
    osc: {
        freq: 900,
        detune: 0,
        inharm: 1.0,
        useInharm: false,
        stereoSpread: 0.0,
        waves: {
            sine: false,
            triangle: false,
            square: true,
            sawtooth: false
        }
    },

    ampEnv: {
        attack: 0.001,
        decay: 0.15,
        sustain: 0.0,
        release: 0.08,
        tail: 0.2,
        clickSafe: true
    },

    mainFilter: {
        enabled: true,
        type: "lowpass",
        cutoff: 20000,
        resonance: 0,
        envAmount: 0,
        env: {
            attack: 0.001,
            decay: 0.001,
            sustain: 1.0,
            release: 0.001
        }
    },

    pitchEnv: {
        enabled: true,
        mode: "relative",
        start: 0.8,
        end: 2.2,
        time: 0.10,
        expo: true
    },

    fm: {
        enabled: false,
        waveform: "sine",
        mode: "ratio",
        ratio: 1.0,
        freq: 440,
        amount: 0,
        amountMode: "linear",
        env: {
            attack: 0,
            decay: 0,
            sustain: 0,
            release: 0
        }
    },

    vibrato: {
        enabled: false,
        rate: 5,
        depth: 0,
        delay: 0,
        fade: 0,
        waveform: "sine"
    },

    fx: {
        reverb: { enabled: false, amount: 0 },
        drive: { enabled: true, amount: 0.12 },
        noise: { enabled: true, amount: 0.18 },
        width: { amount: 0.6 }
    },

    postFilter: {
        enabled: false,
        type: "peaking",
        freq: 2000,
        Q: 1.0,
        gain: 0
    }
};



// ============================================================
//  PRESET REGISTRY (dictionary)
// ============================================================
export const presets = {
    BrightChime: presetBrightChime,
    MarioJump: presetMarioJump,
    MarioCoin: presetMarioCoin
    // User presets will be added here later
};


// ============================================================
//  LOAD PRESET (silent)
// ============================================================
export function loadPreset(name) {
    const preset = presets[name];
    if (!preset) {
        console.warn(`Preset "${name}" not found.`);
        return;
    }

    const clone = JSON.parse(JSON.stringify(preset));
    Object.assign(engineState, clone);
    syncUIFromState();
}


// ============================================================
//  LOAD + PLAY PRESET
// ============================================================
export function loadPresetAndPlay(name) {
    loadPreset(name);
    playSoundFromState();
}

// ============================================================
//  RANDOMIZER (MODERNIZED)
//  → Mutates engineState directly
//  → Then syncs UI and plays sound
// ============================================================

export function randomizeSettings() {

    // Helper functions
    const rand = (min, max) => min + Math.random() * (max - min);
    const choose = arr => arr[Math.floor(Math.random() * arr.length)];
    const randLog = (min, max) => {
        const logMin = Math.log(min);
        const logMax = Math.log(max);
        return Math.exp(logMin + Math.random() * (logMax - logMin));
    };


    // ------------------------------------------------------------
    // OSCILLATOR
    // ------------------------------------------------------------
    const waves = ["sine", "triangle", "square", "sawtooth"];
    const chosen = waves.filter(() => Math.random() < 0.5);
    if (chosen.length === 0) chosen.push("sine");

    engineState.osc.waves = {
        sine: chosen.includes("sine"),
        triangle: chosen.includes("triangle"),
        square: chosen.includes("square"),
        sawtooth: chosen.includes("sawtooth")
    };

    engineState.osc.freq = randLog(120, 2000);       // Safe, musical range
    engineState.osc.detune = rand(-15, 15);          // Small, usable detune
    engineState.osc.useInharm = Math.random() < 0.3;
    engineState.osc.inharm = engineState.osc.useInharm ? rand(0.7, 1.4) : 1.0;
    engineState.osc.stereoSpread = rand(0.2, 1.0);

    // ------------------------------------------------------------
    // AMP ENV
    // ------------------------------------------------------------
    engineState.ampEnv.attack = rand(0.001, 0.03);
    engineState.ampEnv.decay = rand(0.05, 0.35);
    engineState.ampEnv.sustain = rand(0, 0.6);
    engineState.ampEnv.release = rand(0.05, 0.35);
    engineState.ampEnv.tail = rand(0.05, 0.8);

    // ------------------------------------------------------------
    // PITCH ENV
    // ------------------------------------------------------------
    engineState.pitchEnv.enabled = Math.random() < 0.8;
    engineState.pitchEnv.mode = Math.random() < 0.5 ? "relative" : "absolute";

    if (engineState.pitchEnv.mode === "relative") {
        engineState.pitchEnv.start = rand(0.5, 1.5);   // multipliers
        engineState.pitchEnv.end   = rand(0.5, 2.0);
    } else {
        engineState.pitchEnv.start = randLog(200, 2000);  // Hz
        engineState.pitchEnv.end   = randLog(200, 3000);
    }

    engineState.pitchEnv.time = rand(0.02, 0.25);
    engineState.pitchEnv.expo = Math.random() < 0.5;

    // ------------------------------------------------------------
    // FM
    // ------------------------------------------------------------
    engineState.fm.enabled = Math.random() < 0.5;
    engineState.fm.waveform = choose(["sine", "triangle"]);
    engineState.fm.mode = Math.random() < 0.5 ? "ratio" : "free";
    engineState.fm.amountMode = Math.random() < 0.5 ? "linear" : "index";

    if (engineState.fm.enabled) {
        if (engineState.fm.mode === "ratio") {
            engineState.fm.ratio = rand(0.5, 3.0);
            engineState.fm.freq = 440;
        } else {
            engineState.fm.freq = rand(80, 1500);
            engineState.fm.ratio = 1.0;
        }

        engineState.fm.amount =
            engineState.fm.amountMode === "linear"
                ? rand(0, 0.5)
                : rand(0, 3.0);

        engineState.fm.env.attack = rand(0.001, 0.05);
        engineState.fm.env.decay = rand(0.05, 0.3);
        engineState.fm.env.sustain = rand(0, 0.6);
        engineState.fm.env.release = rand(0.05, 0.3);
    } else {
        engineState.fm.amount = 0;
    }

    // ------------------------------------------------------------
    // VIBRATO
    // ------------------------------------------------------------
    engineState.vibrato.enabled = Math.random() < 0.4;
    engineState.vibrato.waveform = choose(["sine", "triangle"]);

    if (engineState.vibrato.enabled) {
        engineState.vibrato.rate = rand(4, 8);
        engineState.vibrato.depth = rand(0.002, 0.02);
        engineState.vibrato.delay = rand(0, 0.15);
        engineState.vibrato.fade = rand(0, 0.2);
    } else {
        engineState.vibrato.depth = 0;
    }

    // ------------------------------------------------------------
    // MAIN FILTER
    // ------------------------------------------------------------
    engineState.mainFilter.enabled = Math.random() < 0.9;
    engineState.mainFilter.type = "lowpass";
    engineState.mainFilter.cutoff = randLog(200, 6000);
    engineState.mainFilter.resonance = rand(0.1, 8);
    engineState.mainFilter.envAmount = rand(-0.5, 1.0);

    engineState.mainFilter.env.attack = rand(0.001, 0.08);
    engineState.mainFilter.env.decay = rand(0.05, 0.3);
    engineState.mainFilter.env.sustain = rand(0, 0.8);
    engineState.mainFilter.env.release = rand(0.05, 0.3);

    // ------------------------------------------------------------
    // POST FILTER
    // ------------------------------------------------------------
    engineState.postFilter.enabled = Math.random() < 0.3;
    engineState.postFilter.type = choose(["peaking", "lowshelf", "highshelf"]);
    engineState.postFilter.freq = rand(300, 5000);
    engineState.postFilter.Q = rand(0.3, 6);
    engineState.postFilter.gain = rand(-4, 4);

    // ------------------------------------------------------------
    // FX
    // ------------------------------------------------------------
    engineState.fx.reverb.enabled = Math.random() < 0.4;
    engineState.fx.reverb.amount = engineState.fx.reverb.enabled ? rand(0.05, 0.4) : 0;

    engineState.fx.drive.enabled = Math.random() < 0.4;
    engineState.fx.drive.amount = engineState.fx.drive.enabled ? rand(0.05, 0.5) : 0;

    engineState.fx.noise.enabled = Math.random() < 0.4;
    engineState.fx.noise.amount = engineState.fx.noise.enabled ? rand(0.01, 0.15) : 0;

    engineState.fx.width.amount = rand(0.3, 1.0);

    // ------------------------------------------------------------
    // APPLY + PLAY
    // ------------------------------------------------------------
    syncUIFromState();
}
