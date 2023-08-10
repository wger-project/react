import axios from 'axios';
import { Ingredient } from "components/Nutrition/models/Ingredient";
import { NutritionalPlan, NutritionalPlanAdapter } from "components/Nutrition/models/nutritionalPlan";
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

export const getNutritionalPlanFull = async (id: number, date?: Date): Promise<NutritionalPlan> => {
    const { data: receivedPlan } = await axios.get<ApiNutritionalPlanType>(
        makeUrl(API_NUTRITIONAL_PLAN_PATH, { id: id }),
        { headers: makeHeader() },
    );

    // Poor man's cache. This doesn't catch everything, but it does reduce the nr of requests
    const ingredientCache = new Map<number, Ingredient>();

    const adapter = new NutritionalPlanAdapter();
    const plan = adapter.fromJson(receivedPlan);
    const responses = await Promise.all([
        getMealsForPlan(id, ingredientCache),
        getNutritionalDiaryEntries(id, ingredientCache, date)
    ]);

    plan.meals = responses[0];
    plan.diaryEntries = responses[1];
    plan.meals.forEach((meal) => {
        meal.diaryEntries = plan.diaryEntries.filter((entry) => entry.mealId === meal.id);
    });

    return plan;
};

export interface AddNutritionalPlanParams {
    description: string;
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
