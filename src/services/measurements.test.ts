import axios from "axios";
import { MeasurementCategory } from "components/Measurements/models/Category";
import { MeasurementEntry } from "components/Measurements/models/Entry";
import { getMeasurementCategories, getMeasurementCategory } from "services/measurements";

jest.mock("axios");

// Test-marker UUIDs matching the Django fixtures convention.
const CATEGORY_UUID = 'cccccccc-cccc-cccc-cccc-000000000001';
const ENTRY_UUID = 'dddddddd-dddd-dddd-dddd-000000000001';

describe('measurement service tests', () => {
    const measurementEntryResponse = {
        count: 2,
        next: null,
        previous: null,
        results: [
            {
                "id": ENTRY_UUID,
                "category": CATEGORY_UUID,
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
                "id": CATEGORY_UUID,
                "name": "Weight",
                "unit": "kg"
            }
        ]
    };

    const measurementDetailResponse = {
        "id": CATEGORY_UUID,
        "name": "Weight",
        "unit": "kg"
    };


    beforeEach(() => {
        jest.resetAllMocks();

        (axios.get as jest.Mock).mockImplementation((url: string) => {
            if (url.includes("measurement-category")) {
                return Promise.resolve({ data: measurementOverviewResponse });
            } else if (url.includes(`measurement/?category=${CATEGORY_UUID}`)) {
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
            new MeasurementCategory(CATEGORY_UUID, "Weight", "kg", [
                new MeasurementEntry(ENTRY_UUID, CATEGORY_UUID, new Date("2021-01-01"), 80, "")
            ])
        ]);
    });

    test('GET measurement category', async () => {

        (axios.get as jest.Mock).mockImplementation((url: string) => {
            if (url.includes(`measurement-category/${CATEGORY_UUID}`)) {
                return Promise.resolve({ data: measurementDetailResponse });
            } else if (url.includes(`measurement/?category=${CATEGORY_UUID}`)) {
                return Promise.resolve({ data: measurementEntryResponse });
            }
        });

        const result = await getMeasurementCategory(CATEGORY_UUID);
        expect(axios.get).toHaveBeenCalledTimes(2);

        expect(result).toStrictEqual(
            new MeasurementCategory(CATEGORY_UUID, "Weight", "kg", [
                new MeasurementEntry(ENTRY_UUID, CATEGORY_UUID, new Date("2021-01-01"), 80, "")
            ])
        );
    });
});
