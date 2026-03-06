// src/presets/validatePreset.js

import { presetSchema } from "../presetSchema.js";

export function validatePreset(preset) {
    const errors = [];
    const validated = {};

    for (const key in presetSchema) {
        const rule = presetSchema[key];
        const value = preset[key];

        if (rule.required && value === undefined) {
            errors.push(`Missing required field: ${key}`);
            continue;
        }

        if (value === undefined) {
            validated[key] = rule.default !== undefined ? rule.default : value;
            continue;
        }

        const result = validateField(key, value, rule);
        validated[key] = result.value;
        errors.push(...result.errors);
    }

    return {
        valid: errors.length === 0,
        errors,
        preset: validated
    };
}

function validateField(name, value, rule) {
    const errors = [];

    if (rule.type === "number") {
        if (typeof value !== "number") errors.push(`${name} must be a number`);
        if (rule.min !== undefined && value < rule.min) errors.push(`${name} < min ${rule.min}`);
        if (rule.max !== undefined && value > rule.max) errors.push(`${name} > max ${rule.max}`);
        return { value, errors };
    }

    if (rule.type === "string") {
        if (typeof value !== "string") errors.push(`${name} must be a string`);
        return { value, errors };
    }

    if (rule.type === "boolean") {
        if (typeof value !== "boolean") errors.push(`${name} must be a boolean`);
        return { value, errors };
    }

    if (rule.type === "array") {
        if (!Array.isArray(value)) {
            errors.push(`${name} must be an array`);
            return { value, errors };
        }

        if (rule.items) {
            value = value.map((item, i) => {
                const result = validateField(`${name}[${i}]`, item, rule.items);
                errors.push(...result.errors);
                return result.value;
            });
        }

        return { value, errors };
    }

    if (rule.type === "object") {
        if (typeof value !== "object") {
            errors.push(`${name} must be an object`);
            return { value, errors };
        }

        if (rule.fields) {
            const validated = {};
            for (const field in rule.fields) {
                const fieldRule = rule.fields[field];
                const fieldValue = value[field];

                if (fieldRule.required && fieldValue === undefined) {
                    errors.push(`Missing required field: ${name}.${field}`);
                    continue;
                }

                if (fieldValue === undefined) {
                    validated[field] = fieldRule.default !== undefined ? fieldRule.default : fieldValue;
                    continue;
                }

                const result = validateField(`${name}.${field}`, fieldValue, fieldRule);
                validated[field] = result.value;
                errors.push(...result.errors);
            }
            return { value: validated, errors };
        }

        return { value, errors };
    }

    return { value, errors };
}
