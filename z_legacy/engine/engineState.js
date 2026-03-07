/* ========================================================================
   SoundLab Engine State (V1)
   Complete canonical structure with module toggles, multi-wave blending,
   FM, pitch envelope, voice/global filters, FX types, and routing.
   This is the authoritative source of truth for V1.
======================================================================== */

export const createDefaultEngineState = () => ({
  version: "1.0.0",

  /* --------------------------------------------------------------------
     OSCILLATOR (multi-wave blend)
  -------------------------------------------------------------------- */
  osc: {
    enabled: true,
    frequency: 440,             // Hz > 0
    detune: 0,                  // cents
    inharmonicity: 0.0,         // 0–1
    useInharmonicity: false,
    stereoSpread: 0.0,          // 0–1
    waves: {
      sine: 1.0,                // 0–1 blend amount
      triangle: 0.0,
      square: 0.0,
      saw: 0.0
    }
  },

  /* --------------------------------------------------------------------
     AMP ENVELOPE
  -------------------------------------------------------------------- */
  ampEnv: {
    enabled: true,
    attack: 0.01,
    decay: 0.2,
    sustain: 0.5,
    release: 0.3,
    tail: 1.0,                  // post-release tail multiplier
    clickSafe: true
  },

  /* --------------------------------------------------------------------
     PITCH ENVELOPE
  -------------------------------------------------------------------- */
  pitchEnv: {
    enabled: false,
    mode: "relative",           // "relative" | "absolute"
    start: 440,                 // Hz or relative offset
    end: 440,
    time: 0.1,                  // seconds
    expo: true                  // exponential curve
  },

  /* --------------------------------------------------------------------
     FM (frequency modulation)
  -------------------------------------------------------------------- */
  fm: {
    enabled: false,
    waveform: "sine",           // modulator waveform
    mode: "ratio",              // "ratio" | "absolute"
    ratio: 2.0,                 // used when mode = "ratio"
    frequency: 600,             // used when mode = "absolute"
    amountMode: "index",        // "index" | "depth"
    amount: 300,                // index or Hz depth
    env: {
      enabled: false,
      attack: 0.01,
      decay: 0.25,
      sustain: 0.3,
      release: 0.6
    }
  },

  /* --------------------------------------------------------------------
     VIBRATO
  -------------------------------------------------------------------- */
  vibrato: {
    enabled: false,
    waveform: "sine",
    rate: 5.0,                  // Hz
    depth: 20,                  // cents
    delay: 0.0,                 // seconds before vibrato starts
    fade: 0.2                   // seconds to fade in
  },

  /* --------------------------------------------------------------------
     VOICE FILTER (per-voice)
  -------------------------------------------------------------------- */
  voiceFilter: {
    enabled: true,
    cutoff: 1000,               // Hz
    resonance: 0.2,             // 0–1
    envAmount: 0.5,             // 0–1
    env: {
      enabled: true,
      attack: 0.01,
      decay: 0.2,
      sustain: 0.5,
      release: 0.3
    }
  },

  /* --------------------------------------------------------------------
     GLOBAL FILTER (post-mix)
  -------------------------------------------------------------------- */
  globalFilter: {
    enabled: true,
    type: "peaking",            // "peaking" | "lowshelf" | "highshelf" | "bandpass"
    frequency: 2000,            // Hz
    q: 1.0,
    gain: 0                     // dB
  },

  /* --------------------------------------------------------------------
     GLOBAL FX (V1 grouped structure)
  -------------------------------------------------------------------- */
  fx: {
    noise: {
      enabled: false,
      type: "white",            // "white" | "pink" | "brown"
      amount: 0.0
    },
    reverb: {
      enabled: false,
      type: "hall",             // IR-based: "hall" | "room" | "plate" | etc.
      amount: 0.0
    },
    drive: {
      enabled: false,
      type: "soft",             // "soft" | "hard" | "tube" | "fuzz"
      amount: 0.0
    },
    width: {
      enabled: true,
      amount: 1.0               // stereo width 0–1
    }
  },

  /* --------------------------------------------------------------------
     ROUTING (V1 fixed chain)
     Future versions may support reorderable FX or node graphs.
  -------------------------------------------------------------------- */
  routing: {
    oscToAmpEnv: true,
    ampEnvToVoiceFilter: true,
    voiceFilterToGlobalFilter: true,
    globalFilterToFx: true,
    fxToMaster: true
  },

  /* --------------------------------------------------------------------
     GLOBAL SETTINGS
  -------------------------------------------------------------------- */
  global: {
    tuning: 440,                // Hz
    glide: 0.0                  // seconds
  }
});
