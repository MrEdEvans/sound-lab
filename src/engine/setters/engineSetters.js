// src/engine/setters/index.js
import { setParam } from "./setParam.js";
import { oscSetters } from "./moduleSetters.js";
// import others…

export const setters = {
  set: setParam,
  osc: oscSetters
  // fm: fmSetters,
  // vibrato: vibratoSetters,
  // etc.
};
