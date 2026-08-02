import { MeasurementEntry } from "@/components/Measurements";
import { isWeightUnit, WeightUnit } from "@/core/lib/weightUnit";

/**
 * Body weight is stored as a measurement in the user's official body weight
 * category, so an entry is a plain MeasurementEntry. What is specific to it is
 * that its value is in one of the two units the app can convert between.
 */

/** The unit an entry's value is stored in, narrowed to what we can convert */
export const weightUnitOf = (entry: MeasurementEntry, categoryUnit: string): WeightUnit => {
    const stored = entry.unitOrFallback(categoryUnit);

    return isWeightUnit(stored) ? stored : 'kg';
};
