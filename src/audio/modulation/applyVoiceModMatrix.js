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

    console.log(
        `%c[ModMatrix] applying ${routes.length} routes`,
        "color:#f0f"
    );

    for (const route of routes) {
        const srcId = route.from;
        const dst = route.to;
        const amount = route.amount ?? 1.0;

        console.log(
            `%c[ModMatrix] Route: from='${srcId}' → to='${dst}' amount=${amount}`,
            "color:#f0f"
        );

        const srcNode = modules.get(srcId);
        if (!srcNode) {
            console.warn(
                `%c[ModMatrix] Source '${srcId}' not found in modules`,
                "color:#f88"
            );
            continue;
        }

        // Target format: "filter1.cutoff"
        const [targetId, paramName] = dst.split(".");
        const targetNode = modules.get(targetId);

        if (!targetNode) {
            console.warn(
                `%c[ModMatrix] Target node '${targetId}' not found`,
                "color:#f88"
            );
            continue;
        }

        const param = targetNode[paramName];
        if (!(param instanceof AudioParam)) {
            console.warn(
                `%c[ModMatrix] Target param '${paramName}' on '${targetId}' is not an AudioParam`,
                "color:#f88"
            );
            continue;
        }

        console.log(
            `%c[ModMatrix] Connecting src='${srcId}' → ${targetId}.${paramName} (AudioParam)`,
            "color:#f0f"
        );

        // ------------------------------------------------------------------------
        // Create a dedicated GainNode for modulation scaling
        // ------------------------------------------------------------------------
        const modGain = context.createGain();
        modGain.gain.setValueAtTime(amount, time);

        console.log(
            `%c[ModMatrix] modGain.gain set to ${amount}`,
            "color:#f0f"
        );

        // Connect source → modGain → targetParam
        try {
            srcNode.connect(modGain);
            modGain.connect(param);

            console.log(
                `%c[ModMatrix] Connected '${srcId}' → modGain → ${targetId}.${paramName}`,
                "color:#0f0"
            );
        } catch (e) {
            console.warn("Modulation routing failed:", route, e);
        }

        // ------------------------------------------------------------------------
        // Diagnostic: log the current value of the target param
        // ------------------------------------------------------------------------
        console.log(
            `%c[ModMatrix] After connect: ${targetId}.${paramName}.value = ${param.value}`,
            "color:#0ff"
        );
    }
}
