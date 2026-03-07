// src/engine/state/loadVersionedDefaults.js

export async function loadVersionedDefaults(version) {
  const url = `/src/engine/defaults/v${version}.json`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Missing defaults for engine version ${version}`);
  }

  return response.json();
}
