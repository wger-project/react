import { NutritionalPlan, PSEUDO_MEAL_ID } from "@/components/Nutrition/models/nutritionalPlan";
import { TEST_DIARY_ENTRY_13, TEST_DIARY_ENTRY_3, TEST_DIARY_ENTRY_4 } from "@/tests/nutritionDiaryTestdata";
import { TEST_MEAL_1, TEST_NUTRITIONAL_PLAN_1 } from "@/tests/nutritionTestdata";
import { yyyymmddToDate } from "@/core/lib/date";


vi.useFakeTimers();

describe("Test the nutritional plan model", () => {

    beforeAll(() => {
        // local midnight, so that "today" is July 1st in every timezone
        vi.setSystemTime(yyyymmddToDate('2023-07-01').getTime());
    });

    afterAll(() => {
        vi.useRealTimers();
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
        expect(values.fiber).toBeCloseTo(5.25, 2);
        expect(values.sodium).toBeCloseTo(0.064, 2);
    });

    test('correctly calculates the nutritional values logged on a specific date', async () => {

        // Act
        const values = TEST_NUTRITIONAL_PLAN_1.loggedNutritionalValuesDate(yyyymmddToDate('2023-07-07'));

        // Assert
        expect(values.energy).toBeCloseTo(48, 2);
        expect(values.protein).toBeCloseTo(0.71, 2);
        expect(values.carbohydrates).toBeCloseTo(11.2, 2);
        expect(values.carbohydratesSugar).toBeCloseTo(9.424, 2);
        expect(values.fat).toBeCloseTo(0, 2);
        expect(values.fatSaturated).toBeCloseTo(0, 2);
        expect(values.fiber).toBeCloseTo(0, 2);
        expect(values.sodium).toBeCloseTo(0.0048, 2);
    });

    test('correctly calculates the average nutritional values logged for the last 7 days', async () => {

        // Act
        const values = TEST_NUTRITIONAL_PLAN_1.loggedNutritionalValues7DayAvg;

        // Assert
        // Of all the entries in the plan only the three from today fall into the
        // window, the others are either older than 7 days or logged for a future date.
        expect(values.energy).toBeCloseTo(296.7 / 7, 5);
        expect(values.protein).toBeCloseTo(13.82 / 7, 5);
        expect(values.carbohydrates).toBeCloseTo(80.87 / 7, 5);
        expect(values.carbohydratesSugar).toBeCloseTo(44.35 / 7, 5);
        expect(values.fat).toBeCloseTo(6.51 / 7, 5);
        expect(values.fatSaturated).toBeCloseTo(1.58 / 7, 5);
        expect(values.fiber).toBeCloseTo(5.25 / 7, 5);
        expect(values.sodium).toBeCloseTo(0.064 / 7, 5);
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
        expect(values.fiber).toBeCloseTo(214.36, 2);
        expect(values.sodium).toBeCloseTo(0.3296, 2);
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

    test('7-day average returns zero values when no entries exist', () => {
        const plan = new NutritionalPlan({
            id: 'aaaaaaaa-0000-0000-0000-000000000001',
            creationDate: new Date(),
            description: 'test'
        });
        const values = plan.loggedNutritionalValues7DayAvg;

        expect(values.energy).toBe(0);
        expect(values.protein).toBe(0);
        expect(values.carbohydrates).toBe(0);
        expect(values.fat).toBe(0);
    });

    test('7-day average divides total by 7 without rounding', () => {
        // INGREDIENT_3: energy=60, protein=0.89, carbs=14, sugar=11.78, sodium=0.006 per 100g
        // ENTRY_3: 200g logged today → energy=120, avg=120/7≈17.143
        const plan = new NutritionalPlan({
            id: 'aaaaaaaa-0000-0000-0000-000000000001',
            creationDate: new Date(),
            description: 'test'
        });
        plan.diaryEntries = [TEST_DIARY_ENTRY_3];

        const values = plan.loggedNutritionalValues7DayAvg;

        expect(values.energy).toBeCloseTo(120 / 7, 5);
        expect(values.protein).toBeCloseTo(1.78 / 7, 5);
        expect(values.carbohydrates).toBeCloseTo(28 / 7, 5);
        expect(values.carbohydratesSugar).toBeCloseTo(23.56 / 7, 5);
        expect(values.sodium).toBeCloseTo(0.012 / 7, 5);
    });

    test('7-day average ignores entries outside the window', () => {
        // ENTRY_3 was logged today, ENTRY_4 is dated tomorrow and ENTRY_13 almost two
        // weeks ago, so only ENTRY_3 may count towards the average.
        const plan = new NutritionalPlan({
            id: 'aaaaaaaa-0000-0000-0000-000000000001',
            creationDate: new Date(),
            description: 'test'
        });
        plan.diaryEntries = [TEST_DIARY_ENTRY_3, TEST_DIARY_ENTRY_4, TEST_DIARY_ENTRY_13];

        const values = plan.loggedNutritionalValues7DayAvg;

        expect(values.energy).toBeCloseTo(120 / 7, 5);
        expect(values.protein).toBeCloseTo(1.78 / 7, 5);
    });

    test('correctly generates the synthetic meal entry', async () => {

        // Act
        const meal = TEST_NUTRITIONAL_PLAN_1.pseudoMealOthers('the name');

        // Assert
        expect(meal.id).toBe(PSEUDO_MEAL_ID);
        expect(meal.name).toBe('the name');
        expect(meal.diaryEntries.length).toBe(2);
    });

    test('the planned helper getters work correctly', async () => {

        // Act
        const plan = new NutritionalPlan({
            id: '00000000-0000-0000-0000-000000000001',
            creationDate: new Date(),
            description: 'test 1',
        });

        // Assert
        expect(plan.hasAnyPlanned).toBe(false);

        plan.goalEnergy = 2000;
        expect(plan.hasAnyPlanned).toBe(true);

        plan.goalEnergy = null;
        plan.meals = [TEST_MEAL_1];
        expect(plan.hasAnyPlanned).toBe(true);
    });
});
