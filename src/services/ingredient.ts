import axios from 'axios';
import { Ingredient, IngredientAdapter } from "components/Nutrition/models/Ingredient";
import { IngredientSearchResponse, IngredientSearchType, ResponseType } from "services/responseType";
import { ApiIngredientType } from 'types';
import { ApiPath, LANGUAGE_SHORT_ENGLISH } from "utils/consts";
import { makeHeader, makeUrl } from "utils/url";


export const getIngredient = async (id: number): Promise<Ingredient> => {
    const { data: receivedIngredient } = await axios.get<ApiIngredientType>(
        makeUrl(ApiPath.INGREDIENT_PATH, { id: id }),
        { headers: makeHeader() },
    );

    return new IngredientAdapter().fromJson(receivedIngredient);
};

export const getIngredients = async (ids: number[]): Promise<Ingredient[]> => {
    const { data: receivedIngredients } = await axios.get<ResponseType<ApiIngredientType>>(
        // eslint-disable-next-line camelcase
        makeUrl(ApiPath.INGREDIENT_PATH, { query: { id__in: ids.join(',') } }),
        { headers: makeHeader() },
    );

    return receivedIngredients.results.map((meal) => new IngredientAdapter().fromJson(meal));
};


export const searchIngredient = async (name: string, languageCode: string, searchEnglish: boolean = true): Promise<IngredientSearchResponse[]> => {
    const languages = [languageCode];
    if (languageCode !== LANGUAGE_SHORT_ENGLISH && searchEnglish) {
        languages.push(LANGUAGE_SHORT_ENGLISH);
    }

    const url = makeUrl(
        ApiPath.INGREDIENT_SEARCH_PATH,
        { query: { term: name, language: languages.join(',') } }
    );

    const { data } = await axios.get<IngredientSearchType>(url);
    return data.suggestions;
};