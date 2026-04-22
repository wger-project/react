import { MeasurementCategory } from "components/Measurements/models/Category";
import { MeasurementEntry } from "components/Measurements/models/Entry";

// Recognisable test-marker UUIDs matching the Django fixtures convention
const CATEGORY_1 = 'cccccccc-cccc-cccc-cccc-000000000001';
const CATEGORY_2 = 'cccccccc-cccc-cccc-cccc-000000000002';
const entry = (n: number) => `dddddddd-dddd-dddd-dddd-${n.toString().padStart(12, '0')}`;

export const TEST_MEASUREMENT_ENTRIES_1 = [
    new MeasurementEntry(entry(1), CATEGORY_1, new Date(2023, 1, 1, 8, 0), 10, "test note"),
    new MeasurementEntry(entry(2), CATEGORY_1, new Date(2023, 1, 1, 18, 30), 12, "evening measurement"),
    new MeasurementEntry(entry(3), CATEGORY_1, new Date(2023, 1, 2, 7, 45), 20, ""),
    new MeasurementEntry(entry(4), CATEGORY_1, new Date(2023, 1, 3, 9, 15), 30, "important note"),
    new MeasurementEntry(entry(5), CATEGORY_1, new Date(2023, 1, 4, 12, 0), 40, "this day was good"),
    new MeasurementEntry(entry(6), CATEGORY_1, new Date(2023, 1, 5, 8, 0), 50, ""),
    new MeasurementEntry(entry(7), CATEGORY_1, new Date(2023, 1, 6, 8, 0), 60, ""),
    new MeasurementEntry(entry(8), CATEGORY_1, new Date(2023, 1, 7, 8, 0), 70, ""),
];

export const TEST_MEASUREMENT_ENTRIES_2 = [
    new MeasurementEntry(entry(101), CATEGORY_2, new Date(2023, 3, 1, 7, 0), 11, ""),
    new MeasurementEntry(entry(102), CATEGORY_2, new Date(2023, 3, 1, 19, 0), 13, ""),
    new MeasurementEntry(entry(103), CATEGORY_2, new Date(2023, 3, 2, 8, 30), 22, ""),
    new MeasurementEntry(entry(104), CATEGORY_2, new Date(2023, 3, 3, 9, 0), 33, ""),
    new MeasurementEntry(entry(105), CATEGORY_2, new Date(2023, 3, 4, 10, 15), 44, ""),
    new MeasurementEntry(entry(106), CATEGORY_2, new Date(2023, 3, 5, 7, 45), 55, ""),
    new MeasurementEntry(entry(107), CATEGORY_2, new Date(2023, 3, 6, 8, 0), 66, ""),
    new MeasurementEntry(entry(108), CATEGORY_2, new Date(2023, 3, 7, 8, 0), 77, ""),
];


export const TEST_MEASUREMENT_CATEGORY_1 = new MeasurementCategory(
    CATEGORY_1,
    "Biceps",
    "cm",
    TEST_MEASUREMENT_ENTRIES_1,
);


export const TEST_MEASUREMENT_CATEGORY_2 = new MeasurementCategory(
    CATEGORY_2,
    "Body fat",
    "%",
    TEST_MEASUREMENT_ENTRIES_2
);
