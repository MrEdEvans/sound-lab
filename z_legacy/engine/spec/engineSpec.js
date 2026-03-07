import { oscSpec } from "./osc.js";
import { ampEnvSpec } from "./ampEnv.js";
import { pitchEnvSpec } from "./pitchEnv.js";
import { fmSpec } from "./fm.js";
import { vibratoSpec } from "./vibrato.js";
import { voiceFilterSpec } from "./voiceFilter.js";
import { globalFilterSpec } from "./globalFilter.js";
import { fxSpec } from "./fx.js";
import { routingSpec } from "./routing.js";
import { globalSpec } from "./global.js";

export const engineSpec = {
  osc: oscSpec,
  ampEnv: ampEnvSpec,
  pitchEnv: pitchEnvSpec,
  fm: fmSpec,
  vibrato: vibratoSpec,
  voiceFilter: voiceFilterSpec,
  globalFilter: globalFilterSpec,
  fx: fxSpec,
  routing: routingSpec,
  global: globalSpec
};
