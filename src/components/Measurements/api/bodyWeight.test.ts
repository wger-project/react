import axios from "axios";
import { testBodyWeightCategory, makeWeightEntry } from "@/tests/weight/testData";
import { getBodyWeightCategory, getWeights } from "./bodyWeight";
import type { Mock } from 'vitest';

vi.mock("axios");

const CATEGORY_UUID = 'cccccccc-cccc-cccc-cccc-000000000042';
const ENTRY_UUID = 'dddddddd-dddd-dddd-dddd-000000000001';
const ENTRY_UUID_2 = 'dddddddd-dddd-dddd-dddd-000000000002';

describe("weight service tests", () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('an empty category response raises a clear error', async () => {

        (axios.get as Mock).mockImplementation(() => Promise.resolve({
            data: { count: 0, next: null, previous: null, results: [] }
        }));

        await expect(getBodyWeightCategory()).rejects.toThrow('No official body weight category');
    });

    test('GET the official body weight category', async () => {

        const categoryResponse = {
            count: 1,
            next: null,
            previous: null,
            results: [
                { id: CATEGORY_UUID, name: 'Body weight', unit: 'kg', metric_type: 'body_weight', is_official: true },
            ]
        };
        (axios.get as Mock).mockImplementation(() => Promise.resolve({ data: categoryResponse }));

        const result = await getBodyWeightCategory();

        expect(axios.get).toHaveBeenCalledWith(
            expect.stringContaining('metric_type=body_weight'),
            expect.anything()
        );
        expect(result!.id).toBe(CATEGORY_UUID);
        expect(result!.metricType).toBe('body_weight');
        expect(result!.isOfficial).toBe(true);
    });

    test('GET weight entries', async () => {

        // one entry carries its own unit, one falls back to the category unit
        const weightResponse = {
            count: 2,
            next: null,
            previous: null,
            results: [
                {
                    id: ENTRY_UUID,
                    category: CATEGORY_UUID,
                    value: 80,
                    date: '2021-12-10',
                    notes: '',
                    source: 'user',
                    extra_data: {}
                },
                {
                    id: ENTRY_UUID_2,
                    category: CATEGORY_UUID,
                    value: 90,
                    date: '2021-12-20',
                    notes: '',
                    source: 'apple',
                    extra_data: { unit: 'lb' }
                },
            ]
        };

        (axios.get as Mock).mockImplementation(() => Promise.resolve({ data: weightResponse }));

        const result = await getWeights(testBodyWeightCategory);

        expect(axios.get).toHaveBeenCalledTimes(1);
        expect(axios.get).toHaveBeenCalledWith(
            expect.stringContaining(`category=${CATEGORY_UUID}`),
            expect.anything()
        );
        expect(result).toStrictEqual([
            // no unit of its own: the category unit applies when the value is read
            makeWeightEntry(new Date('2021-12-10'), 80, { id: ENTRY_UUID, source: 'user' }),
            makeWeightEntry(new Date('2021-12-20'), 90, { id: ENTRY_UUID_2, unit: 'lb', source: 'apple' }),
        ]);
    });

    test('GET weight entries collects every page', async () => {

        const page = (id: string, value: number, next: string | null) => ({
            count: 2,
            next: next,
            previous: null,
            results: [
                {
                    id: id,
                    category: CATEGORY_UUID,
                    value: value,
                    date: '2021-12-10',
                    notes: '',
                    source: 'user',
                    extra_data: {}
                },
            ]
        });

        (axios.get as Mock)
            .mockImplementationOnce(() => Promise.resolve({
                data: page(ENTRY_UUID, 80, 'http://server/api/v2/measurement/?offset=1')
            }))
            .mockImplementationOnce(() => Promise.resolve({ data: page(ENTRY_UUID_2, 90, null) }));

        const result = await getWeights(testBodyWeightCategory);

        expect(axios.get).toHaveBeenCalledTimes(2);
        expect(result.map(entry => entry.id)).toStrictEqual([ENTRY_UUID, ENTRY_UUID_2]);
    });

    test('GET weight entries passes the filterset on', async () => {

        (axios.get as Mock).mockImplementation(() => Promise.resolve({
            data: { count: 0, next: null, previous: null, results: [] }
        }));

        await getWeights(testBodyWeightCategory, { "date__gte": '2021-01-01T00:00:00.000Z' });

        expect(axios.get).toHaveBeenCalledWith(
            expect.stringContaining('date__gte=2021-01-01'),
            expect.anything()
        );
    });

});
