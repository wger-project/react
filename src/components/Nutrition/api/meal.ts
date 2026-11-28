import axios from 'axios';
import { Meal } from "@/components/Nutrition/models/meal";
import { MealItem } from "@/components/Nutrition/models/mealItem";
import { getIngredients } from "@/components/Nutrition/api/ingredient";
import { ApiPath } from "@/core/lib/consts";
import { fetchAll } from "@/core/lib/requests";
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

export const deleteMeal = async (id: string): Promise<void> => {
    await axios.delete(
        makeUrl(ApiPath.MEAL, { id: id }),
        { headers: makeHeader() },
    );
};

export const getMealsForPlan = async (planId: string): Promise<Meal[]> => {

    const meals = await fetchAll(makeUrl(ApiPath.MEAL, { query: { plan: planId } }), Meal.fromJson);
    for (const meal of meals) {
        const ingredientIds: number[] = [];

        const items = await fetchAll(makeUrl(ApiPath.MEAL_ITEM, { query: { meal: meal.id } }), MealItem.fromJson);

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
