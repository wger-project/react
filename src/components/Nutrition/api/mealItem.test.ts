import { addMealItem, deleteMealItem, editMealItem } from "@/components/Nutrition/api/mealItem";
import { MealItem } from "@/components/Nutrition/models/mealItem";
import { RESPONSE_MEAL_ITEM_UUID, RESPONSE_MEAL_UUID, responseMealItemDetail, } from "@/tests/nutritionTestdata";
import axios from "axios";
import type { Mock } from "vitest";

vi.mock("axios");

describe("mealItem service tests", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test("addMealItem POSTs the serialized item and returns the parsed MealItem", async () => {
        const item = new MealItem({
            mealId: RESPONSE_MEAL_UUID,
            ingredientId: 101,
            weightUnitId: null,
            amount: 120,
            order: 3
        });
        (axios.post as Mock).mockResolvedValue({ data: responseMealItemDetail });

        const result = await addMealItem(item);

        expect(axios.post).toHaveBeenCalledTimes(1);
        const [url, body] = (axios.post as Mock).mock.calls[0];
        expect(url).toMatch(/\/api\/v2\/mealitem\/$/);
        expect(body).toMatchObject({
            meal: RESPONSE_MEAL_UUID,
            ingredient: 101,

            weight_unit: null,
            amount: "120",
            order: 3,
        });
        expect(body).not.toHaveProperty("id");
        expect(result).toBeInstanceOf(MealItem);
        expect(result.id).toBe(RESPONSE_MEAL_ITEM_UUID);
    });

    test("editMealItem PATCHes /mealitem/<id>/", async () => {
        const item = new MealItem({
            id: RESPONSE_MEAL_ITEM_UUID,
            mealId: RESPONSE_MEAL_UUID,
            ingredientId: 101,
            weightUnitId: null,
            amount: 99,
            order: 3
        });
        (axios.patch as Mock).mockResolvedValue({ data: { ...responseMealItemDetail, amount: "99.00" } });

        const result = await editMealItem(item);

        expect(axios.patch).toHaveBeenCalledTimes(1);
        const [url, body] = (axios.patch as Mock).mock.calls[0];
        expect(url).toMatch(new RegExp(`/api/v2/mealitem/${RESPONSE_MEAL_ITEM_UUID}/$`));
        expect(body).toMatchObject({ id: RESPONSE_MEAL_ITEM_UUID, amount: "99" });
        expect(result.amount).toBe(99);
    });

    test("deleteMealItem DELETEs /mealitem/<id>/", async () => {
        (axios.delete as Mock).mockResolvedValue({ status: 204 });

        await deleteMealItem(RESPONSE_MEAL_ITEM_UUID);

        expect(axios.delete).toHaveBeenCalledWith(
            expect.stringMatching(new RegExp(`/api/v2/mealitem/${RESPONSE_MEAL_ITEM_UUID}/$`)),
            expect.anything()
        );
    });
});
