# ---------------------------------------------
# SoundLab Source Tree Migration Script
# ---------------------------------------------
# Creates new directories
# Moves files to new structure
# Removes old directories if empty
# Generates a mapping report with relative import suggestions
# ---------------------------------------------

$ErrorActionPreference = "Stop"

Write-Host "Starting migration..." -ForegroundColor Cyan

# ---------------------------------------------
# Helper: Compute relative import path
# ---------------------------------------------
function Get-RelativeImportPath {
    param(
        [string]$FromFile,   # The file that will contain the import
        [string]$ToFile      # The file being imported
    )

    # Convert to absolute paths
    $fromAbs = Resolve-Path $FromFile
    $toAbs   = Resolve-Path $ToFile

    $fromDir = Split-Path -Path $fromAbs -Parent

    $fromUri = New-Object System.Uri ($fromDir + "/")
    $toUri   = New-Object System.Uri ($toAbs)

    $relativeUri = $fromUri.MakeRelativeUri($toUri)
    $relativePath = $relativeUri.ToString()

    # Convert URI separators to JS import separators
    return $relativePath -replace "/", "/"
}

# ---------------------------------------------
# 1. Create new directory structure
# ---------------------------------------------
$newDirs = @(
    "src/ui/components",
    "src/ui/layout",
    "src/ui/settings",
    "src/ui/settings/sections",
    "src/ui/synthPanels",
    "src/ui/bindings",
    "src/ui/core",
    "src/state",
    "src/utils"
)

foreach ($dir in $newDirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir | Out-Null
        Write-Host "Created directory: $dir"
    }
}

# ---------------------------------------------
# 2. Define file moves (old → new)
# ---------------------------------------------
$moves = @(
    # Layout
    @{ from="src/app/ui/FloatingSettingsPanel.js"; to="src/ui/layout/FloatingSettingsPanel.js" },
    @{ from="src/app/ui/ActionBar.js";             to="src/ui/layout/ActionBar.js" },
    @{ from="src/app/ui/index.js";                 to="src/ui/index.js" },

    # Settings components → global components
    @{ from="src/ui/settings/components/Slider.js";     to="src/ui/components/Slider.js" },
    @{ from="src/ui/settings/components/Toggle.js";     to="src/ui/components/Toggle.js" },
    @{ from="src/ui/settings/components/Dropdown.js";   to="src/ui/components/Dropdown.js" },
    @{ from="src/ui/settings/components/TextInput.js";  to="src/ui/components/TextInput.js" },
    @{ from="src/ui/settings/components/ColorPicker.js";to="src/ui/components/ColorPicker.js" },

    # Settings panel + API
    @{ from="src/ui/settings/SettingsPanel.js";         to="src/ui/settings/SettingsPanel.js" },
    @{ from="src/ui/settings/settingsPanelAPI.js";      to="src/ui/settings/settingsPanelAPI.js" },

    # Settings sections
    @{ from="src/ui/settings/sections/UISettingsSection.js";              to="src/ui/settings/sections/UISettingsSection.js" },
    @{ from="src/ui/settings/sections/EngineSettingsSection.js";          to="src/ui/settings/sections/EngineSettingsSection.js" },
    @{ from="src/ui/settings/sections/DiagnosticsSettingsSection.js";     to="src/ui/settings/sections/DiagnosticsSettingsSection.js" },
    @{ from="src/ui/settings/sections/MIDISettingsSection.js";            to="src/ui/settings/sections/MIDISettingsSection.js" },
    @{ from="src/ui/settings/sections/WaveVisualizationSettingsSection.js";to="src/ui/settings/sections/WaveVisualizationSettingsSection.js" },
    @{ from="src/ui/settings/sections/WorkflowSettingsSection.js";        to="src/ui/settings/sections/WorkflowSettingsSection.js" },

    # Synth panels
    @{ from="src/ui/panels/oscPanel.js";        to="src/ui/synthPanels/oscPanel.js" },
    @{ from="src/ui/panels/filterPanel.js";     to="src/ui/synthPanels/filterPanel.js" },
    @{ from="src/ui/panels/fmPanel.js";         to="src/ui/synthPanels/fmPanel.js" },
    @{ from="src/ui/panels/fxPanel.js";         to="src/ui/synthPanels/fxPanel.js" },
    @{ from="src/ui/panels/masterPanel.js";     to="src/ui/synthPanels/masterPanel.js" },
    @{ from="src/ui/panels/pitchEnvPanel.js";   to="src/ui/synthPanels/pitchEnvPanel.js" },
    @{ from="src/ui/panels/vibratoPanel.js";    to="src/ui/synthPanels/vibratoPanel.js" },

    # Bindings
    @{ from="src/ui/bindings/oscBindings.js";       to="src/ui/bindings/oscBindings.js" },
    @{ from="src/ui/bindings/filterBindings.js";    to="src/ui/bindings/filterBindings.js" },
    @{ from="src/ui/bindings/fmBindings.js";        to="src/ui/bindings/fmBindings.js" },
    @{ from="src/ui/bindings/fxBindings.js";        to="src/ui/bindings/fxBindings.js" },
    @{ from="src/ui/bindings/masterBindings.js";    to="src/ui/bindings/masterBindings.js" },
    @{ from="src/ui/bindings/pitchEnvBindings.js";  to="src/ui/bindings/pitchEnvBindings.js" },
    @{ from="src/ui/bindings/vibratoBindings.js";   to="src/ui/bindings/vibratoBindings.js" },

    # Core UI
    @{ from="src/ui/dirty.js";              to="src/ui/core/dirty.js" },
    @{ from="src/ui/renderUIFromState.js";  to="src/ui/core/renderUIFromState.js" },
    @{ from="src/ui/scheduleRender.js";     to="src/ui/core/scheduleRender.js" },

    # State
    @{ from="src/engine/settings/SettingsStore.js";     to="src/state/SettingsStore.js" },
    @{ from="src/engine/settings/defaultSettings.js";   to="src/state/defaultSettings.js" },
    @{ from="src/engine/settings/validateSettings.js";  to="src/state/validateSettings.js" }
)

