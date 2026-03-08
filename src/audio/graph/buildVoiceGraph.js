// ============================================================================
// src/audio/graph/buildVoiceGraph.js
// Final version — enforced routing, envelope-safe, mono/poly correct.
// ============================================================================

export function buildVoiceGraph(context, preset) {
    const allNodes = [];
    const moduleNodes = new Map();

    // Final per‑voice output (post-envelope)
    const voiceBus = context.createGain();
    voiceBus.gain.value = 1.0;
    allNodes.push(voiceBus);

    // Envelope-controlled per‑voice mix
    const voiceMix = context.createGain();
    voiceMix.gain.value = 0; // ADSR drives THIS
    allNodes.push(voiceMix);

    // voiceMix → voiceBus (single, enforced path)
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
    // 2. Wire audioRouting with enforced rules
    // --------------------------------------------------------------------------
    const edges = preset.audioRouting || [];

    for (const edge of edges) {
        let fromNode = moduleNodes.get(edge.from);
        let toNode = moduleNodes.get(edge.to);

        // ================================================================
        // HARD INVARIANT #1:
        // NOTHING may connect directly to voiceBus.
        // ================================================================
        if (edge.to === "voiceBus") {
            console.warn(
                "%c[Graph] WARNING: Direct connection to voiceBus is forbidden. Routing to voiceMix instead.",
                "color:#f84",
                edge
            );
            toNode = voiceMix;
        }

        // ================================================================
        // HARD INVARIANT #2:
        // voiceBus may NEVER be used as a source.
        // ================================================================
        if (edge.from === "voiceBus") {
            console.warn(
                "%c[Graph] WARNING: voiceBus cannot be used as a source. Edge ignored.",
                "color:#f84",
                edge
            );
            continue;
        }

        // Validate nodes
        if (!fromNode || !toNode) {
            console.warn(
                "%c[Graph] WARNING: Invalid routing edge (missing node). Skipping.",
                "color:#fa0",
                edge
            );
            continue;
        }

        // Safe connect
        try {
            fromNode.connect(toNode);
        } catch (e) {
            console.warn("Voice routing failed:", edge, e);
        }
    }

    return {
        voiceBus,   // final per‑voice output
        voiceMix,   // envelope target
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
            // Envelope module itself is just a placeholder gain;
            // actual ADSR is applied to voiceMix.gain in Voice.js.
            const g = context.createGain();
            g.gain.value = 1.0;
            return g;
        }

        default:
            console.warn("Unknown voice module type:", mod.type);
            return context.createGain();
    }
}
