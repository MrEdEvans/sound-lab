// src/audio/fx/FXRegistry.js

import { DelayEffect } from "./DelayEffect.js";
import { ReverbEffect } from "./ReverbEffect.js";
import { DistortionEffect } from "./DistortionEffect.js";
import { ChorusEffect } from "./ChorusEffect.js";
import { CompressorEffect } from "./CompressorEffect.js";
import { EQEffect } from "./EQEffect.js";
import { StereoWidener } from "./StereoWidener.js";

export const FXRegistry = {
    delay: DelayEffect,
    reverb: ReverbEffect,
    distortion: DistortionEffect,
    chorus: ChorusEffect,
    compressor: CompressorEffect,
    eq: EQEffect,
    widener: StereoWidener
};
