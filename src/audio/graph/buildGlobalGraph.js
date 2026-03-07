// ============================================================================
// src/audio/graph/buildGlobalGraph.js
// Schema‑driven global FX graph builder.
// Builds the post‑voice global processing chain (delay, reverb, EQ, limiter, etc.).
// This is the global counterpart to buildVoiceGraph.js.
// ============================================================================

/**
 * Build the global FX graph from schema-defined modules.
 *
 * @param {AudioContext} context
 * @param {Object} preset - schema preset with modules[] and audioRouting[]
 * @param {AudioNode} voiceMixNode - summed output of all voices
 * @returns {{ output: AudioNode, modules: Map<string, AudioNode>, allNodes: AudioNode[] }}
 */
export function buildGlobalGraph(context, preset, voiceMixNode) {
    const allNodes = [];
    const moduleNodes = new Map();

    // --------------------------------------------------------------------------
    // 1. Create global modules
    // --------------------------------------------------------------------------
    const globalModules = (preset.modules || []).filter(m => m.signal === "global");

    for (const mod of globalModules) {
        const node = createGlobalModule(context, mod);
        if (node) {
            moduleNodes.set(mod.id, node);
            allNodes.push(node);
        }
    }

    // --------------------------------------------------------------------------
    // 2. Connect voice mix → first global module (if any)
    // --------------------------------------------------------------------------
    const firstGlobal = findFirstGlobalModule(preset, moduleNodes);

    if (firstGlobal) {
        voiceMixNode.connect(firstGlobal);
    }

    // --------------------------------------------------------------------------
    // 3. Connect global → global routing edges
    // --------------------------------------------------------------------------
    const edges = preset.audioRouting || [];

    for (const edge of edges) {
        const fromNode = moduleNodes.get(edge.from);
        const toNode = moduleNodes.get(edge.to);

        if (!fromNode || !toNode) continue;

        try {
            fromNode.connect(toNode);
        } catch (e) {
            console.warn("Global routing failed:", edge, e);
        }
    }

    // --------------------------------------------------------------------------
    // 4. Determine final output node
    // --------------------------------------------------------------------------
    const outputNode = findLastGlobalModule(preset, moduleNodes) || voiceMixNode;

    return {
        output: outputNode,
        modules: moduleNodes,
        allNodes
    };
}

// ============================================================================
// FACTORY: CREATE GLOBAL MODULES
// ============================================================================
function createGlobalModule(context, mod) {
    const p = mod.parameters || {};

    switch (mod.type) {
        case "gain": {
            const g = context.createGain();
            g.gain.value = p.gain ?? 1.0;
            return g;
        }

        case "filter": {
            const f = context.createBiquadFilter();
            f.type = p.filterType || "lowpass";
            f.frequency.value = p.cutoff ?? 1000;
            f.Q.value = p.resonance ?? 0;
            return f;
        }

        case "delay": {
            const d = context.createDelay();
            d.delayTime.value = p.time ?? 0.3;
            return d;
        }

        case "reverb": {
            // Placeholder: real reverb uses a ConvolverNode with an IR
            const r = context.createConvolver();
            return r;
        }

        case "distortion": {
            const ws = context.createWaveShaper();
            ws.curve = makeDistortionCurve(p.amount ?? 0);
            return ws;
        }

        case "compressor": {
            const c = context.createDynamicsCompressor();
            c.threshold.value = p.threshold ?? -24;
            c.ratio.value = p.ratio ?? 4;
            return c;
        }

        case "limiter": {
            const l = context.createDynamicsCompressor();
            l.threshold.value = -1;
            l.ratio.value = 20;
            return l;
        }

        default:
            console.warn("Unknown global module type:", mod.type);
            return context.createGain();
    }
}

// ============================================================================
// HELPERS
// ============================================================================
function makeDistortionCurve(amount) {
    const n = 1024;
    const curve = new Float32Array(n);
    const k = amount * 100;

    for (let i = 0; i < n; i++) {
        const x = (i * 2) / n - 1;
        curve[i] = ((1 + k) * x) / (1 + k * Math.abs(x));
    }
    return curve;
}

function findFirstGlobalModule(preset, moduleNodes) {
    const edges = preset.audioRouting || [];
    const incoming = new Set(edges.map(e => e.to));

    for (const mod of preset.modules || []) {
        if (mod.signal === "global" && !incoming.has(mod.id)) {
            return moduleNodes.get(mod.id);
        }
    }
    return null;
}

function findLastGlobalModule(preset, moduleNodes) {
    const edges = preset.audioRouting || [];
    const outgoing = new Set(edges.map(e => e.from));

    for (const mod of preset.modules || []) {
        if (mod.signal === "global" && !outgoing.has(mod.id)) {
            return moduleNodes.get(mod.id);
        }
    }
    return null;
}
