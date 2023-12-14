import { NutritionalPlan } from "components/Nutrition/models/nutritionalPlan";
import { TEST_MEAL_1, TEST_NUTRITIONAL_PLAN_1 } from "tests/nutritionTestdata";

jest.useFakeTimers();

describe("Test the nutritional plan model", () => {

    beforeAll(() => {
        jest.setSystemTime(new Date('2023-07-01'));
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    test('correctly calculates the nutritional values logged for today', async () => {

        // Act
        const values = TEST_NUTRITIONAL_PLAN_1.loggedNutritionalValuesToday;

        // Assert
        expect(values.energy).toBeCloseTo(296.7, 2);
        expect(values.protein).toBeCloseTo(13.82, 2);
        expect(values.carbohydrates).toBeCloseTo(80.87, 2);
        expect(values.carbohydratesSugar).toBeCloseTo(44.35, 2);
        expect(values.fat).toBeCloseTo(6.51, 2);
        expect(values.fatSaturated).toBeCloseTo(1.58, 2);
        expect(values.fibres).toBeCloseTo(5.25, 2);
        expect(values.sodium).toBeCloseTo(0.064, 2);
    });

    test('correctly calculates the nutritional values logged on a specific date', async () => {

        // Act
        const values = TEST_NUTRITIONAL_PLAN_1.loggedNutritionalValuesDate(new Date('2023-07-07'));

        // Assert
        expect(values.energy).toBeCloseTo(48, 2);
        expect(values.protein).toBeCloseTo(0.71, 2);
        expect(values.carbohydrates).toBeCloseTo(11.2, 2);
        expect(values.carbohydratesSugar).toBeCloseTo(9.424, 2);
        expect(values.fat).toBeCloseTo(0, 2);
        expect(values.fatSaturated).toBeCloseTo(0, 2);
        expect(values.fibres).toBeCloseTo(0, 2);
        expect(values.sodium).toBeCloseTo(0.0048, 2);
    });

    test('correctly calculates the average nutritional values logged for the last 7 days', async () => {

        // Act
        const values = TEST_NUTRITIONAL_PLAN_1.loggedNutritionalValues7DayAvg;

        // Assert
        expect(values.energy).toBeCloseTo(67.18, 2);
        expect(values.protein).toBeCloseTo(2.73, 2);
        expect(values.carbohydrates).toBeCloseTo(12.105, 2);
        expect(values.carbohydratesSugar).toBeCloseTo(7.73, 2);
        expect(values.fat).toBeCloseTo(1.77, 2);
        expect(values.fatSaturated).toBeCloseTo(0.89, 2);
        expect(values.fibres).toBeCloseTo(2.19, 2);
        expect(values.sodium).toBeCloseTo(0.0085, 2);
    });

    test('correctly calculates the planned nutritional values', async () => {

        // Act
        const values = TEST_NUTRITIONAL_PLAN_1.plannedNutritionalValues;

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
        const values = TEST_NUTRITIONAL_PLAN_1.loggedNutritionalValues7DayAvg;

        // Assert
        expect(values.energy).toBeCloseTo(67.18, 2);
        expect(values.protein).toBeCloseTo(2.731, 2);
        expect(values.carbohydrates).toBeCloseTo(12.105, 2);
        expect(values.carbohydratesSugar).toBeCloseTo(7.733, 2);
        expect(values.fat).toBeCloseTo(1.7675, 2);
        expect(values.fatSaturated).toBeCloseTo(0.89, 2);
        expect(values.fibres).toBeCloseTo(2.1875, 2);
        expect(values.sodium).toBeCloseTo(0.0088, 2);
    });

    test('correctly calculates the average nutritional values for the current day', async () => {

        // Act
        const values = TEST_NUTRITIONAL_PLAN_1.loggedNutritionalValuesToday;

        // Assert
        expect(values.energy).toBeCloseTo(296.7, 2);
        expect(values.protein).toBeCloseTo(13.8199, 2);
        expect(values.carbohydrates).toBeCloseTo(80.87, 2);
        expect(values.carbohydratesSugar).toBeCloseTo(44.34999, 2);
        expect(values.fat).toBeCloseTo(6.51, 2);
        expect(values.fatSaturated).toBeCloseTo(1.58, 2);
        expect(values.fibres).toBeCloseTo(5.25, 2);
        expect(values.sodium).toBeCloseTo(0.064, 2);
    });

    test('correctly groups the diary entries by date', async () => {

        // Act
        const values = TEST_NUTRITIONAL_PLAN_1.groupDiaryEntries;

        // Assert
        expect([...values.keys()]).toStrictEqual([
            "2023-07-01",
            "2023-07-02",
            "2023-07-03",
            "2023-07-04",
            "2023-07-05",
            "2023-07-06",
            "2023-07-07",
            "2023-07-08",
            "2023-06-01",
            "2023-06-15",
            "2023-06-20",
            "2023-08-20",
        ]);
        expect(values.get("2023-07-01")!.entries.length).toBe(3);
        expect(values.get("2023-07-01")!.nutritionalValues.energy).toBeCloseTo(296.7, 2);

        expect(values.get("2023-07-02")!.entries.length).toBe(1);
        expect(values.get("2023-07-02")!.nutritionalValues.energy).toBeCloseTo(12, 2);
    });

    test('correctly generates the synthetic meal entry', async () => {

        // Act
        const meal = TEST_NUTRITIONAL_PLAN_1.pseudoMealOthers('the name');

        // Assert
        expect(meal.id).toBe(-1);
        expect(meal.name).toBe('the name');
        expect(meal.diaryEntries.length).toBe(2);
    });

    test('the planned helper getters work correctly', async () => {

        // Act
        const plan = new NutritionalPlan(
            1,
            new Date(),
            'test 1',
        );

        // Assert
        expect(plan.hasAnyPlanned).toBe(false);

        plan.goalEnergy = 2000;
        expect(plan.hasAnyPlanned).toBe(true);

        plan.goalEnergy = null;
        plan.meals = [TEST_MEAL_1];
        expect(plan.hasAnyPlanned).toBe(true);
    });
});
