// ============================================================================
// src/audio/graph/buildVoiceGraph.js
// Builds the per‑voice audio graph from schema modules + audioRouting.
// ============================================================================

export function buildVoiceGraph(context, preset) {
    const allNodes = [];
    const moduleNodes = new Map();

    // Voice bus (per‑voice output)
    const voiceBus = context.createGain();
    voiceBus.gain.value = 0; // envelope will drive this
    allNodes.push(voiceBus);

    const voiceModules = (preset.modules || []).filter(m => m.signal === "voice");

    // --------------------------------------------------------------------------
    // 1. Create per‑voice modules
    // --------------------------------------------------------------------------
    for (const mod of voiceModules) {
        const node = createVoiceModule(context, mod);
        if (!node) continue;

        moduleNodes.set(mod.id, node);
        allNodes.push(node);
    }

    // --------------------------------------------------------------------------
    // 2. Wire audioRouting (including special case for voiceBus)
    // --------------------------------------------------------------------------
    const edges = preset.audioRouting || [];

    for (const edge of edges) {
        let fromNode = moduleNodes.get(edge.from);
        let toNode = moduleNodes.get(edge.to);

        // Special case: allow routing to "voiceBus"
        if (!toNode && edge.to === "voiceBus") {
            toNode = voiceBus;
        }

        if (!fromNode || !toNode) continue;

        try {
            fromNode.connect(toNode);
        } catch (e) {
            console.warn("Voice routing failed:", edge, e);
        }
    }

    return {
        voiceBus,
        modules: moduleNodes,
        allNodes
    };
}

// ============================================================================
// FACTORY: CREATE PER‑VOICE MODULES
// ============================================================================
function createVoiceModule(context, mod) {
    const p = mod.parameters || {};

    switch (mod.type) {
        case "oscillator": {
            // Per‑oscillator gain node; actual OscillatorNode is created in Voice.js
            const g = context.createGain();
            g.gain.value = p.level ?? 1.0;
            return g;
        }

        case "filter": {
            const f = context.createBiquadFilter();
            f.type = p.filterType || "lowpass";
            f.frequency.value = p.cutoff ?? 1000;
            f.Q.value = p.resonance ?? 0;
            return f;
        }

        case "envelope": {
            // Envelope is applied in Voice.js to voiceBus.gain; no audio node needed
            const g = context.createGain();
            g.gain.value = 1.0;
            return g;
        }

        default:
            console.warn("Unknown voice module type:", mod.type);
            return context.createGain();
    }
}
