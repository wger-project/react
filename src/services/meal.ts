import axios from 'axios';
import { ApiMealType, Meal } from "@/components/Nutrition/models/meal";
import { ApiMealItemType, MealItem } from "@/components/Nutrition/models/mealItem";
import { getIngredients } from "@/services/ingredient";
import { ResponseType } from "@/services/responseType";
import { ApiPath } from "@/core/lib/consts";
import { makeHeader, makeUrl } from "@/core/lib/url";


export const addMeal = async (meal: Meal): Promise<Meal> => {
    const response = await axios.post(
        makeUrl(ApiPath.MEAL),
        meal.toJson(),
        { headers: makeHeader() }
    );

    return Meal.fromJson(response.data);
};

export const editMeal = async (meal: Meal): Promise<Meal> => {
    const response = await axios.patch(
        makeUrl(ApiPath.MEAL, { id: meal.id! }),
        meal.toJson(),
        { headers: makeHeader() }
    );

    return Meal.fromJson(response.data);
};

export const deleteMeal = async (id: number): Promise<void> => {
    await axios.delete(
        makeUrl(ApiPath.MEAL, { id: id }),
        { headers: makeHeader() },
    );
};

export const getMealsForPlan = async (planId: number): Promise<Meal[]> => {

    let ingredientIds: number[] = [];
    const { data: receivedMeals } = await axios.get<ResponseType<ApiMealType>>(
        makeUrl(ApiPath.MEAL, { query: { plan: planId } }),
        { headers: makeHeader() },
    );
    const meals = receivedMeals.results.map((meal) => Meal.fromJson(meal));
    for (const meal of meals) {
        ingredientIds = [];

        const { data: receivedMealItems } = await axios.get<ResponseType<ApiMealItemType>>(
            makeUrl(ApiPath.MEAL_ITEM, { query: { meal: meal.id } }),
            { headers: makeHeader() },
        );
        const items = receivedMealItems.results.map((item) => MealItem.fromJson(item));

        for (const item of items) {
            ingredientIds.push(item.ingredientId);
        }
        const ingredients = await getIngredients(ingredientIds);

        for (const item of items) {
            item.ingredient = ingredients.find((ingredient) => ingredient.id === item.ingredientId)!;
            item.weightUnit = item.weightUnitId !== null
                ? item.ingredient?.weightUnits.find((u) => u.id === item.weightUnitId) ?? null
                : null;
        }
        meal.items = items;
    }
    return meals;
};
