// src/audio/modulation/applyVoiceModMatrix.js

// ============================================================================
// applyVoiceModMatrix.js
// Schema‑driven per‑voice modulation matrix.
// Connects modulation sources (LFOs, envelopes) to AudioParams using
// dedicated GainNodes to ensure smooth, click‑free modulation.
// ============================================================================

/**
 * Apply per‑voice modulation routing.
 *
 * @param {AudioContext} context
 * @param {Object} preset - schema preset with modRouting[]
 * @param {Map<string, AudioNode|AudioParam>} modules - per‑voice module instances
 * @param {Object} graph - voice graph from buildVoiceGraph()
 * @param {number} time - note start time
 */
export function applyVoiceModMatrix(context, preset, modules, graph, time) {
    const routes = preset.modRouting || [];

    for (const route of routes) {
        const srcId = route.from;
        const dst = route.to;
        const amount = route.amount ?? 1.0;

        const srcNode = modules.get(srcId);
        if (!srcNode) continue;

        // Target format: "filter1.cutoff"
        const [targetId, paramName] = dst.split(".");
        const targetNode = modules.get(targetId);

        if (!targetNode) continue;

        const param = targetNode[paramName];
        if (!(param instanceof AudioParam)) continue;

        // ------------------------------------------------------------------------
        // Create a dedicated GainNode for modulation scaling
        // ------------------------------------------------------------------------
        const modGain = context.createGain();
        modGain.gain.setValueAtTime(amount, time);

        // Connect source → modGain → targetParam
        try {
            srcNode.connect(modGain);
            modGain.connect(param);
        } catch (e) {
            console.warn("Modulation routing failed:", route, e);
        }
    }
}
