import axios from 'axios';
import { ApiIngredientWeightUnitType } from 'types';
import { ResponseType } from "./responseType";
import { makeHeader, makeUrl } from "utils/url";
import { NutritionWeightUnit, NutritionWeightUnitAdapter } from "components/Nutrition/models/weightUnit";

export const API_WEIGHT_UNIT_PATH = 'ingredientweightunit';

export const getWeightUnit = async (unitId: number | null): Promise<NutritionWeightUnit | null> => {
    if (unitId === null) {
        return null;
    }

    const { data: receivedUnit } = await axios.get<ApiIngredientWeightUnitType>(
        makeUrl(API_WEIGHT_UNIT_PATH, { id: unitId }),
        { headers: makeHeader() }
    );
    return new NutritionWeightUnitAdapter().fromJson(receivedUnit);
};

export const getWeightUnits = async (ingredientId: number): Promise<NutritionWeightUnit[]> => {
    const { data: receivedUnits } = await axios.get<ResponseType<ApiIngredientWeightUnitType>>(
        makeUrl(API_WEIGHT_UNIT_PATH, { query: { ingredient: ingredientId } }),
        { headers: makeHeader() }
    );
    const adapter = new NutritionWeightUnitAdapter();
    return receivedUnits.results.map(weight => adapter.fromJson(weight));
};

