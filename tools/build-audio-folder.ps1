# Create the root audio folder
New-Item -ItemType Directory -Path "src/audio" -Force | Out-Null

# Create top-level subfolders
$folders = @(
    "src/audio/scheduler",
    "src/audio/graph",
    "src/audio/dsp",
    "src/audio/dsp/oscillators",
    "src/audio/dsp/envelopes",
    "src/audio/dsp/filters",
    "src/audio/dsp/modulation",
    "src/audio/voices",
    "src/audio/routing",
    "src/audio/utils"
)

foreach ($folder in $folders) {
    New-Item -ItemType Directory -Path $folder -Force | Out-Null
}

# Create placeholder files
$files = @(
    "src/audio/AudioEngine.js",
    "src/audio/scheduler/AudioScheduler.js",
    "src/audio/graph/createAudioGraph.js",
    "src/audio/graph/connectModules.js",
    "src/audio/dsp/oscillators/OscillatorFactory.js",
    "src/audio/dsp/oscillators/SineOscillator.js",
    "src/audio/dsp/oscillators/SawOscillator.js",
    "src/audio/dsp/oscillators/SquareOscillator.js",
    "src/audio/dsp/oscillators/NoiseGenerator.js",
    "src/audio/dsp/envelopes/ADSREnvelope.js",
    "src/audio/dsp/envelopes/EnvelopeFactory.js",
    "src/audio/dsp/filters/FilterFactory.js",
    "src/audio/dsp/filters/LowPassFilter.js",
    "src/audio/dsp/filters/HighPassFilter.js",
    "src/audio/dsp/filters/BandPassFilter.js",
    "src/audio/dsp/modulation/LFO.js",
    "src/audio/dsp/modulation/ModMatrix.js",
    "src/audio/voices/Voice.js",
    "src/audio/voices/VoiceAllocator.js",
    "src/audio/routing/RoutingTable.js",
    "src/audio/routing/applyRouting.js",
    "src/audio/utils/AudioMath.js",
    "src/audio/utils/ParameterSmoother.js"
)

foreach ($file in $files) {
    New-Item -ItemType File -Path $file -Force | Out-Null
}
