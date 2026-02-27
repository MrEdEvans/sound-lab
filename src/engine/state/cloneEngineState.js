/**
 * Creates a fresh, mutable working engine state from the frozen default template.
 * Uses structuredClone to ensure a deep copy.
 */
// export function cloneEngineState(defaultState) {
//   return structuredClone(defaultState);
// }


export function cloneEngineState(defaultState) {
  try {
    return structuredClone(defaultState);
  } catch (e) {
    console.error("Clone failed for:", defaultState);
    throw e;
  }
}
