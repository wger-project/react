import { Meal } from "components/Nutrition/models/meal";
import { TEST_MEAL_1 } from "tests/nutritionTestdata";


describe('Test the meal model', () => {

    test('correctly creates a meal from the API response', () => {
        // Arrange
        const apiResponse = {
            id: 111,
            plan: 1234,
            order: 22,
            time: '22:31',
            name: 'bla bla'
        };

        // Act
        const meal = Meal.fromJson(apiResponse);

        // Assert
        expect(meal.id).toBe(111);
        expect(meal.planId).toBe(1234);
        expect(meal.order).toBe(22);
        expect(meal.name).toBe('bla bla');
        expect(meal.timeHHMMLocale).toBe('10:31 PM');
    });

    test('correctly creates a meal from the API response - no time', () => {
        // Arrange
        const apiResponse = {
            id: 111,
            plan: 1234,
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
        expect(json.time).toBe('12:30');
    });

});
