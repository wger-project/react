import axios from 'axios';
import { Meal, MealAdapter } from "components/Nutrition/models/meal";
import { MealItemAdapter } from "components/Nutrition/models/mealItem";
import { getIngredients } from "services/ingredient";
import { getWeightUnit } from "services/ingredientweightunit";
import { ResponseType } from "services/responseType";
import { ApiMealItemType, ApiMealType } from 'types';
import { ApiPath } from "utils/consts";
import { makeHeader, makeUrl } from "utils/url";


export interface AddMealParams {
    plan: number;
    name: string;
    time: string | null;
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

export const getMealsForPlan = async (planId: number): Promise<Meal[]> => {

    let ingredientIds: number[] = [];
    const mealAdapter = new MealAdapter();
    const mealItemAdapter = new MealItemAdapter();
    const { data: receivedMeals } = await axios.get<ResponseType<ApiMealType>>(
        makeUrl(ApiPath.MEAL, { query: { plan: planId } }),
        { headers: makeHeader() },
    );
    const meals = receivedMeals.results.map((meal) => mealAdapter.fromJson(meal));
    for (const meal of meals) {
        ingredientIds = [];

        const { data: receivedMealItems } = await axios.get<ResponseType<ApiMealItemType>>(
            makeUrl(ApiPath.MEAL_ITEM, { query: { meal: meal.id } }),
            { headers: makeHeader() },
        );
        const items = receivedMealItems.results.map((item) => mealItemAdapter.fromJson(item));

        for (const item of items) {
            ingredientIds.push(item.ingredientId);
        }
        const ingredients = await getIngredients(ingredientIds);

        for (const item of items) {
            item.weightUnit = await getWeightUnit(item.weightUnitId);
            item.ingredient = ingredients.find((ingredient) => ingredient.id === item.ingredientId)!;
        }
        meal.items = items;
    }
    return meals;
};
