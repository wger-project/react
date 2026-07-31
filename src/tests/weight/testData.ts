import { MeasurementCategory, MeasurementEntry, METRIC_TYPE_BODY_WEIGHT } from "@/components/Measurements";
import { WeightUnit } from "@/core/lib/weightUnit";

export const TEST_BODY_WEIGHT_CATEGORY_UUID = 'cccccccc-cccc-cccc-cccc-000000000042';

export const testBodyWeightCategory = new MeasurementCategory(
    TEST_BODY_WEIGHT_CATEGORY_UUID,
    'Body weight',
    'kg',
    undefined,
    METRIC_TYPE_BODY_WEIGHT,
    true,
);

/**
 * A body weight entry as the API delivers it. The unit an entry is stored in
 * travels in extra_data; without it the category unit applies.
 */
export const makeWeightEntry = (
    date: Date,
    value: number,
    options: { id?: string, unit?: WeightUnit, source?: string, extraData?: Record<string, unknown> } = {},
) => new MeasurementEntry(
    options.id ?? null,
    TEST_BODY_WEIGHT_CATEGORY_UUID,
    date,
    value,
    '',
    options.source ?? 'user',
    { ...options.extraData, ...(options.unit ? { unit: options.unit } : {}) },
);

const weightEntry = (id: string, date: string, value: number) =>
    makeWeightEntry(new Date(date), value, { id: id });

export const testWeightEntry1 = weightEntry('dddddddd-dddd-dddd-dddd-000000000001', '2023-11-01', 100);
export const testWeightEntry2 = weightEntry('dddddddd-dddd-dddd-dddd-000000000002', '2023-10-01', 90);
export const testWeightEntry3 = weightEntry('dddddddd-dddd-dddd-dddd-000000000003', '2023-09-01', 110);

export const testWeightEntries = [testWeightEntry1, testWeightEntry2, testWeightEntry3];
