import axios from 'axios';
import { ApiMealType } from 'types';
import { makeHeader, makeUrl } from "utils/url";
import { NutritionalPlan } from "components/Nutrition/models/nutritionalPlan";
import { ResponseType } from "services/responseType";
import { MealAdapter } from "components/Nutrition/models/meal";

export const API_MEAL_PATH = 'meal';

export const getMealsForPlan = async (planId: string): Promise<NutritionalPlan> => {

    const mealAdapter = new MealAdapter();
    const { data: receivedMeals } = await axios.get<ResponseType<ApiMealType>>(
        makeUrl(API_MEAL_PATH, { query: { plan: planId } }),
        makeHeader()
    );
    const meals = receivedMeals.results.map((meal) => mealAdapter.fromJson(meal));


    return meals;
};
