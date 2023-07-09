import axios from 'axios';
import { ApiNutritionalPlanType } from 'types';
import { makeHeader, makeUrl } from "utils/url";
import { NutritionalPlan, NutritionalPlanAdapter } from "components/Nutrition/models/nutritionalPlan";
import { ResponseType } from "services/responseType";

export const API_NUTRITIONAL_PLAN_PATH = 'nutritionplan';

export const getNutritionalPlansSparse = async (): Promise<NutritionalPlan[]> => {
    const { data: receivedPlans } = await axios.get<ResponseType<ApiNutritionalPlanType>>(
        makeUrl(API_NUTRITIONAL_PLAN_PATH),
        { headers: makeHeader() },
    );
    const adapter = new NutritionalPlanAdapter();

    return receivedPlans.results.map((plan) => adapter.fromJson(plan));
};
