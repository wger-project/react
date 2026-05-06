import axios from "axios";
import { Meal } from "@/components/Nutrition/models/meal";
import { addMeal, deleteMeal, editMeal, getMealsForPlan } from "@/services/meal";
import { getIngredients } from "@/services/ingredient";
import {
    responseMealDetail,
    responseMealItemsForMeal,
    responseMealsForPlan,
} from "@/tests/nutritionTestdata";
import { TEST_INGREDIENT_1, TEST_INGREDIENT_2 } from "@/tests/ingredientTestdata";
import { HHMMToDateTime } from "@/core/lib/date";
import type { Mock } from "vitest";

vi.mock("axios");
vi.mock("@/services/ingredient");

describe("meal service tests", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test("addMeal POSTs the serialized meal and returns the parsed Meal", async () => {
        const meal = new Meal({ planId: 123, order: 2, time: HHMMToDateTime("12:30"), name: "Second breakfast" });
        (axios.post as Mock).mockResolvedValue({ data: responseMealDetail });

        const result = await addMeal(meal);

        expect(axios.post).toHaveBeenCalledTimes(1);
        const [url, body] = (axios.post as Mock).mock.calls[0];
        expect(url).toMatch(/\/api\/v2\/meal\/$/);
        expect(body).toMatchObject({ plan: 123, name: "Second breakfast", order: 2, time: "12:30" });
        // toJson omits the id field when it's null - verify
        expect(body).not.toHaveProperty("id");
        expect(result).toBeInstanceOf(Meal);
        expect(result.id).toBe(78);
    });

    test("editMeal PATCHes /meal/<id>/ and returns the parsed Meal", async () => {
        const meal = new Meal({ id: 78, planId: 123, order: 2, time: HHMMToDateTime("12:30"), name: "renamed" });
        (axios.patch as Mock).mockResolvedValue({ data: { ...responseMealDetail, name: "renamed" } });

        const result = await editMeal(meal);

        expect(axios.patch).toHaveBeenCalledTimes(1);
        const [url, body] = (axios.patch as Mock).mock.calls[0];
        expect(url).toMatch(/\/api\/v2\/meal\/78\/$/);
        expect(body).toMatchObject({ id: 78, name: "renamed" });
        expect(result.name).toBe("renamed");
    });

    test("deleteMeal DELETEs /meal/<id>/", async () => {
        (axios.delete as Mock).mockResolvedValue({ status: 204 });

        await deleteMeal(78);

        expect(axios.delete).toHaveBeenCalledTimes(1);
        expect(axios.delete).toHaveBeenCalledWith(
            expect.stringMatching(/\/api\/v2\/meal\/78\/$/),
            expect.anything()
        );
    });

    test("getMealsForPlan loads each meal's items and wires up the ingredients", async () => {
        // First call: list of meals; subsequent calls: meal items per meal id
        (axios.get as Mock).mockImplementation((url: string) => {
            if (url.includes("/mealitem/")) {
                return Promise.resolve({ data: responseMealItemsForMeal });
            }
            return Promise.resolve({ data: responseMealsForPlan });
        });
        (getIngredients as Mock).mockResolvedValue([TEST_INGREDIENT_1, TEST_INGREDIENT_2]);

        const result = await getMealsForPlan(123);

        // The list call filters by plan, the item call filters by meal
        const calledUrls = (axios.get as Mock).mock.calls.map(([u]) => u as string);
        expect(calledUrls.some(u => u.includes("/meal/?plan=123"))).toBe(true);
        expect(calledUrls.some(u => u.includes("/mealitem/?meal=78"))).toBe(true);

        // getIngredients is called once per meal with the deduped ingredient ids
        expect(getIngredients).toHaveBeenCalledWith([101, 102]);

        expect(result).toHaveLength(1);
        expect(result[0]).toBeInstanceOf(Meal);
        expect(result[0].items).toHaveLength(2);
        // Items are linked back to the matching ingredient by id
        expect(result[0].items[0].ingredient).toBe(TEST_INGREDIENT_1);
        expect(result[0].items[1].ingredient).toBe(TEST_INGREDIENT_2);
        // weightUnit stays null when the item has no weight_unit
        expect(result[0].items[0].weightUnit).toBeNull();
    });

    test("getMealsForPlan returns an empty array when the plan has no meals", async () => {
        (axios.get as Mock).mockResolvedValue({
            data: { count: 0, next: null, previous: null, results: [] },
        });

        const result = await getMealsForPlan(123);

        expect(result).toEqual([]);
        // No item calls, no ingredient lookups
        expect(getIngredients).not.toHaveBeenCalled();
        expect(axios.get).toHaveBeenCalledTimes(1);
    });
});
