import axios from "axios";
import { MeasurementCategory } from "components/Measurements/models/Category";
import { MeasurementEntry } from "components/Measurements/models/Entry";
import { getMeasurementCategories, getMeasurementCategory } from "services/measurements";

jest.mock("axios");

describe('measurement service tests', () => {
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

    const measurementOverviewResponse = {
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

    const measurementDetailResponse = {
        "id": 1,
        "name": "Weight",
        "unit": "kg"
    };


    beforeEach(() => {
        jest.resetAllMocks();

        (axios.get as jest.Mock).mockImplementation((url: string) => {
            if (url.includes("measurement-category")) {
                return Promise.resolve({ data: measurementOverviewResponse });
            } else if (url.includes("measurement/?category=1")) {
                return Promise.resolve({ data: measurementEntryResponse });
            }
        });
    });

    test('Correctly filters categories and entries', async () => {

        await getMeasurementCategories({
            filtersetQueryEntries: { foo: "bar" },
            filtersetQueryCategories: { baz: "1234" }
        });

        expect(axios.get).toHaveBeenCalledTimes(2);
        expect(axios.get).toHaveBeenNthCalledWith(1,
            expect.stringContaining('baz=1234'),
            expect.anything()
        );
        expect(axios.get).toHaveBeenNthCalledWith(2,
            expect.stringContaining('foo=bar'),
            expect.anything()
        );

    });

    test('GET measurement categories', async () => {

        const result = await getMeasurementCategories();
        expect(axios.get).toHaveBeenCalledTimes(2);

        expect(result).toStrictEqual([
            new MeasurementCategory(1, "Weight", "kg", [
                new MeasurementEntry(1, 1, new Date("2021-01-01"), 80, "")
            ])
        ]);
    });

    test('GET measurement category', async () => {

        (axios.get as jest.Mock).mockImplementation((url: string) => {
            if (url.includes("measurement-category/1")) {
                return Promise.resolve({ data: measurementDetailResponse });
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
