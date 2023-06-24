import { MeasurementCategory } from "components/Measurements/models/Category";
import { MeasurementEntry } from "components/Measurements/models/Entry";

export const TEST_MEASUREMENT_ENTRIES_1 = [
    new MeasurementEntry(1, 1, new Date(2023, 1, 1), 10, "test note"),
    new MeasurementEntry(2, 1, new Date(2023, 1, 2), 20, ""),
    new MeasurementEntry(3, 1, new Date(2023, 1, 3), 30, "important note"),
    new MeasurementEntry(4, 1, new Date(2023, 1, 4), 40, "this day was good"),
    new MeasurementEntry(5, 1, new Date(2023, 1, 5), 50, ""),
    new MeasurementEntry(6, 1, new Date(2023, 1, 6), 60, ""),
    new MeasurementEntry(7, 1, new Date(2023, 1, 7), 70, ""),
    new MeasurementEntry(8, 1, new Date(2023, 1, 8), 80, ""),
];

export const TEST_MEASUREMENT_ENTRIES_2 = [
    new MeasurementEntry(1, 2, new Date(2023, 3, 1), 11, ""),
    new MeasurementEntry(2, 2, new Date(2023, 3, 2), 22, ""),
    new MeasurementEntry(3, 2, new Date(2023, 3, 3), 33, ""),
    new MeasurementEntry(4, 2, new Date(2023, 3, 4), 44, ""),
    new MeasurementEntry(5, 2, new Date(2023, 3, 5), 55, ""),
    new MeasurementEntry(6, 2, new Date(2023, 3, 6), 66, ""),
    new MeasurementEntry(7, 2, new Date(2023, 3, 7), 77, ""),
    new MeasurementEntry(8, 2, new Date(2023, 3, 8), 88, ""),
];


export const TEST_MEASUREMENT_CATEGORY_1 = new MeasurementCategory(1, "Biceps", "cm", TEST_MEASUREMENT_ENTRIES_1,);


export const TEST_MEASUREMENT_CATEGORY_2 = new MeasurementCategory(2, "Body fat", "%", TEST_MEASUREMENT_ENTRIES_2);