import axios from 'axios';
import { ApiMealItemType, ApiMealType } from 'types';
import { makeHeader, makeUrl } from "utils/url";
import { ResponseType } from "services/responseType";
import { Meal, MealAdapter } from "components/Nutrition/models/meal";
import { MealItemAdapter } from "components/Nutrition/models/mealItem";
import { getIngredient } from "services/ingredient";
import { getWeightUnit } from "services/ingredientweightunit";

export const API_MEAL_PATH = 'meal';
export const API_MEAL_ITEM_PATH = 'mealitem';

export const getMealsForPlan = async (planId: number): Promise<Meal[]> => {

    const mealAdapter = new MealAdapter();
    const mealItemAdapter = new MealItemAdapter();
    const { data: receivedMeals } = await axios.get<ResponseType<ApiMealType>>(
        makeUrl(API_MEAL_PATH, { query: { plan: planId } }),
        { headers: makeHeader() },
    );
    const meals = receivedMeals.results.map((meal) => mealAdapter.fromJson(meal));
    for (const meal of meals) {
        const { data: receivedMealItems } = await axios.get<ResponseType<ApiMealItemType>>(
            makeUrl(API_MEAL_ITEM_PATH, { query: { meal: meal.id } }),
            { headers: makeHeader() },
        );

        const items = receivedMealItems.results.map((item) => mealItemAdapter.fromJson(item));
        for (const item of items) {
            const responses = await Promise.all([
                getIngredient(item.ingredientId),
                getWeightUnit(item.weightUnitId)
            ]);
            item.ingredient = responses[0];
            item.weightUnit = responses[1];
        }

        meal.items = items;
    }
    return meals;
};
