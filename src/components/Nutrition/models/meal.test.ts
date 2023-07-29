import { MealAdapter } from "components/Nutrition/models/meal";
import { TEST_MEAL_1 } from "tests/nutritionTestdata";


describe('Test the meal model', () => {

    test('correctly creates a meal from the API response', () => {
        // Arrange
        const apiResponse = {
            id: 111,
            order: 22,
            time: '22:31',
            name: 'bla bla'
        };
        const adapter = new MealAdapter();

        // Act
        const meal = adapter.fromJson(apiResponse);

        // Assert
        expect(meal.timeHHMM).toBe('22:31');
    });

    test('correctly creates a meal from the API response - no date', () => {
        // Arrange
        const apiResponse = {
            id: 111,
            order: 22,
            time: null,
            name: 'bla bla'
        };
        const adapter = new MealAdapter();

        // Act
        const meal = adapter.fromJson(apiResponse);

        // Assert
        expect(meal.timeHHMM).toBe(null);
    });

    test('correctly creates a JSON response from a meal', () => {
        // Arrange
        const adapter = new MealAdapter();

        // Act
        const json = adapter.toJson(TEST_MEAL_1);

        // Assert
        expect(json.time).toBe('12:30');
    });

});
