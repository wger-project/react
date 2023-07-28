import axios from 'axios';
import { NutritionWeightUnit, NutritionWeightUnitAdapter } from "components/Nutrition/models/weightUnit";
import { ApiIngredientWeightUnitType } from 'types';
import { ApiPath } from "utils/consts";
import { makeHeader, makeUrl } from "utils/url";
import { ResponseType } from "./responseType";


export const getWeightUnit = async (unitId: number | null): Promise<NutritionWeightUnit | null> => {
    if (unitId === null) {
        return null;
    }

    const { data: receivedUnit } = await axios.get<ApiIngredientWeightUnitType>(
        makeUrl(ApiPath.INGREDIENT_WEIGHT_UNIT, { id: unitId }),
        { headers: makeHeader() }
    );
    return new NutritionWeightUnitAdapter().fromJson(receivedUnit);
};

export const getWeightUnits = async (ingredientId: number): Promise<NutritionWeightUnit[]> => {
    const { data: receivedUnits } = await axios.get<ResponseType<ApiIngredientWeightUnitType>>(
        makeUrl(ApiPath.INGREDIENT_WEIGHT_UNIT, { query: { ingredient: ingredientId } }),
        { headers: makeHeader() }
    );
    const adapter = new NutritionWeightUnitAdapter();
    return receivedUnits.results.map(weight => adapter.fromJson(weight));
};

