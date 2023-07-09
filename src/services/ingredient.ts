import axios from 'axios';
import { ApiIngredientType } from 'types';
import { makeHeader, makeUrl } from "utils/url";
import { Ingredient, IngredientAdapter } from "components/Nutrition/models/Ingredient";

export const API_INGREDIENT_PATH = 'ingredient';


export const getIngredient = async (id: number): Promise<Ingredient> => {
    const { data: receivedIngredient } = await axios.get<ApiIngredientType>(
        makeUrl(API_INGREDIENT_PATH, { id: id }),
        { headers: makeHeader() },
    );

    return new IngredientAdapter().fromJson(receivedIngredient);
};
