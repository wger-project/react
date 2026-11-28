import { Meal } from "@/components/Nutrition/models/meal";
import { TEST_MEAL_1 } from "@/tests/nutritionTestdata";


describe('Test the meal model', () => {

    // Meals and plans are identified by uuids, not by numeric ids
    const MEAL_UUID = 'bbbbbbbb-0000-0000-0000-000000000111';
    const PLAN_UUID = 'aaaaaaaa-0000-0000-0000-000000001234';

    test('correctly creates a meal from the API response', () => {
        // Arrange
        const apiResponse = {
            id: MEAL_UUID,
            plan: PLAN_UUID,
            order: 22,
            time: '22:31',
            name: 'bla bla'
        };

        // Act
        const meal = Meal.fromJson(apiResponse);

        // Assert
        expect(meal.id).toBe(MEAL_UUID);
        expect(meal.planId).toBe(PLAN_UUID);
        expect(meal.order).toBe(22);
        expect(meal.name).toBe('bla bla');
        expect(meal.timeHHMMLocale).toBe('10:31 PM');
    });

    test('correctly creates a meal from the API response - no time', () => {
        // Arrange
        const apiResponse = {
            id: MEAL_UUID,
            plan: PLAN_UUID,
            order: 22,
            time: null,
            name: 'bla bla'
        };

        // Act
        const meal = Meal.fromJson(apiResponse);

        // Assert
        expect(meal.timeHHMMLocale).toBe(null);
    });

    test('correctly creates a JSON response from a meal', () => {

        // Act
        const json = TEST_MEAL_1.toJson();

        // Assert
        expect(json).toEqual({
            id: 'bbbbbbbb-0000-0000-0000-000000000078',
            plan: 'aaaaaaaa-0000-0000-0000-000000000123',
            name: 'Second breakfast',
            order: 2,
            time: '12:30',
        });
    });

    test('omits the id for a meal that was not saved yet', () => {

        // Act
        const json = new Meal({ planId: 'aaaaaaaa-0000-0000-0000-000000000123', name: 'new meal' }).toJson();

        // Assert
        expect(json).not.toHaveProperty('id');
        expect(json.plan).toBe('aaaaaaaa-0000-0000-0000-000000000123');
    });

});
