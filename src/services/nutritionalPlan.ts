import axios from 'axios';
import { NutritionalPlan, NutritionalPlanAdapter } from "components/Nutrition/models/nutritionalPlan";
import { getIngredients } from "services/ingredient";
import { getMealsForPlan } from "services/meal";
import { getNutritionalDiaryEntries } from "services/nutritionalDiary";
import { ResponseType } from "services/responseType";
import { ApiNutritionalPlanType } from 'types';
import { makeHeader, makeUrl } from "utils/url";

export const API_NUTRITIONAL_PLAN_PATH = 'nutritionplan';

export const getNutritionalPlansSparse = async (): Promise<NutritionalPlan[]> => {
    const { data: receivedPlans } = await axios.get<ResponseType<ApiNutritionalPlanType>>(
        makeUrl(API_NUTRITIONAL_PLAN_PATH),
        { headers: makeHeader() },
    );
    const adapter = new NutritionalPlanAdapter();

    return receivedPlans.results.map((plan) => adapter.fromJson(plan));
};

export const getLastNutritionalPlan = async (): Promise<NutritionalPlan | null> => {
    const { data: receivedPlan } = await axios.get<ResponseType<ApiNutritionalPlanType>>(
        makeUrl(API_NUTRITIONAL_PLAN_PATH, { query: { limit: '1' } }),
        { headers: makeHeader() },
    );

    if (receivedPlan.count === 0) {
        return null;
    }

    return await getNutritionalPlanFull(receivedPlan.results[0].id);
};

export const getNutritionalPlanFull = async (id: number | null, date?: Date): Promise<NutritionalPlan | null> => {
    if (id === null) {
        return null;
    }

    const { data: receivedPlan } = await axios.get<ApiNutritionalPlanType>(
        makeUrl(API_NUTRITIONAL_PLAN_PATH, { id: id }),
        { headers: makeHeader() },
    );

    // Collect the ingredient ids from the diary entries
    const ingredientIds: number[] = [];

    const adapter = new NutritionalPlanAdapter();
    const plan = adapter.fromJson(receivedPlan);
    const responses = await Promise.all([
        getMealsForPlan(id),
        getNutritionalDiaryEntries(id, date)
    ]);

    plan.meals = responses[0];
    plan.diaryEntries = responses[1];

    // Fetch and set the ingredients
    plan.diaryEntries.forEach((entry) => {
        if (!ingredientIds.includes(entry.ingredientId)) {
            ingredientIds.push(entry.ingredientId);
        }
    });
    const ingredients = await getIngredients(ingredientIds);
    plan.diaryEntries.forEach((entry) => {
        entry.ingredient = ingredients.find((ingredient) => ingredient.id === entry.ingredientId)!;
    });

    plan.meals.forEach((meal) => {
        meal.diaryEntries = plan.diaryEntries.filter((entry) => entry.mealId === meal.id);
    });

    return plan;
};

export interface AddNutritionalPlanParams {
    description: string;
    only_logging: boolean;
    goal_energy: number | string | null;
    goal_protein: number | string | null;
    goal_carbohydrates: number | string | null;
    goal_fat: number | string | null;
}

export interface EditNutritionalPlanParams extends AddNutritionalPlanParams {
    id: number,
}

export const addNutritionalPlan = async (data: AddNutritionalPlanParams): Promise<NutritionalPlan> => {
    const response = await axios.post(
        makeUrl(API_NUTRITIONAL_PLAN_PATH,),
        data,
        { headers: makeHeader() }
    );

    const adapter = new NutritionalPlanAdapter();
    return adapter.fromJson(response.data);
};

export const editNutritionalPlan = async (data: EditNutritionalPlanParams): Promise<NutritionalPlan> => {
    const response = await axios.patch(
        makeUrl(API_NUTRITIONAL_PLAN_PATH, { id: data.id }),
        data,
        { headers: makeHeader() }
    );

    const adapter = new NutritionalPlanAdapter();
    return adapter.fromJson(response.data);
};

export const deleteNutritionalPlan = async (id: number): Promise<void> => {
    await axios.delete(
        makeUrl(API_NUTRITIONAL_PLAN_PATH, { id: id }),
        { headers: makeHeader() },
    );
};
