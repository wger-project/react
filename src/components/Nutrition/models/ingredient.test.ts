import { Ingredient } from "components/Nutrition/models/Ingredient";
import { INGREDIENT_API_RESPONSE } from "tests/api/ingredientInfoEndpoint";


describe('Test the ingredient model', () => {

    // Note that this also indirectly tests the submodels like IngredientImage
    test('correctly creates an ingredient from the API response', () => {

        // Act
        const ingredient = Ingredient.fromJson(INGREDIENT_API_RESPONSE.results[0]);

        // Assert
        expect(ingredient.id).toBe(59197);
        expect(ingredient.uuid).toBe("c85abb5d-2325-42fa-b497-a0a73f38bc1e");
        expect(ingredient.name).toBe("10 Fischstäbchen");
        expect(ingredient.code).toBe("4250241203517");
        expect(ingredient.energy).toBe(195);
        expect(ingredient.protein).toBe(13.0);
        expect(ingredient.carbohydrates).toBe(18.0);
        expect(ingredient.carbohydratesSugar).toBe(0.8);
        expect(ingredient.fat).toBe(7.7);
        expect(ingredient.fatSaturated).toBe(0.6);
        expect(ingredient.fiber).toBe(0.8);
        expect(ingredient.sodium).toBe(0.356);

        expect(ingredient.image!.url).toBe("http://localhost:8000/media/ingredients/59197/7f4120cd-a5c1-4a3a-b31b-974e62478222.jpg");
        expect(ingredient.image!.uuid).toBe("7f4120cd-a5c1-4a3a-b31b-974e62478222");
        expect(ingredient.image!.size).toBe(304802);
        expect(ingredient.image!.width).toBe(2050);
        expect(ingredient.image!.height).toBe(993);

        expect(ingredient.thumbnails!.small!).toBe("http://localhost:8000/media/ingredients/59197/7f4120cd-a5c1-4a3a-b31b-974e62478222.jpg.200x200_q85.jpg");
        expect(ingredient.thumbnails!.medium!).toBe("http://localhost:8000/media/ingredients/59197/7f4120cd-a5c1-4a3a-b31b-974e62478222.jpg.400x400_q85.jpg");
        expect(ingredient.thumbnails!.large!).toBe("http://localhost:8000/media/ingredients/59197/7f4120cd-a5c1-4a3a-b31b-974e62478222.jpg.800x800_q90.jpg");
    });
});
