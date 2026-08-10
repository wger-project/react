import { MealItem } from "@/components/Nutrition/models/mealItem";
import { TEST_MEAL_ITEM_1, TEST_WEIGHT_UNIT_SLICE } from "@/tests/nutritionTestdata";


describe("Test the meal item model", () => {

    test('correctly uses the weight unit', async () => {
        // Arrange
        // The fixture is shared with the meal and plan tests, so it is cloned
        // instead of modified in place
        const mealItem = MealItem.clone(TEST_MEAL_ITEM_1, { weightUnit: TEST_WEIGHT_UNIT_SLICE });

        // Act
        const values = mealItem.nutritionalValues;

        // Assert
        expect(values.energy).toBeCloseTo(60, 2);
        expect(values.protein).toBeCloseTo(342, 2);
        expect(values.carbohydrates).toBeCloseTo(1116, 2);
        expect(values.carbohydratesSugar).toBeCloseTo(611.999, 2);
        expect(values.fat).toBeCloseTo(198, 2);
        expect(values.fatSaturated).toBeCloseTo(54, 2);
        expect(values.fiber).toBeCloseTo(30, 2);
        expect(values.sodium).toBeCloseTo(2.4, 2);

        // The shared fixture still counts in gram
        expect(TEST_MEAL_ITEM_1.weightUnit).toBeNull();
    });

    test('counts the amount in gram when there is no weight unit', async () => {
        // Act
        const values = TEST_MEAL_ITEM_1.nutritionalValues;

        // Assert
        // INGREDIENT_1 has 1 kcal and 5.7 g protein per 100 g, the item is 120 g
        expect(values.energy).toBeCloseTo(1.2, 2);
        expect(values.protein).toBeCloseTo(6.84, 2);
        expect(values.carbohydrates).toBeCloseTo(22.32, 2);
        expect(values.fat).toBeCloseTo(3.96, 2);
    });
});
