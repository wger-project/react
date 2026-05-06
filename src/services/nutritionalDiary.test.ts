import axios from "axios";
import { DiaryEntry } from "@/components/Nutrition/models/diaryEntry";
import {
    addNutritionalDiaryEntry,
    deleteNutritionalDiaryEntry,
    editNutritionalDiaryEntry,
    getNutritionalDiaryEntries,
} from "@/services/nutritionalDiary";
import { getIngredients } from "@/services/ingredient";
import { TEST_INGREDIENT_1 } from "@/tests/ingredientTestdata";
import { responseDiaryEntries, responseDiaryEntryDetail } from "@/tests/nutritionTestdata";
import type { Mock } from 'vitest';

vi.mock("axios");
vi.mock("@/services/ingredient");

describe("Nutritional diary service tests", () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('Correctly filters diary entries', async () => {
        (axios.get as Mock).mockImplementation(() => {
            return Promise.resolve({
                data: { count: 0, next: null, previous: null, results: [] }
            });
        });

        await getNutritionalDiaryEntries({ filtersetQuery: { foo: "bar" } });

        // No results, so no loading of ingredients or weight units
        expect(axios.get).toHaveBeenCalledTimes(1);
        expect(axios.get).toHaveBeenNthCalledWith(1,
            expect.stringContaining('foo=bar'),
            expect.anything()
        );
    });

    test('returns empty list and skips ingredient loading when no entries are found', async () => {
        (axios.get as Mock).mockResolvedValue({
            data: { count: 0, next: null, previous: null, results: [] },
        });

        const result = await getNutritionalDiaryEntries();

        expect(result).toEqual([]);
        expect(getIngredients).not.toHaveBeenCalled();
    });

    test('loads each unique ingredient once and links them to the entries', async () => {
        // Two entries with the same ingredient id - getIngredients should be called with [101] once
        const dupedEntries = {
            ...responseDiaryEntries,
            count: 2,
            results: [
                responseDiaryEntries.results[0],
                { ...responseDiaryEntries.results[0], id: 10 },
            ],
        };
        (axios.get as Mock).mockResolvedValue({ data: dupedEntries });
        (getIngredients as Mock).mockResolvedValue([TEST_INGREDIENT_1]);

        const result = await getNutritionalDiaryEntries();

        expect(getIngredients).toHaveBeenCalledTimes(1);
        expect(getIngredients).toHaveBeenCalledWith([101]); // de-duplicated
        expect(result).toHaveLength(2);
        expect(result[0].ingredient).toBe(TEST_INGREDIENT_1);
        expect(result[1].ingredient).toBe(TEST_INGREDIENT_1);
        // weightUnit stays null because the entry has weight_unit: null
        expect(result[0].weightUnit).toBeNull();
    });

    test('addNutritionalDiaryEntry POSTs the serialized entry', async () => {
        const entry = new DiaryEntry({
            planId: 101,
            mealId: 78,
            ingredientId: 101,
            weightUnitId: null,
            amount: 150,
            datetime: new Date("2024-08-01T08:00:00Z"),
        });
        (axios.post as Mock).mockResolvedValue({ data: responseDiaryEntryDetail });

        const result = await addNutritionalDiaryEntry(entry);

        expect(axios.post).toHaveBeenCalledTimes(1);
        const [url, body] = (axios.post as Mock).mock.calls[0];
        expect(url).toMatch(/\/api\/v2\/nutritiondiary\/$/);
        expect(body).toMatchObject({
            plan: 101,
            meal: 78,
            ingredient: 101,
            // eslint-disable-next-line camelcase
            weight_unit: null,
            amount: "150",
            datetime: "2024-08-01T08:00:00.000Z",
        });
        expect(result).toBeInstanceOf(DiaryEntry);
        expect(result.id).toBe(9);
    });

    test('editNutritionalDiaryEntry PATCHes /nutritiondiary/<id>/', async () => {
        const entry = new DiaryEntry({
            id: 9,
            planId: 101,
            mealId: 78,
            ingredientId: 101,
            weightUnitId: null,
            amount: 99,
            datetime: new Date("2024-08-01T08:00:00Z"),
        });
        (axios.patch as Mock).mockResolvedValue({
            data: { ...responseDiaryEntryDetail, amount: "99.00" },
        });

        const result = await editNutritionalDiaryEntry(entry);

        expect(axios.patch).toHaveBeenCalledTimes(1);
        const [url, body] = (axios.patch as Mock).mock.calls[0];
        expect(url).toMatch(/\/api\/v2\/nutritiondiary\/9\/$/);
        expect(body).toMatchObject({ amount: "99" });
        expect(result.amount).toBe(99);
    });

    test('deleteNutritionalDiaryEntry DELETEs /nutritiondiary/<id>/', async () => {
        (axios.delete as Mock).mockResolvedValue({ status: 204 });

        await deleteNutritionalDiaryEntry(9);

        expect(axios.delete).toHaveBeenCalledWith(
            expect.stringMatching(/\/api\/v2\/nutritiondiary\/9\/$/),
            expect.anything()
        );
    });
});
