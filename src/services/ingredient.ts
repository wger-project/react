import axios from 'axios';
import { ApiIngredientType } from 'types';
import { makeHeader, makeUrl } from "utils/url";
import { Ingredient, IngredientAdapter } from "components/Nutrition/models/Ingredient";
import { IngredientSearchResponse, IngredientSearchType } from "services/responseType";

export const API_INGREDIENT_PATH = 'ingredient';

export const INGREDIENT_SEARCH_PATH = API_INGREDIENT_PATH + '/search';


export const getIngredient = async (id: number): Promise<Ingredient> => {
    const { data: receivedIngredient } = await axios.get<ApiIngredientType>(
        makeUrl(API_INGREDIENT_PATH, { id: id }),
        { headers: makeHeader() },
    );

    return new IngredientAdapter().fromJson(receivedIngredient);
};


export const searchIngredient = async (name: string): Promise<IngredientSearchResponse[]> => {
    const url = makeUrl(INGREDIENT_SEARCH_PATH, { query: { term: name } });

    const { data } = await axios.get<IngredientSearchType>(url);
    return data.suggestions;
};