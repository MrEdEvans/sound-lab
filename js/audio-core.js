let audioCtx = null;
let currentNodes = [];

export function getAudioCtx() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
}

export function clearCurrentNodes() {
    currentNodes.forEach(node => {
        try { node.disconnect(); } catch (e) {}
    });
    currentNodes = [];
}

export function createImpulseResponse(audio, seconds = 2.5, decay = 2.0) {
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

export { currentNodes };
