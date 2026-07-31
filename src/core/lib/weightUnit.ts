export type WeightUnit = 'kg' | 'lb';

export const KG_PER_LB = 0.45359237;

/*
 * Narrows a stored or server-provided unit. Everything else is a free-text
 * category label, which is never converted.
 */
export function isWeightUnit(value: unknown): value is WeightUnit {
    return value === 'kg' || value === 'lb';
}

/*
 * Converts a body weight value between kg and lb, quantized to 2 decimal
 * places like the server. Free-text units of custom measurement categories
 * are never converted, they are plain labels.
 */
export function convertWeight(value: number, from: WeightUnit, to: WeightUnit): number {
    if (from === to) {
        return value;
    }
    const converted = from === 'lb' ? value * KG_PER_LB : value / KG_PER_LB;

    return Math.round(converted * 100) / 100;
}

/*
 * Plausibility bounds for body weight entries in the given unit:
 * 30 - 300 kg, or the same range expressed in lb
 */
export function weightBounds(unit: WeightUnit): { min: number, max: number } {
    return unit === 'lb' ? { min: 66, max: 661 } : { min: 30, max: 300 };
}
