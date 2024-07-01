import { TEST_MEAL_ITEM_1, TEST_WEIGHT_UNIT_SLICE } from "tests/nutritionTestdata";


describe("Test the meal item model", () => {

    test('correctly uses the weight unit', async () => {
        // Arrange
        TEST_MEAL_ITEM_1.weightUnit = TEST_WEIGHT_UNIT_SLICE;

        // Act
        const values = TEST_MEAL_ITEM_1.nutritionalValues;

        // Assert
        expect(values.energy).toBeCloseTo(60, 2);
        expect(values.protein).toBeCloseTo(342, 2);
        expect(values.carbohydrates).toBeCloseTo(1116, 2);
        expect(values.carbohydratesSugar).toBeCloseTo(611.999, 2);
        expect(values.fat).toBeCloseTo(198, 2);
        expect(values.fatSaturated).toBeCloseTo(54, 2);
        expect(values.fiber).toBeCloseTo(30, 2);
        expect(values.sodium).toBeCloseTo(2.4, 2);
    });
});
