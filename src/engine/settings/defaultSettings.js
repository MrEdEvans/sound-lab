export const defaultSettings = {
    ui: {
        theme: "dark",
        uiScale: 1.0,
        waveVisualization: {},
        panelVisibility: {}
    },

    settingsPanel: {
        backdrop: true,
        rememberPosition: true,
        rememberSize: true,
        defaultX: 100,
        defaultY: 100,
        width: 420,
        height: 520
    },

    workflow: {
        defaultPreset: "factory",
        autosave: true,
        recentPresets: []
    },

    engine: {
        oversampling: "off",
        polyphonyLimit: 16
    },

    midi: {
        preferredDevices: []
    },

    diagnostics: {
        diagnosticWindow: false,
        diagnosticVerbosity: 1,
        debugTrace: {
        enabled: false,
        level: 1,
        typeFilters: ["info", "warn", "error"]
        }
    }
};
