import { TEST_NUTRITIONAL_PLAN_1 } from "tests/nutritionTestdata";

jest.useFakeTimers();

describe("Test the nutritional plan model", () => {

    beforeAll(() => {
        jest.setSystemTime(new Date('2023-07-01'));
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    test('correctly calculates the planned nutritional values', async () => {

        // Act
        const values = TEST_NUTRITIONAL_PLAN_1.nutritionalValues;

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

    test('correctly calculates the average nutritional values for the last 7 days', async () => {

        // Act
        const values = TEST_NUTRITIONAL_PLAN_1.nutritionalValues7DayAvg;

        // Assert
        expect(values.energy).toBeCloseTo(53.67, 2);
        expect(values.protein).toBeCloseTo(1.738, 2);
        expect(values.carbohydrates).toBeCloseTo(13.687, 2);
        expect(values.carbohydratesSugar).toBeCloseTo(9.147, 2);
        expect(values.fat).toBeCloseTo(0.651, 2);
        expect(values.fatSaturated).toBeCloseTo(0.158, 2);
        expect(values.fibres).toBeCloseTo(0.525, 2);
        expect(values.sodium).toBeCloseTo(0.0088, 2);
    });

    test('correctly calculates the average nutritional values for the current day', async () => {

        // Act
        const values = TEST_NUTRITIONAL_PLAN_1.nutritionalValuesDiaryToday;

        // Assert
        expect(values.energy).toBeCloseTo(98.8999, 2);
        expect(values.protein).toBeCloseTo(4.606, 2);
        expect(values.carbohydrates).toBeCloseTo(26.9566, 2);
        expect(values.carbohydratesSugar).toBeCloseTo(14.7833, 2);
        expect(values.fat).toBeCloseTo(2.17, 2);
        expect(values.fatSaturated).toBeCloseTo(0.5266, 2);
        expect(values.fibres).toBeCloseTo(1.75, 2);
        expect(values.sodium).toBeCloseTo(0.0213, 2);
    });
});