# ---------------------------------------------
# 3. Perform moves + generate mapping report
# ---------------------------------------------
$report = @()

foreach ($m in $moves) {
    $from = $m.from
    $to   = $m.to

    if (Test-Path $from) {
        Move-Item -Path $from -Destination $to -Force
        Write-Host "Moved: $from → $to"

        # Compute relative import path AFTER the move
        $suggestedImport = Get-RelativeImportPath -FromFile $to -ToFile $to

        $report += [PSCustomObject]@{
            FileName            = Split-Path $to -Leaf
            OldPath             = $from
            NewPath             = $to
            SuggestedImportPath = $suggestedImport
        }
    }
    else {
        Write-Host "WARNING: File not found: $from" -ForegroundColor Yellow
    }
}

# ---------------------------------------------
# 4. Remove old directories if empty
# ---------------------------------------------
$oldDirs = @(
    "src/app/ui",
    "src/ui/panels",
    "src/ui/settings/components",
    "src/engine/settings"
)

foreach ($dir in $oldDirs) {
    if (Test-Path $dir) {
        if (-not (Get-ChildItem $dir -Recurse -ErrorAction SilentlyContinue)) {
            Remove-Item $dir -Recurse -Force
            Write-Host "Removed empty directory: $dir"
        }
        else {
            Write-Host "Directory not empty, not removed: $dir" -ForegroundColor Yellow
        }
    }
}

# ---------------------------------------------
# 5. Output mapping report
# ---------------------------------------------
$report | Format-Table -AutoSize
$report | Export-Csv -Path "migration-report.csv" -NoTypeInformation

Write-Host "Migration report written to migration-report.csv" -ForegroundColor Green
Write-Host "Migration complete!" -ForegroundColor Cyan
