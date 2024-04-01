import axios from "axios";
import { MeasurementCategory } from "components/Measurements/models/Category";
import { MeasurementEntry } from "components/Measurements/models/Entry";
import { getMeasurementCategories, getMeasurementCategory } from "services/measurements";

jest.mock("axios");

describe('measurement service tests', () => {
    test('GET measurement categories', async () => {
        const measurementResponse = {
            count: 2,
            next: null,
            previous: null,
            results: [
                {
                    "id": 1,
                    "name": "Weight",
                    "unit": "kg"
                }
            ]
        };

        const measurementEntryResponse = {
            count: 2,
            next: null,
            previous: null,
            results: [
                {
                    "id": 1,
                    "category": 1,
                    "value": 80,
                    "date": "2021-01-01",
                    "notes": ""
                }
            ]
        };

        // @ts-ignore
        axios.get.mockImplementation((url: string) => {
            if (url.includes("measurement-category")) {
                return Promise.resolve({ data: measurementResponse });
            } else if (url.includes("measurement/?category=1")) {
                return Promise.resolve({ data: measurementEntryResponse });
            }
        });

        const result = await getMeasurementCategories();
        expect(axios.get).toHaveBeenCalledTimes(2);

        expect(result).toStrictEqual([
            new MeasurementCategory(1, "Weight", "kg", [
                new MeasurementEntry(1, 1, new Date("2021-01-01"), 80, "")
            ])
        ]);
    });

    test('GET measurement category', async () => {
        const measurementResponse = {
            "id": 1,
            "name": "Weight",
            "unit": "kg"
        };

        const measurementEntryResponse = {
            count: 2,
            next: null,
            previous: null,
            results: [
                {
                    "id": 1,
                    "category": 1,
                    "value": 80,
                    "date": "2021-01-01",
                    "notes": ""
                }
            ]
        };

        // @ts-ignore
        axios.get.mockImplementation((url: string) => {
            if (url.includes("measurement-category/1")) {
                return Promise.resolve({ data: measurementResponse });
            } else if (url.includes("measurement/?category=1")) {
                return Promise.resolve({ data: measurementEntryResponse });
            }
        });

        const result = await getMeasurementCategory(1);
        expect(axios.get).toHaveBeenCalledTimes(2);

        expect(result).toStrictEqual(
            new MeasurementCategory(1, "Weight", "kg", [
                new MeasurementEntry(1, 1, new Date("2021-01-01"), 80, "")
            ])
        );
    });
});
