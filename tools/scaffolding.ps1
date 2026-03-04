# -------------------------------
# SoundLab Project Scaffolding
# -------------------------------

# Create root-level files
New-Item -ItemType File -Name "index.html" -Force
# New-Item -ItemType File -Name "README.md" -Force
# New-Item -ItemType File -Name "LICENSE" -Force
# New-Item -ItemType File -Name "NOTICE" -Force
# New-Item -ItemType File -Name ".gitignore" -Force

# Create root-level folders
New-Item -ItemType Directory -Name "src" -Force
# New-Item -ItemType Directory -Name "assets" -Force

# -------------------------------
# src/engine
# -------------------------------
New-Item -ItemType Directory -Path "src/engine" -Force
New-Item -ItemType File -Path "src/engine/engineState.js" -Force
New-Item -ItemType File -Path "src/engine/engineDefaults.js" -Force
New-Item -ItemType File -Path "src/engine/setters.js" -Force
New-Item -ItemType File -Path "src/engine/dsp.js" -Force
New-Item -ItemType File -Path "src/engine/utils.js" -Force

# -------------------------------
# src/presets
# -------------------------------
New-Item -ItemType Directory -Path "src/presets" -Force
New-Item -ItemType File -Path "src/presets/loadPreset.js" -Force
New-Item -ItemType File -Path "src/presets/savePreset.js" -Force
New-Item -ItemType File -Path "src/presets/applyPresetToEngine.js" -Force
New-Item -ItemType File -Path "src/presets/serializeEngineState.js" -Force
New-Item -ItemType File -Path "src/presets/presetSchema.js" -Force

# -------------------------------
# src/ui
# -------------------------------
New-Item -ItemType Directory -Path "src/ui" -Force
New-Item -ItemType File -Path "src/ui/dirty.js" -Force
New-Item -ItemType File -Path "src/ui/scheduleRender.js" -Force
New-Item -ItemType File -Path "src/ui/renderUIFromState.js" -Force

# src/ui/panels
New-Item -ItemType Directory -Path "src/ui/panels" -Force
$panels = @(
    "pitchEnvPanel.js",
    "oscPanel.js",
    "fmPanel.js",
    "vibratoPanel.js",
    "filterPanel.js",
    "fxPanel.js",
    "masterPanel.js"
)
foreach ($p in $panels) {
    New-Item -ItemType File -Path ("src/ui/panels/" + $p) -Force
}

# src/ui/bindings
New-Item -ItemType Directory -Path "src/ui/bindings" -Force
$bindings = @(
    "pitchEnvBindings.js",
    "oscBindings.js",
    "fmBindings.js",
    "vibratoBindings.js",
    "filterBindings.js",
    "fxBindings.js",
    "masterBindings.js"
)
foreach ($b in $bindings) {
    New-Item -ItemType File -Path ("src/ui/bindings/" + $b) -Force
}

# -------------------------------
# src/app
# -------------------------------
New-Item -ItemType Directory -Path "src/app" -Force
New-Item -ItemType File -Path "src/app/main.js" -Force
New-Item -ItemType File -Path "src/app/eventHandlers.js" -Force
New-Item -ItemType File -Path "src/app/initUI.js" -Force
New-Item -ItemType File -Path "src/app/initEngine.js" -Force

# -------------------------------
# src/styles
# -------------------------------
New-Item -ItemType Directory -Path "src/styles" -Force
New-Item -ItemType File -Path "src/styles/main.css" -Force
New-Item -ItemType File -Path "src/styles/panels.css" -Force
New-Item -ItemType File -Path "src/styles/controls.css" -Force

# -------------------------------
# assets
# -------------------------------
New-Item -ItemType Directory -Path "assets/icons" -Force
New-Item -ItemType Directory -Path "assets/waveforms" -Force
New-Item -ItemType Directory -Path "assets/presets" -Force

Write-Host "SoundLab scaffolding complete!"
