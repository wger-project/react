import axios from "axios";
import { WeightEntry } from "@/components/Weight/models/WeightEntry";
import { testBodyWeightCategory } from "@/tests/weight/testData";
import { createWeight, deleteWeight, getBodyWeightCategory, getWeights, updateWeight } from "./weight";
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
            new WeightEntry(new Date('2021-12-10'), 80, ENTRY_UUID, '', 'kg', 'user'),
            new WeightEntry(new Date('2021-12-20'), 90, ENTRY_UUID_2, '', 'lb', 'apple'),
        ]);
    });

    test('DELETE weight entry', async () => {

        // Arrange
        (axios.delete as Mock).mockImplementation(() => Promise.resolve({ status: 204 }));

        // Act
        const result = await deleteWeight(ENTRY_UUID);

        // Assert
        expect(axios.delete).toHaveBeenCalledWith(
            expect.stringContaining(`measurement/${ENTRY_UUID}`),
            expect.anything()
        );
        expect(result).toEqual(204);
    });

    test('PATCH weight entry', async () => {

        // Arrange
        const weightEntry = new WeightEntry(new Date('2021-12-10'), 80, ENTRY_UUID);
        const weightResponse = {
            data: {
                id: ENTRY_UUID,
                category: CATEGORY_UUID,
                value: 80,
                date: '2021-12-10',
                notes: ''
            }
        };

        // Act
        (axios.patch as Mock).mockImplementation(() => Promise.resolve(weightResponse));
        const result = await updateWeight(weightEntry);

        // Assert
        expect(axios.patch).toHaveBeenCalledTimes(1);
        const [url, body] = (axios.patch as Mock).mock.calls[0];
        expect(url).toContain(`measurement/${ENTRY_UUID}`);
        expect(body).toMatchObject({ value: 80, extra_data: { unit: 'kg' } });
        expect(result).toStrictEqual(new WeightEntry(new Date('2021-12-10'), 80, ENTRY_UUID));
    });

    test('POST a new weight entry', async () => {

        // Arrange
        const weightEntry = new WeightEntry(new Date('2021-12-10'), 80, undefined, '', 'lb');
        const weightResponse = {
            data: {
                id: ENTRY_UUID,
                category: CATEGORY_UUID,
                value: 80,
                date: '2021-12-10',
                notes: '',
                extra_data: { unit: 'lb' }
            }
        };

        // Act
        (axios.post as Mock).mockImplementation(() => Promise.resolve(weightResponse));
        const result = await createWeight(weightEntry, CATEGORY_UUID);

        // Assert
        expect(axios.post).toHaveBeenCalledTimes(1);
        const [, body] = (axios.post as Mock).mock.calls[0];
        expect(body).toMatchObject({ category: CATEGORY_UUID, value: 80, extra_data: { unit: 'lb' } });
        expect(result).toStrictEqual(new WeightEntry(new Date('2021-12-10'), 80, ENTRY_UUID, '', 'lb'));
    });

});
