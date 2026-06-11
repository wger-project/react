import axios from "axios";
import { MeasurementCategory } from "@/components/Measurements/models/Category";
import { MeasurementEntry } from "@/components/Measurements/models/Entry";
import {
    addMeasurementCategory,
    addMeasurementEntry,
    deleteMeasurementCategory,
    deleteMeasurementEntry,
    editMeasurementCategory,
    editMeasurementEntry,
    getMeasurementCategories,
    getMeasurementCategory,
} from "@/components/Measurements/api/measurements";
import type { Mock } from 'vitest';

vi.mock("axios");

// Recognisable test-marker UUIDs matching the Django fixtures convention
const CATEGORY_UUID = 'cccccccc-cccc-cccc-cccc-000000000001';
const CATEGORY_UUID_2 = 'cccccccc-cccc-cccc-cccc-000000000009';
const ENTRY_UUID = 'dddddddd-dddd-dddd-dddd-000000000001';
const ENTRY_UUID_2 = 'dddddddd-dddd-dddd-dddd-000000000005';

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
        vi.resetAllMocks();

        (axios.get as Mock).mockImplementation((url: string) => {
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

        (axios.get as Mock).mockImplementation((url: string) => {
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

    test('addMeasurementCategory POSTs name + unit and returns the parsed category', async () => {
        (axios.post as Mock).mockResolvedValue({
            data: { id: CATEGORY_UUID_2, name: "Body fat", unit: "%" },
        });

        const result = await addMeasurementCategory({ name: "Body fat", unit: "%" });

        expect(axios.post).toHaveBeenCalledTimes(1);
        const [url, body] = (axios.post as Mock).mock.calls[0];
        expect(url).toMatch(/\/api\/v2\/measurement-category\/$/);
        expect(body).toEqual({ name: "Body fat", unit: "%" });
        expect(result).toBeInstanceOf(MeasurementCategory);
        expect(result.id).toBe(CATEGORY_UUID_2);
    });

    test('editMeasurementCategory PATCHes /measurement-category/<id>/', async () => {
        (axios.patch as Mock).mockResolvedValue({
            data: { id: CATEGORY_UUID_2, name: "Renamed", unit: "%" },
        });

        const result = await editMeasurementCategory({ id: CATEGORY_UUID_2, name: "Renamed", unit: "%" });

        expect(axios.patch).toHaveBeenCalledTimes(1);
        const [url, body] = (axios.patch as Mock).mock.calls[0];
        expect(url).toMatch(new RegExp(`/api/v2/measurement-category/${CATEGORY_UUID_2}/$`));
        expect(body).toEqual({ name: "Renamed", unit: "%" });
        expect(result.name).toBe("Renamed");
    });

    test('deleteMeasurementCategory DELETEs /measurement-category/<id>/', async () => {
        (axios.delete as Mock).mockResolvedValue({ status: 204 });

        await deleteMeasurementCategory(CATEGORY_UUID_2);

        expect(axios.delete).toHaveBeenCalledWith(
            expect.stringMatching(new RegExp(`/api/v2/measurement-category/${CATEGORY_UUID_2}/$`)),
            expect.anything()
        );
    });

    test('addMeasurementEntry POSTs the entry with serialized date', async () => {
        (axios.post as Mock).mockResolvedValue({
            data: { id: ENTRY_UUID_2, category: CATEGORY_UUID, value: 80.5, date: "2024-08-01", notes: "" },
        });

        const result = await addMeasurementEntry({
            categoryId: CATEGORY_UUID,
            date: new Date("2024-08-01T12:34:00Z"),
            value: 80.5,
            notes: "",
        });

        expect(axios.post).toHaveBeenCalledTimes(1);
        const [url, body] = (axios.post as Mock).mock.calls[0];
        expect(url).toMatch(/\/api\/v2\/measurement\/$/);
        expect(body).toMatchObject({
            category: CATEGORY_UUID,
            value: 80.5,
            notes: "",
        });
        // Date is YYYY-MM-DD
        expect(body.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(result).toBeInstanceOf(MeasurementEntry);
        expect(result.id).toBe(ENTRY_UUID_2);
    });

    test('editMeasurementEntry PATCHes /measurement/<id>/ with date/value/notes only', async () => {
        (axios.patch as Mock).mockResolvedValue({
            data: { id: ENTRY_UUID_2, category: CATEGORY_UUID, value: 81, date: "2024-08-02", notes: "edited" },
        });

        const result = await editMeasurementEntry({
            id: ENTRY_UUID_2,
            categoryId: CATEGORY_UUID,
            date: new Date("2024-08-02T00:00:00Z"),
            value: 81,
            notes: "edited",
        });

        expect(axios.patch).toHaveBeenCalledTimes(1);
        const [url, body] = (axios.patch as Mock).mock.calls[0];
        expect(url).toMatch(new RegExp(`/api/v2/measurement/${ENTRY_UUID_2}/$`));
        // Note: 'category' is NOT sent on edit (categoryId is part of the params but ignored in body)
        expect(body).not.toHaveProperty("category");
        expect(body).toMatchObject({ value: 81, notes: "edited" });
        expect(body.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(result.value).toBe(81);
    });

    test('deleteMeasurementEntry DELETEs /measurement/<id>/', async () => {
        (axios.delete as Mock).mockResolvedValue({ status: 204 });

        await deleteMeasurementEntry(ENTRY_UUID_2);

        expect(axios.delete).toHaveBeenCalledWith(
            expect.stringMatching(new RegExp(`/api/v2/measurement/${ENTRY_UUID_2}/$`)),
            expect.anything()
        );
    });
});
