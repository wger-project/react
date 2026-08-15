import {
    addMeasurementCategory,
    addMeasurementEntry,
    deleteMeasurementCategory,
    deleteMeasurementEntry,
    editMeasurementCategory,
    editMeasurementEntry,
    getCategoryEntryFlags,
    getGroupEntryPage,
    getMeasurementCategories,
    getMeasurementCategory,
    getMeasurementEntries,
    getMeasurementEntryPage,
    getOldestMeasurementEntry,
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
const ENTRY_UUID_3 = 'dddddddd-dddd-dddd-dddd-000000000007';

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

    test('Correctly filters the categories', async () => {

        await getMeasurementCategories({ filtersetQueryCategories: { baz: "1234" } });

        expect(axios.get).toHaveBeenCalledWith(
            expect.stringContaining('baz=1234'),
            expect.anything()
        );
    });

    test('GET measurement categories reads no entries along with them', async () => {

        const result = await getMeasurementCategories();

        expect(axios.get).toHaveBeenCalledTimes(1);
        expect(result).toStrictEqual([
            new MeasurementCategory(CATEGORY_UUID, "Weight", "kg")
        ]);
    });

    test('the entry flags ask for a single entry per category', async () => {

        const result = await getCategoryEntryFlags();

        expect(axios.get).toHaveBeenNthCalledWith(2,
            expect.stringContaining('limit=1'),
            expect.anything()
        );
        expect(result).toStrictEqual([{
            category: new MeasurementCategory(CATEGORY_UUID, "Weight", "kg"),
            hasEntries: true,
        }]);
    });

    test('an entry limit reads the newest entries in a single request', async () => {

        const result = await getMeasurementEntries(CATEGORY_UUID, {}, 5);

        expect(axios.get).toHaveBeenCalledWith(
            expect.stringContaining('limit=5'),
            expect.anything()
        );
        expect(result).toHaveLength(1);
    });

    test('a page is read with the row after it, which is no part of the page', async () => {

        const entry = (id: string, value: number) => ({
            "id": id,
            "category": CATEGORY_UUID,
            "value": value,
            "date": "2021-01-01T08:00:00+01:00",
            "notes": ""
        });
        (axios.get as Mock).mockImplementation(() => Promise.resolve({
            data: {
                count: 42,
                next: null,
                previous: null,
                results: [entry(ENTRY_UUID, 80), entry(ENTRY_UUID_2, 79), entry(ENTRY_UUID_3, 78)],
            }
        }));

        const page = await getMeasurementEntryPage(CATEGORY_UUID, 10, 2);

        expect(axios.get).toHaveBeenCalledWith(
            expect.stringContaining('limit=3'),
            expect.anything()
        );
        expect(axios.get).toHaveBeenCalledWith(
            expect.stringContaining('offset=10'),
            expect.anything()
        );
        expect(page.entries.map(e => e.value)).toStrictEqual([80, 79]);
        expect(page.next!.value).toBe(78);
        // What the table pages through, not what it was handed
        expect(page.count).toBe(42);
    });

    test('the last page of a history has no row after it', async () => {

        const page = await getMeasurementEntryPage(CATEGORY_UUID, 0, 10);

        expect(page.entries).toHaveLength(1);
        expect(page.next).toBeNull();
    });

    test('the oldest entry is read as a single row, in a total order', async () => {

        const result = await getOldestMeasurementEntry(CATEGORY_UUID);

        expect(axios.get).toHaveBeenCalledWith(
            expect.stringContaining(`ordering=${encodeURIComponent('date,id')}`),
            expect.anything()
        );
        expect(axios.get).toHaveBeenCalledWith(
            expect.stringContaining('limit=1'),
            expect.anything()
        );
        expect(result!.id).toBe(ENTRY_UUID);
    });

    test('a category without entries has no oldest one', async () => {

        (axios.get as Mock).mockImplementation(() => Promise.resolve({
            data: { count: 0, next: null, previous: null, results: [] }
        }));

        expect(await getOldestMeasurementEntry(CATEGORY_UUID)).toBeNull();
    });

    describe('getGroupEntryPage', () => {

        const groupResponse = (next: string | null) => ({
            data: {
                count: 4,
                next: next,
                previous: null,
                results: [{
                    "id": ENTRY_UUID,
                    "category": CATEGORY_UUID,
                    "value": 120,
                    "date": "2021-01-01T08:00:00+01:00",
                    "notes": ""
                }],
            }
        });

        test('reads the components together, below the cursor', async () => {
            (axios.get as Mock).mockImplementation(() => Promise.resolve(groupResponse(null)));

            await getGroupEntryPage(
                [CATEGORY_UUID, CATEGORY_UUID_2],
                22,
                new Date("2021-02-03T07:00:00.000Z"),
            );

            const [url] = (axios.get as Mock).mock.calls[0];
            expect(url).toContain(`category__in=${CATEGORY_UUID}%2C${CATEGORY_UUID_2}`);
            expect(url).toContain('limit=22');
            expect(url).toContain('date__lt=2021-02-03T07%3A00%3A00.000Z');
        });

        test('the newest page is read without a cursor', async () => {
            (axios.get as Mock).mockImplementation(() => Promise.resolve(groupResponse(null)));

            await getGroupEntryPage([CATEGORY_UUID], 22);

            expect((axios.get as Mock).mock.calls[0][0]).not.toContain('date__lt');
        });

        test('what is left over comes from the server, not from the page size', async () => {
            // A page the server capped below the limit that was asked for: it
            // still says there is more, and counting the rows would not
            (axios.get as Mock).mockImplementation(
                () => Promise.resolve(groupResponse('http://localhost/api/v2/measurement/?offset=999'))
            );

            const page = await getGroupEntryPage([CATEGORY_UUID], 1010);

            expect(page.truncated).toBe(true);
        });

        test('a page the server has nothing after is not truncated', async () => {
            (axios.get as Mock).mockImplementation(() => Promise.resolve(groupResponse(null)));

            const page = await getGroupEntryPage([CATEGORY_UUID], 1);

            // Exactly as many rows as were asked for, and still the end
            expect(page.entries).toHaveLength(1);
            expect(page.truncated).toBe(false);
        });
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
        expect(axios.get).toHaveBeenCalledTimes(2);

        expect(result).toStrictEqual(
            new MeasurementCategory(CATEGORY_UUID, "Weight", "kg")
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
        expect(result.children.map(c => c.id)).toStrictEqual([CATEGORY_UUID_2]);
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
            order: 0,
            dynamic_type: "NONE",
            dynamic_params: {}
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
            order: 0,
            dynamic_type: "NONE",
            dynamic_params: {}
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
