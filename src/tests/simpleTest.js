// simpleTest.js

// ------------------------------
// Minimal AudioEngine stub
// (Replace with your real AudioEngine.js)
// ------------------------------
class AudioEngine {
    constructor() {
        this.initialized = false;
    }

    async init(preset) {
        this.context = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.context.createGain();
        this.masterGain.gain.value = 0.5;
        this.masterGain.connect(this.context.destination);

        // Simple oscillator for testing
        this.testOsc = this.context.createOscillator();
        this.testOsc.type = preset.oscillators[0].type;
        this.testOsc.frequency.value = 440;
        this.testOsc.connect(this.masterGain);
        this.testOsc.start();

        this.initialized = true;
    }

    async resume() {
        if (this.context.state === "suspended") {
            await this.context.resume();
        }
    }

    noteOn() {
        this.masterGain.gain.cancelScheduledValues(this.context.currentTime);
        this.masterGain.gain.setValueAtTime(0, this.context.currentTime);
        this.masterGain.gain.linearRampToValueAtTime(0.5, this.context.currentTime + 0.01);
    }

    noteOff() {
        this.masterGain.gain.cancelScheduledValues(this.context.currentTime);
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.context.currentTime);
        this.masterGain.gain.linearRampToValueAtTime(0, this.context.currentTime + 0.2);
    }
}

// ------------------------------
// Minimal preset
// ------------------------------
const testPreset = {
    oscillators: [
        { type: "sawtooth", detune: 0, gain: 1 }
    ],
    filters: [],
    envelopes: {
        amp: { attack: 0.01, decay: 0.1, sustain: 0.8, release: 0.2 }
    },
    fx: [],
    maxVoices: 8
};

// ------------------------------
// Build the page UI
// ------------------------------
document.body.innerHTML = `
    <div style="font-family: sans-serif; padding: 20px;">
        <h2>Simple Synth Test</h2>
        <button id="initBtn" style="padding: 10px 20px; font-size: 16px;">Init Audio</button>
        <button id="playBtn" style="padding: 10px 20px; font-size: 16px;">Play Note</button>
        <button id="stopBtn" style="padding: 10px 20px; font-size: 16px;">Stop Note</button>
        <p>Click "Init Audio" first (required by browsers), then "Play Note".</p>
    </div>
`;

const engine = new AudioEngine();

// ------------------------------
// Button handlers
// ------------------------------
document.getElementById("initBtn").addEventListener("click", async () => {
    await engine.init(testPreset);
    await engine.resume();
    console.log("Audio initialized.");
});

document.getElementById("playBtn").addEventListener("click", () => {
    engine.noteOn();
});

document.getElementById("stopBtn").addEventListener("click", () => {
    engine.noteOff();
});
