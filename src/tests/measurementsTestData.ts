import { MeasurementCategory } from "components/Measurements/models/Category";
import { MeasurementEntry } from "components/Measurements/models/Entry";

export const TEST_MEASUREMENT_ENTRIES_1 = [
    new MeasurementEntry(1, 1, new Date(2023, 1, 1, 8, 0), 10, "test note"),
    new MeasurementEntry(2, 1, new Date(2023, 1, 1, 18, 30), 12, "evening measurement"),
    new MeasurementEntry(3, 1, new Date(2023, 1, 2, 7, 45), 20, ""),
    new MeasurementEntry(4, 1, new Date(2023, 1, 3, 9, 15), 30, "important note"),
    new MeasurementEntry(5, 1, new Date(2023, 1, 4, 12, 0), 40, "this day was good"),
    new MeasurementEntry(6, 1, new Date(2023, 1, 5, 8, 0), 50, ""),
    new MeasurementEntry(7, 1, new Date(2023, 1, 6, 8, 0), 60, ""),
    new MeasurementEntry(8, 1, new Date(2023, 1, 7, 8, 0), 70, ""),
];

export const TEST_MEASUREMENT_ENTRIES_2 = [
    new MeasurementEntry(1, 2, new Date(2023, 3, 1, 7, 0), 11, ""),
    new MeasurementEntry(2, 2, new Date(2023, 3, 1, 19, 0), 13, ""),
    new MeasurementEntry(3, 2, new Date(2023, 3, 2, 8, 30), 22, ""),
    new MeasurementEntry(4, 2, new Date(2023, 3, 3, 9, 0), 33, ""),
    new MeasurementEntry(5, 2, new Date(2023, 3, 4, 10, 15), 44, ""),
    new MeasurementEntry(6, 2, new Date(2023, 3, 5, 7, 45), 55, ""),
    new MeasurementEntry(7, 2, new Date(2023, 3, 6, 8, 0), 66, ""),
    new MeasurementEntry(8, 2, new Date(2023, 3, 7, 8, 0), 77, ""),
];


export const TEST_MEASUREMENT_CATEGORY_1 = new MeasurementCategory(
    1,
    "Biceps",
    "cm",
    TEST_MEASUREMENT_ENTRIES_1,
);


export const TEST_MEASUREMENT_CATEGORY_2 = new MeasurementCategory(
    2,
    "Body fat",
    "%",
    TEST_MEASUREMENT_ENTRIES_2
);