// src/engine/settings/validateSettings.js

export function validateSettings(settings) {
  const errors = [];

  if (typeof settings !== "object" || settings === null) {
    return ["Settings must be an object."];
  }

  // --- UI ---
  if (!isObject(settings.ui)) {
    errors.push("ui must be an object.");
  } else {
    validateUI(settings.ui, errors);
  }

  // --- Workflow ---
  if (!isObject(settings.workflow)) {
    errors.push("workflow must be an object.");
  } else {
    validateWorkflow(settings.workflow, errors);
  }

  // --- Engine ---
  if (!isObject(settings.engine)) {
    errors.push("engine must be an object.");
  } else {
    validateEngine(settings.engine, errors);
  }

  // --- MIDI ---
  if (!isObject(settings.midi)) {
    errors.push("midi must be an object.");
  } else {
    validateMIDI(settings.midi, errors);
  }

  // --- Diagnostics ---
  if (!isObject(settings.diagnostics)) {
    errors.push("diagnostics must be an object.");
  } else {
    validateDiagnostics(settings.diagnostics, errors);
  }

  return errors;
}

/* ---------------------------------------------
   UI VALIDATION
--------------------------------------------- */

function validateUI(ui, errors) {
  const allowedThemes = ["light", "dark", "system"];

  if (!allowedThemes.includes(ui.theme)) {
    errors.push(`ui.theme must be one of: ${allowedThemes.join(", ")}`);
  }

  if (typeof ui.uiScale !== "number") {
    errors.push("ui.uiScale must be a number.");
  }

  if (!isObject(ui.waveVisualization)) {
    errors.push("ui.waveVisualization must be an object.");
  } else {
    validateWaveVisualization(ui.waveVisualization, errors);
  }

  if (!isObject(ui.panelVisibility)) {
    errors.push("ui.panelVisibility must be an object.");
  }

  if (!isObject(ui.settingsPanel)) {
      errors.push("ui.settingsPanel must be an object.");
  } else {
    validateSettingsPanel(ui.settingsPanel, errors);
  }

}


function validateSettingsPanel(sp, errors) {
  if (typeof sp.backdrop !== "boolean") {
    errors.push("ui.settingsPanel.backdrop must be a boolean.");
  }

  if (typeof sp.rememberPosition !== "boolean") {
    errors.push("ui.settingsPanel.rememberPosition must be a boolean.");
  }

  if (typeof sp.rememberSize !== "boolean") {
    errors.push("ui.settingsPanel.rememberSize must be a boolean.");
  }

  if (typeof sp.defaultX !== "number" || sp.defaultX < 0) {
    errors.push("ui.settingsPanel.defaultX must be a non-negative number.");
  }

  if (typeof sp.defaultY !== "number" || sp.defaultY < 0) {
    errors.push("ui.settingsPanel.defaultY must be a non-negative number.");
  }

  if (typeof sp.width !== "number" || sp.width < 200) {
    errors.push("ui.settingsPanel.width must be a number >= 200.");
  }

  if (typeof sp.height !== "number" || sp.height < 200) {
    errors.push("ui.settingsPanel.height must be a number >= 200.");
  }
}




function validateWaveVisualization(wv, errors) {
  const allowedStyles = ["default", "minimal", "bars", "line"];

  if (!allowedStyles.includes(wv.style)) {
    errors.push(`ui.waveVisualization.style must be one of: ${allowedStyles.join(", ")}`);
  }

  if (typeof wv.smoothing !== "number" || wv.smoothing < 0 || wv.smoothing > 1) {
    errors.push("ui.waveVisualization.smoothing must be a number between 0 and 1.");
  }

  if (typeof wv.color !== "string") {
    errors.push("ui.waveVisualization.color must be a string.");
  }
}

/* ---------------------------------------------
   WORKFLOW VALIDATION
--------------------------------------------- */

function validateWorkflow(workflow, errors) {
  if (typeof workflow.defaultPreset !== "string") {
    errors.push("workflow.defaultPreset must be a string.");
  }

  if (typeof workflow.autosave !== "boolean") {
    errors.push("workflow.autosave must be a boolean.");
  }

  if (!Array.isArray(workflow.recentPresets)) {
    errors.push("workflow.recentPresets must be an array.");
  } else {
    for (const id of workflow.recentPresets) {
      if (typeof id !== "string") {
        errors.push("workflow.recentPresets must contain only strings.");
        break;
      }
    }
  }
}

/* ---------------------------------------------
   ENGINE VALIDATION
--------------------------------------------- */

function validateEngine(engine, errors) {
  const allowedOversampling = ["off", "2x", "4x"];

  if (!allowedOversampling.includes(engine.oversampling)) {
    errors.push(`engine.oversampling must be one of: ${allowedOversampling.join(", ")}`);
  }

  if (typeof engine.polyphonyLimit !== "number" || engine.polyphonyLimit <= 0) {
    errors.push("engine.polyphonyLimit must be a positive number.");
  }
}

/* ---------------------------------------------
   MIDI VALIDATION
--------------------------------------------- */

function validateMIDI(midi, errors) {
  if (!Array.isArray(midi.preferredDevices)) {
    errors.push("midi.preferredDevices must be an array.");
  } else {
    for (const dev of midi.preferredDevices) {
      if (typeof dev !== "string") {
        errors.push("midi.preferredDevices must contain only strings.");
        break;
      }
    }
  }
}

/* ---------------------------------------------
   DIAGNOSTICS VALIDATION
--------------------------------------------- */

function validateDiagnostics(diag, errors) {
  if (typeof diag.diagnosticWindow !== "boolean") {
    errors.push("diagnostics.diagnosticWindow must be a boolean.");
  }

  if (typeof diag.diagnosticVerbosity !== "number" || diag.diagnosticVerbosity < 1 || diag.diagnosticVerbosity > 5) {
    errors.push("diagnostics.diagnosticVerbosity must be a number between 1 and 5.");
  }

  if (!isObject(diag.debugTrace)) {
    errors.push("diagnostics.debugTrace must be an object.");
  } else {
    validateDebugTrace(diag.debugTrace, errors);
  }
}

function validateDebugTrace(dt, errors) {
  if (typeof dt.enabled !== "boolean") {
    errors.push("diagnostics.debugTrace.enabled must be a boolean.");
  }

  if (typeof dt.level !== "number" || dt.level < 1 || dt.level > 5) {
    errors.push("diagnostics.debugTrace.level must be a number between 1 and 5.");
  }

  if (!Array.isArray(dt.typeFilters)) {
    errors.push("diagnostics.debugTrace.typeFilters must be an array.");
  } else {
    const allowed = ["info", "warn", "error", "critical"];
    for (const t of dt.typeFilters) {
      if (!allowed.includes(t)) {
        errors.push(`diagnostics.debugTrace.typeFilters contains invalid type: ${t}`);
      }
    }
  }
}

/* ---------------------------------------------
   HELPERS
--------------------------------------------- */

function isObject(v) {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}
