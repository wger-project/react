import { TEST_NUTRITIONAL_PLAN_1 } from "tests/nutritionTestdata";


describe("Test the nutritional plan model", () => {

    test('correctly calculates the nutritional values for a plan', async () => {

        // Act
        const values = TEST_NUTRITIONAL_PLAN_1.nutritionalValues;
        console.log(values);

        // Assert
        expect(values.energy).toBeCloseTo(3534, 2);
        expect(values.protein).toBeCloseTo(189.56, 2);
        expect(values.carbohydrates).toBeCloseTo(354.16, 2);
        expect(values.carbohydratesSugar).toBeCloseTo(111.76, 2);
        expect(values.fat).toBeCloseTo(165.239, 2);
        expect(values.fatSaturated).toBeCloseTo(90.36, 2);
        expect(values.fibres).toBeCloseTo(214.36, 2);
        expect(values.sodium).toBeCloseTo(0.3296, 2);
    });
});
