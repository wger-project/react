import axios from "axios";
import { MealItem } from "@/components/Nutrition/models/mealItem";
import { addMealItem, deleteMealItem, editMealItem } from "@/components/Nutrition/api/mealItem";
import { responseMealItemDetail } from "@/tests/nutritionTestdata";
import type { Mock } from "vitest";

vi.mock("axios");

describe("mealItem service tests", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test("addMealItem POSTs the serialized item and returns the parsed MealItem", async () => {
        const item = new MealItem({ mealId: 78, ingredientId: 101, weightUnitId: null, amount: 120, order: 3 });
        (axios.post as Mock).mockResolvedValue({ data: responseMealItemDetail });

        const result = await addMealItem(item);

        expect(axios.post).toHaveBeenCalledTimes(1);
        const [url, body] = (axios.post as Mock).mock.calls[0];
        expect(url).toMatch(/\/api\/v2\/mealitem\/$/);
        expect(body).toMatchObject({
            meal: 78,
            ingredient: 101,
            // eslint-disable-next-line camelcase
            weight_unit: null,
            amount: "120",
            order: 3,
        });
        expect(body).not.toHaveProperty("id");
        expect(result).toBeInstanceOf(MealItem);
        expect(result.id).toBe(42);
    });

    test("editMealItem PATCHes /mealitem/<id>/", async () => {
        const item = new MealItem({ id: 42, mealId: 78, ingredientId: 101, weightUnitId: null, amount: 99, order: 3 });
        (axios.patch as Mock).mockResolvedValue({ data: { ...responseMealItemDetail, amount: "99.00" } });

        const result = await editMealItem(item);

        expect(axios.patch).toHaveBeenCalledTimes(1);
        const [url, body] = (axios.patch as Mock).mock.calls[0];
        expect(url).toMatch(/\/api\/v2\/mealitem\/42\/$/);
        expect(body).toMatchObject({ id: 42, amount: "99" });
        expect(result.amount).toBe(99);
    });

    test("deleteMealItem DELETEs /mealitem/<id>/", async () => {
        (axios.delete as Mock).mockResolvedValue({ status: 204 });

        await deleteMealItem(42);

        expect(axios.delete).toHaveBeenCalledWith(
            expect.stringMatching(/\/api\/v2\/mealitem\/42\/$/),
            expect.anything()
        );
    });
});
