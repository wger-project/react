import { MeasurementEntry } from "@/components/Measurements";
import { isWeightUnit, WeightUnit } from "@/core/lib/weightUnit";

/**
 * Body weight is stored as a measurement in the user's official body weight
 * category, so an entry is a plain MeasurementEntry. These two helpers hold
 * what is specific to it: its value is in one of the two units the app knows,
 * and that unit travels in extra_data.
 */

/** The unit an entry's value is stored in, narrowed to what we can convert */
export const weightUnitOf = (entry: MeasurementEntry, categoryUnit: string): WeightUnit => {
    const stored = entry.unitOrFallback(categoryUnit);

    return isWeightUnit(stored) ? stored : 'kg';
};

/**
 * The entry's extra_data with the unit its value is in.
 *
 * The server replaces extra_data as a whole on update, so the keys we do not
 * know about have to be sent back along with it.
 */
export const extraDataInUnit = (
    entry: MeasurementEntry,
    unit: WeightUnit,
): Record<string, unknown> => ({ ...entry.extraData, unit: unit });
