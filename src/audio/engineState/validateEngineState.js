// src/audio/engineState/validateEngineState.js

import { engineSpec } from "./engineSpec.js";

export function validateEngineState(engineState) {
    const errors = [];

    if (!engineState || typeof engineState !== "object") {
        return ["Engine state must be an object."];
    }

    const { engine, modules, audioRouting, modRouting } = engineState;

    // engine
    if (!engine || typeof engine !== "object") {
        errors.push("Missing or invalid 'engine' object.");
    } else {
        for (const [key, spec] of Object.entries(engineSpec.engine)) {
            const value = engine[key];
            if (value === undefined) {
                errors.push(`engine.${key} is required.`);
                continue;
            }
            if (spec.type === "number" && typeof value !== "number") {
                errors.push(`engine.${key} must be a number.`);
            }
            if (spec.type === "boolean" && typeof value !== "boolean") {
                errors.push(`engine.${key} must be a boolean.`);
            }
            if (spec.type === "array" && !Array.isArray(value)) {
                errors.push(`engine.${key} must be an array.`);
            }
            if (typeof value === "number") {
                if (spec.min !== undefined && value < spec.min) {
                    errors.push(`engine.${key} must be >= ${spec.min}.`);
                }
                if (spec.max !== undefined && value > spec.max) {
                    errors.push(`engine.${key} must be <= ${spec.max}.`);
                }
            }
        }
    }

    // modules
    if (!Array.isArray(modules)) {
        errors.push("'modules' must be an array.");
    } else {
        modules.forEach((mod, i) => {
            if (!mod || typeof mod !== "object") {
                errors.push(`modules[${i}] must be an object.`);
                return;
            }
            const { id, type, signal, parameters } = mod;

            if (typeof id !== "string") {
                errors.push(`modules[${i}].id must be a string.`);
            }
            if (typeof type !== "string") {
                errors.push(`modules[${i}].type must be a string.`);
                return;
            }

            const typeSpec = engineSpec.moduleTypes[type];
            if (!typeSpec) {
                errors.push(`modules[${i}].type '${type}' is not supported.`);
                return;
            }

            if (signal !== typeSpec.signal) {
                errors.push(
                    `modules[${i}].signal must be '${typeSpec.signal}' for type '${type}'.`
                );
            }

            if (!parameters || typeof parameters !== "object") {
                errors.push(`modules[${i}].parameters must be an object.`);
                return;
            }

            for (const [paramName, paramSpec] of Object.entries(typeSpec.params)) {
                const value = parameters[paramName];
                if (value === undefined) {
                    errors.push(
                        `modules[${i}].parameters.${paramName} is required for type '${type}'.`
                    );
                    continue;
                }
                if (paramSpec.type === "number" && typeof value !== "number") {
                    errors.push(
                        `modules[${i}].parameters.${paramName} must be a number.`
                    );
                }
                if (paramSpec.type === "string" && typeof value !== "string") {
                    errors.push(
                        `modules[${i}].parameters.${paramName} must be a string.`
                    );
                }
                if (paramSpec.type === "boolean" && typeof value !== "boolean") {
                    errors.push(
                        `modules[${i}].parameters.${paramName} must be a boolean.`
                    );
                }
                if (typeof value === "number") {
                    if (paramSpec.min !== undefined && value < paramSpec.min) {
                        errors.push(
                            `modules[${i}].parameters.${paramName} must be >= ${paramSpec.min}.`
                        );
                    }
                    if (paramSpec.max !== undefined && value > paramSpec.max) {
                        errors.push(
                            `modules[${i}].parameters.${paramName} must be <= ${paramSpec.max}.`
                        );
                    }
                }
                if (paramSpec.enum && !paramSpec.enum.includes(value)) {
                    errors.push(
                        `modules[${i}].parameters.${paramName} must be one of ${paramSpec.enum.join(
                            ", "
                        )}.`
                    );
                }
            }
        });
    }

    // audioRouting
    if (!Array.isArray(audioRouting)) {
        errors.push("'audioRouting' must be an array.");
    } else {
        audioRouting.forEach((edge, i) => {
            if (!edge || typeof edge !== "object") {
                errors.push(`audioRouting[${i}] must be an object.`);
                return;
            }
            if (typeof edge.from !== "string") {
                errors.push(`audioRouting[${i}].from must be a string.`);
            }
            if (typeof edge.to !== "string") {
                errors.push(`audioRouting[${i}].to must be a string.`);
            }
        });
    }

    // modRouting
    if (!Array.isArray(modRouting)) {
        errors.push("'modRouting' must be an array.");
    } else {
        modRouting.forEach((edge, i) => {
            if (!edge || typeof edge !== "object") {
                errors.push(`modRouting[${i}] must be an object.`);
                return;
            }
            if (typeof edge.from !== "string") {
                errors.push(`modRouting[${i}].from must be a string.`);
            }
            if (typeof edge.to !== "string") {
                errors.push(`modRouting[${i}].to must be a string.`);
            }
            if (typeof edge.amount !== "number") {
                errors.push(`modRouting[${i}].amount must be a number.`);
            } else if (edge.amount < -1 || edge.amount > 1) {
                errors.push(`modRouting[${i}].amount must be between -1 and 1.`);
            }
        });
    }

    return errors;
}
