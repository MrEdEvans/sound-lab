// ============================================================================
// src/audio/graph/buildVoiceGraph.js
// Corrected version — prevents oscillators from driving voiceBus.gain
// ============================================================================

export function buildVoiceGraph(context, preset) {
    const allNodes = [];
    const moduleNodes = new Map();

    // Final per‑voice output
    const voiceBus = context.createGain();
    voiceBus.gain.value = 1.0;
    allNodes.push(voiceBus);

    // NEW: voiceMix — this is what the envelope should modulate
    const voiceMix = context.createGain();
    voiceMix.gain.value = 0; // envelope drives THIS, not voiceBus.gain
    allNodes.push(voiceMix);

    // voiceMix → voiceBus
    voiceMix.connect(voiceBus);

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
    // 2. Wire audioRouting safely
    // --------------------------------------------------------------------------
    const edges = preset.audioRouting || [];

    for (const edge of edges) {
        let fromNode = moduleNodes.get(edge.from);
        let toNode = moduleNodes.get(edge.to);

        // FIX: route "voiceBus" → voiceMix (NOT voiceBus)
        if (edge.to === "voiceBus") {
            toNode = voiceMix;
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
        voiceMix,   // expose this so Voice.js can envelope it
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
            // Per‑oscillator gain node
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
            // Envelope should modulate voiceMix.gain, not voiceBus.gain
            const g = context.createGain();
            g.gain.value = 1.0;
            return g;
        }

        default:
            console.warn("Unknown voice module type:", mod.type);
            return context.createGain();
    }
}
