// src/audio/engineState/loadVersionedEngineDefaults.js

export async function loadVersionedEngineDefaults(version = "1.0.0") {
    const url = `./defaults/v${version}.json`;
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`Engine defaults not found for version ${version}`);
    }
    return res.json();
}
