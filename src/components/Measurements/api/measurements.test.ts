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
import { MeasurementCategory } from "@/components/Measurements/models/Category";
import { MeasurementEntry } from "@/components/Measurements/models/Entry";
import axios from "axios";
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
                "date": "2021-01-01T08:00:00+01:00",
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
                new MeasurementEntry(ENTRY_UUID, CATEGORY_UUID, new Date("2021-01-01T08:00:00+01:00"), 80, "")
            ])
        ]);
    });

    test("entries 'none' reads the categories without a request per category", async () => {

        const result = await getMeasurementCategories({ entries: 'none' });

        expect(axios.get).toHaveBeenCalledTimes(1);
        expect(result[0].entries).toHaveLength(0);
    });

    test("entries 'probe' asks for a single entry per category", async () => {

        const result = await getMeasurementCategories({ entries: 'probe' });

        expect(axios.get).toHaveBeenNthCalledWith(2,
            expect.stringContaining('limit=1'),
            expect.anything()
        );
        expect(result[0].entries).toHaveLength(1);
    });

    test("entryLimit caps how many entries are read per category", async () => {

        const result = await getMeasurementCategories({ entryLimit: 5 });

        expect(axios.get).toHaveBeenNthCalledWith(2,
            expect.stringContaining('limit=5'),
            expect.anything()
        );
        expect(result[0].entries).toHaveLength(1);
    });

    test("entries 'probe' ignores the entry filterset, it fetches no history", async () => {

        await getMeasurementCategories({
            entries: 'probe',
            filtersetQueryEntries: { foo: "bar" },
        });

        expect(axios.get).toHaveBeenNthCalledWith(2,
            expect.not.stringContaining('foo=bar'),
            expect.anything()
        );
    });

    test('GET measurement categories hides the official body weight category', async () => {

        (axios.get as Mock).mockImplementation((url: string) => {
            if (url.includes("measurement-category")) {
                return Promise.resolve({
                    data: {
                        count: 2,
                        next: null,
                        previous: null,
                        results: [
                            { id: CATEGORY_UUID, name: "Weight", unit: "kg" },
                            {
                                id: CATEGORY_UUID_2,
                                name: "Body weight",
                                unit: "kg",
                                metric_type: "body_weight",
                                is_official: true
                            },
                        ]
                    }
                });
            } else if (url.includes(`measurement/?category=${CATEGORY_UUID}`)) {
                return Promise.resolve({ data: measurementEntryResponse });
            }
        });

        const result = await getMeasurementCategories();

        expect(result.map(c => c.id)).toStrictEqual([CATEGORY_UUID]);
        // no entries are loaded for the hidden category
        expect(axios.get).toHaveBeenCalledTimes(2);
    });

    test('GET measurement category', async () => {

        (axios.get as Mock).mockImplementation((url: string) => {
            if (url.includes(`measurement-category/${CATEGORY_UUID}`)) {
                return Promise.resolve({ data: measurementDetailResponse });
            } else if (url.includes(`parent=${CATEGORY_UUID}`)) {
                return Promise.resolve({ data: { count: 0, next: null, previous: null, results: [] } });
            } else if (url.includes(`measurement/?category=${CATEGORY_UUID}`)) {
                return Promise.resolve({ data: measurementEntryResponse });
            }
        });

        const result = await getMeasurementCategory(CATEGORY_UUID);
        expect(axios.get).toHaveBeenCalledTimes(3);

        expect(result).toStrictEqual(
            new MeasurementCategory(CATEGORY_UUID, "Weight", "kg", [
                new MeasurementEntry(ENTRY_UUID, CATEGORY_UUID, new Date("2021-01-01T08:00:00+01:00"), 80, "")
            ])
        );
    });

    test('GET measurement category loads the children of a group', async () => {

        (axios.get as Mock).mockImplementation((url: string) => {
            if (url.includes(`measurement-category/${CATEGORY_UUID}`)) {
                return Promise.resolve({
                    data: { id: CATEGORY_UUID, name: "Blood pressure", unit: "mmHg" }
                });
            } else if (url.includes(`parent=${CATEGORY_UUID}`)) {
                return Promise.resolve({
                    data: {
                        count: 1,
                        next: null,
                        previous: null,
                        results: [{
                            id: CATEGORY_UUID_2,
                            name: "Systolic",
                            unit: "mmHg",
                            parent: CATEGORY_UUID
                        }],
                    }
                });
            } else if (url.includes(`measurement/?category=${CATEGORY_UUID_2}`)) {
                return Promise.resolve({
                    data: {
                        count: 1,
                        next: null,
                        previous: null,
                        results: [{
                            id: ENTRY_UUID_2,
                            category: CATEGORY_UUID_2,
                            value: 120,
                            date: "2021-01-01T08:00:00+01:00",
                            notes: ""
                        }],
                    }
                });
            } else if (url.includes(`measurement/?category=${CATEGORY_UUID}`)) {
                return Promise.resolve({ data: { count: 0, next: null, previous: null, results: [] } });
            }
        });

        const result = await getMeasurementCategory(CATEGORY_UUID);

        expect(result.isGroup).toBe(true);
        expect(result.entries).toStrictEqual([]);
        expect(result.children.map(c => c.id)).toStrictEqual([CATEGORY_UUID_2]);
        expect(result.children[0].entries.map(e => e.value)).toStrictEqual([120]);
    });

    test('GET measurement categories attaches children to their group', async () => {

        (axios.get as Mock).mockImplementation((url: string) => {
            if (url.includes("measurement-category")) {
                return Promise.resolve({
                    data: {
                        count: 2,
                        next: null,
                        previous: null,
                        results: [
                            { id: CATEGORY_UUID, name: "Blood pressure", unit: "mmHg" },
                            { id: CATEGORY_UUID_2, name: "Systolic", unit: "mmHg", parent: CATEGORY_UUID },
                        ]
                    }
                });
            }
            return Promise.resolve({ data: { count: 0, next: null, previous: null, results: [] } });
        });

        const result = await getMeasurementCategories();

        // only the group parent is top-level, the child hangs below it
        expect(result.map(c => c.id)).toStrictEqual([CATEGORY_UUID]);
        expect(result[0].isGroup).toBe(true);
        expect(result[0].children.map(c => c.id)).toStrictEqual([CATEGORY_UUID_2]);
    });

    test('addMeasurementCategory POSTs the category and returns the parsed result', async () => {
        (axios.post as Mock).mockResolvedValue({
            data: { id: CATEGORY_UUID_2, name: "Body fat", unit: "%" },
        });

        const result = await addMeasurementCategory(new MeasurementCategory(null, "Body fat", "%"));

        expect(axios.post).toHaveBeenCalledTimes(1);
        const [url, body] = (axios.post as Mock).mock.calls[0];
        expect(url).toMatch(/\/api\/v2\/measurement-category\/$/);

        expect(body).toEqual({
            name: "Body fat",
            unit: "%",
            metric_type: "custom",
            chart_type: null,
            chart_config: {},
            parent: null,
            order: 0
        });
        expect(result).toBeInstanceOf(MeasurementCategory);
        expect(result.id).toBe(CATEGORY_UUID_2);
    });

    test('editMeasurementCategory PATCHes /measurement-category/<id>/', async () => {
        (axios.patch as Mock).mockResolvedValue({
            data: { id: CATEGORY_UUID_2, name: "Renamed", unit: "%" },
        });

        const result = await editMeasurementCategory(new MeasurementCategory(CATEGORY_UUID_2, "Renamed", "%"));

        expect(axios.patch).toHaveBeenCalledTimes(1);
        const [url, body] = (axios.patch as Mock).mock.calls[0];
        expect(url).toMatch(new RegExp(`/api/v2/measurement-category/${CATEGORY_UUID_2}/$`));

        expect(body).toEqual({
            id: CATEGORY_UUID_2,
            name: "Renamed",
            unit: "%",
            metric_type: "custom",
            chart_type: null,
            chart_config: {},
            parent: null,
            order: 0
        });
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
            data: { id: ENTRY_UUID_2, category: CATEGORY_UUID, value: 80.5, date: "2024-08-01T12:34:00Z", notes: "" },
        });

        const result = await addMeasurementEntry(new MeasurementEntry(
            null,
            CATEGORY_UUID,
            new Date("2024-08-01T12:34:00Z"),
            80.5,
            "",
        ));

        expect(axios.post).toHaveBeenCalledTimes(1);
        const [url, body] = (axios.post as Mock).mock.calls[0];
        expect(url).toMatch(/\/api\/v2\/measurement\/$/);
        expect(body).toMatchObject({
            category: CATEGORY_UUID,
            value: 80.5,
            notes: "",
        });
        // the full timestamp is sent, the server field is a datetime
        expect(body.date).toBe("2024-08-01T12:34:00.000Z");
        expect(result).toBeInstanceOf(MeasurementEntry);
        expect(result.id).toBe(ENTRY_UUID_2);
    });

    test('editMeasurementEntry PATCHes /measurement/<id>/', async () => {
        (axios.patch as Mock).mockResolvedValue({
            data: {
                id: ENTRY_UUID_2,
                category: CATEGORY_UUID,
                value: 81,
                date: "2024-08-02T00:00:00Z",
                notes: "edited"
            },
        });

        const result = await editMeasurementEntry(new MeasurementEntry(
            ENTRY_UUID_2,
            CATEGORY_UUID,
            new Date("2024-08-02T00:00:00Z"),
            81,
            "edited",
        ));

        expect(axios.patch).toHaveBeenCalledTimes(1);
        const [url, body] = (axios.patch as Mock).mock.calls[0];
        expect(url).toMatch(new RegExp(`/api/v2/measurement/${ENTRY_UUID_2}/$`));
        expect(body).toMatchObject({ category: CATEGORY_UUID, value: 81, notes: "edited" });
        expect(body.date).toBe("2024-08-02T00:00:00.000Z");
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
