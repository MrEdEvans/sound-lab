// src/audio/graph/createAudioGraph.js

export function createAudioGraph(context) {
    const voiceBus = context.createGain();
    voiceBus.gain.value = 1;

    const voiceGain = context.createGain();
    voiceGain.gain.value = 1;
    voiceGain.connect(voiceBus);

    return {
        context,
        voiceBus,
        voiceGain,
        oscillators: [],
        filters: [],
        ampEnv: null
    };
}
