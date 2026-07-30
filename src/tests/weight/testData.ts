import { MeasurementCategory, METRIC_TYPE_BODY_WEIGHT } from "@/components/Measurements";
import { WeightEntry } from "@/components/Weight/models/WeightEntry";

export const TEST_BODY_WEIGHT_CATEGORY_UUID = 'cccccccc-cccc-cccc-cccc-000000000042';

export const testBodyWeightCategory = new MeasurementCategory(
    TEST_BODY_WEIGHT_CATEGORY_UUID,
    'Body weight',
    'kg',
    undefined,
    METRIC_TYPE_BODY_WEIGHT,
    true,
);

export const testWeightEntry1 = new WeightEntry(new Date('2023-11-01'), 100, 'dddddddd-dddd-dddd-dddd-000000000001');
export const testWeightEntry2 = new WeightEntry(new Date('2023-10-01'), 90, 'dddddddd-dddd-dddd-dddd-000000000002');
export const testWeightEntry3 = new WeightEntry(new Date('2023-09-01'), 110, 'dddddddd-dddd-dddd-dddd-000000000003');

export const testWeightEntries = [testWeightEntry1, testWeightEntry2, testWeightEntry3];
