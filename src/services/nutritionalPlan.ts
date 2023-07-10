import axios from 'axios';
import { ApiNutritionalPlanType } from 'types';
import { makeHeader, makeUrl } from "utils/url";
import { NutritionalPlan, NutritionalPlanAdapter } from "components/Nutrition/models/nutritionalPlan";
import { ResponseType } from "services/responseType";
import { getMealsForPlan } from "services/meal";

export const API_NUTRITIONAL_PLAN_PATH = 'nutritionplan';

export const getNutritionalPlansSparse = async (): Promise<NutritionalPlan[]> => {
    const { data: receivedPlans } = await axios.get<ResponseType<ApiNutritionalPlanType>>(
        makeUrl(API_NUTRITIONAL_PLAN_PATH),
        { headers: makeHeader() },
    );
    const adapter = new NutritionalPlanAdapter();

    return receivedPlans.results.map((plan) => adapter.fromJson(plan));
};

export const getNutritionalPlanFull = async (id: number): Promise<NutritionalPlan> => {
    const { data: receivedPlan } = await axios.get<ApiNutritionalPlanType>(
        makeUrl(API_NUTRITIONAL_PLAN_PATH, { id: id }),
        { headers: makeHeader() },
    );
    const adapter = new NutritionalPlanAdapter();
    const plan = adapter.fromJson(receivedPlan);
    plan.meals = await getMealsForPlan(id);
    return plan;
};

export interface addNutritionalPlanParams {
    description: string;
}

export interface editNutritionalPlanParams {
    id: number,
    description: string;
}

export const addNutritionalPlan = async (data: addNutritionalPlanParams): Promise<NutritionalPlan> => {
    const response = await axios.post(
        makeUrl(API_NUTRITIONAL_PLAN_PATH,),
        { description: data.description, },
        { headers: makeHeader() }
    );

    const adapter = new NutritionalPlanAdapter();
    return adapter.fromJson(response.data);
};

export const editNutritionalPlan = async (data: editNutritionalPlanParams): Promise<NutritionalPlan> => {
    const response = await axios.patch(
        makeUrl(API_NUTRITIONAL_PLAN_PATH, { id: data.id }),
        { description: data.description, },
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
