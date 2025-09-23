import { IngredientAdapter } from "components/Nutrition/models/Ingredient";
import { INGREDIENT_API_RESPONSE } from "tests/api/ingredientInfoEndpoint";


describe('Test the ingredient model', () => {

    test('correctly creates an ingredient from the API response', () => {

        // Act
        const ingredient = new IngredientAdapter().fromJson(INGREDIENT_API_RESPONSE.results[0]);

        // Assert
        expect(ingredient.id).toBe(59197);
        expect(ingredient.name).toBe("10 Fischstäbchen");
        expect(ingredient.image?.url).toBe("http://localhost:8000/media/ingredients/59197/7f4120cd-a5c1-4a3a-b31b-974e62478222.jpg");
    });
});
