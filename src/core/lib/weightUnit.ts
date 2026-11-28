export type WeightUnit = 'kg' | 'lb';

// Mirror the server's constants (wger/utils/units.py), both of them: a
// division by the other factor is a hair off and could round differently
export const KG_PER_LB = 0.45359237;
export const LB_PER_KG = 2.20462262;

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
    const converted = from === 'lb' ? value * KG_PER_LB : value * LB_PER_KG;

    return Math.round(converted * 100) / 100;
}

/*
 * Reads a stored value in the target unit: the unit it was entered in wins,
 * the category unit fills in, and anything that is not a weight is a plain
 * label and passes through.
 *
 * The one place that decides what a stored number means. A category can hold
 * mixed units, so the raw value on its own is meaningless.
 */
export function convertStoredValue(
    value: number,
    storedUnit: string | null | undefined,
    categoryUnit: string,
    targetUnit: string,
): number {
    const from = storedUnit || categoryUnit;

    return isWeightUnit(from) && isWeightUnit(targetUnit)
        ? convertWeight(value, from, targetUnit)
        : value;
}
