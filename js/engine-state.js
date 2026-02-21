export const engineState = {
    osc: {
        freq: 440,
        detune: 0,
        inharm: 1.0,
        useInharm: false,
        stereoSpread: 0.0,
        waves: {
            sine: true,
            triangle: false,
            square: false,
            sawtooth: false
        }
    },

    ampEnv: {
        attack: 0.01,
        decay: 0.2,
        sustain: 0.5,
        release: 0.3,
        tail: 0.0,
        clickSafe: true
    },

    pitchEnv: {
        enabled: false,
        mode: "relative",
        start: 1.0,
        end: 1.0,
        time: 0.1,
        expo: true   // FIXED: was pitchExpo
    },

    fm: {
        enabled: false,
        waveform: "sine",
        mode: "ratio",
        ratio: 1.0,
        freq: 440,
        amountMode: "linear",
        amount: 0.0,
        env: {
            attack: 0.01,
            decay: 0.2,
            sustain: 0.5,
            release: 0.3
        }
    },

    vibrato: {
        enabled: false,
        waveform: "sine",
        rate: 5,
        depth: 0,
        delay: 0,
        fade: 0
    },

    mainFilter: {
        enabled: true,
        type: "lowpass",
        cutoff: 2000,
        resonance: 1.0,
        envAmount: 0.0,
        env: {
            attack: 0.01,
            decay: 0.2,
            sustain: 0.5,
            release: 0.3
        }
    },

    postFilter: {
        enabled: false,
        type: "peaking",
        freq: 2000,
        Q: 1.0,
        gain: 0
    },

    fx: {
        noise: { enabled: false, amount: 0.0 },
        reverb: { enabled: false, amount: 0.0 },
        drive: { enabled: false, amount: 0.0 },
        width: 1.0
    }
};
