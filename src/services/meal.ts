import axios from 'axios';
import { Ingredient } from "components/Nutrition/models/Ingredient";
import { Meal, MealAdapter } from "components/Nutrition/models/meal";
import { MealItemAdapter } from "components/Nutrition/models/mealItem";
import { getIngredient } from "services/ingredient";
import { getWeightUnit } from "services/ingredientweightunit";
import { ResponseType } from "services/responseType";
import { ApiMealItemType, ApiMealType } from 'types';
import { ApiPath } from "utils/consts";
import { makeHeader, makeUrl } from "utils/url";


export interface AddMealParams {
    plan: number;
    name: string;
    time: string
}

export interface EditMealParams extends AddMealParams {
    id: number,
}


export const addMeal = async (data: AddMealParams): Promise<Meal> => {
    const response = await axios.post(
        makeUrl(ApiPath.MEAL),
        data,
        { headers: makeHeader() }
    );

    const adapter = new MealAdapter();
    return adapter.fromJson(response.data);
};

export const editMeal = async (data: EditMealParams): Promise<Meal> => {
    const response = await axios.patch(
        makeUrl(ApiPath.MEAL, { id: data.id }),
        data,
        { headers: makeHeader() }
    );

    const adapter = new MealAdapter();
    return adapter.fromJson(response.data);
};

export const deleteMeal = async (id: number): Promise<void> => {
    await axios.delete(
        makeUrl(ApiPath.MEAL, { id: id }),
        { headers: makeHeader() },
    );
};

export const getMealsForPlan = async (planId: number, ingredientCache: Map<number, Ingredient>): Promise<Meal[]> => {

    const mealAdapter = new MealAdapter();
    const mealItemAdapter = new MealItemAdapter();
    const { data: receivedMeals } = await axios.get<ResponseType<ApiMealType>>(
        makeUrl(ApiPath.MEAL, { query: { plan: planId } }),
        { headers: makeHeader() },
    );
    const meals = receivedMeals.results.map((meal) => mealAdapter.fromJson(meal));
    for (const meal of meals) {
        const { data: receivedMealItems } = await axios.get<ResponseType<ApiMealItemType>>(
            makeUrl(ApiPath.MEAL_ITEM, { query: { meal: meal.id } }),
            { headers: makeHeader() },
        );

        const items = receivedMealItems.results.map((item) => mealItemAdapter.fromJson(item));
        for (const item of items) {
            const responses = await Promise.all([
                ingredientCache.get(item.ingredientId) !== undefined
                    ? ingredientCache.get(item.ingredientId)
                    : getIngredient(item.ingredientId),
                getWeightUnit(item.weightUnitId)
            ]);
            item.ingredient = responses[0];
            item.weightUnit = responses[1];
            ingredientCache.set(item.ingredientId, item.ingredient!);
        }
        meal.items = items;
    }
    return meals;
};
