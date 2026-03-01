import axios from 'axios';
import { Ingredient } from "components/Nutrition/models/Ingredient";
import { memoize } from "lodash";
import { ApiIngredientType } from 'types';
import { API_RESULTS_PAGE_SIZE, ApiPath, LANGUAGE_SHORT_ENGLISH } from "utils/consts";
import { fetchPaginated } from "utils/requests";
import { makeHeader, makeUrl } from "utils/url";

export type IngredientLanguageFilter = "current" | "current_english" | "all";


/*
 * Memoized version of getIngredient. This caches results in memory for the duration
 * of the app session, which avoids multiple requests for the same ingredient.
 */
export const getIngredient = memoize(async (id: number): Promise<Ingredient> => {
    const { data: receivedIngredient } = await axios.get<ApiIngredientType>(
        makeUrl(ApiPath.INGREDIENTINFO_PATH, { id: id }),
        { headers: makeHeader() },
    );

    return Ingredient.fromJson(receivedIngredient);
});

export const getIngredients = async (ids: number[]): Promise<Ingredient[]> => {

    // If IDs is an empty list, return. Otherwise, the resulting empty id__in will
    // cause the API to not filter at all
    if (ids.length === 0) {
        return [];
    }

    // eslint-disable-next-line camelcase
    const url = makeUrl(ApiPath.INGREDIENTINFO_PATH, { query: { id__in: ids.join(',') } });
    const out: Ingredient[] = [];

    // Collect all the ingredients
    for await (const page of fetchPaginated(url, makeHeader())) {
        for (const logData of page) {
            out.push(Ingredient.fromJson(logData));
        }
    }

    return out;
};


export const searchIngredient = async (
    name: string,
    languageCode: string,
    languageFilter: IngredientLanguageFilter = "current_english",
    isVegan?: boolean,
    isVegetarian?: boolean,
): Promise<Ingredient[]> => {
    const languages = languageFilter === "all" ? null : [languageCode];
    if (languages && languageFilter === "current_english" && languageCode !== LANGUAGE_SHORT_ENGLISH) {
        languages.push(LANGUAGE_SHORT_ENGLISH);
    }

    const query: Record<string, string | number> = {
        'name__search': name,
        'limit': API_RESULTS_PAGE_SIZE,
    };
    if (languages) {
        query['language__code'] = languages.join(',');
    }
    if (isVegan !== undefined) {
        query['is_vegan'] = String(isVegan);
    }
    if (isVegetarian !== undefined) {
        query['is_vegetarian'] = String(isVegetarian);
    }

    const url = makeUrl(ApiPath.INGREDIENTINFO_PATH, { query });

    const { data } = await axios.get(url, { headers: makeHeader() },);
    return data.results.map((entry: ApiIngredientType) => Ingredient.fromJson(entry));
};