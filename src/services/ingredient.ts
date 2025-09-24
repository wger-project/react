import axios from 'axios';
import { Ingredient } from "components/Nutrition/models/Ingredient";
import { ApiIngredientType } from 'types';
import { ApiPath, LANGUAGE_SHORT_ENGLISH } from "utils/consts";
import { fetchPaginated } from "utils/requests";
import { makeHeader, makeUrl } from "utils/url";


export const getIngredient = async (id: number): Promise<Ingredient> => {
    const { data: receivedIngredient } = await axios.get<ApiIngredientType>(
        makeUrl(ApiPath.INGREDIENTINFO_PATH, { id: id }),
        { headers: makeHeader() },
    );

    return Ingredient.fromJson(receivedIngredient);
};

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


export const searchIngredient = async (name: string, languageCode: string, searchEnglish: boolean = true): Promise<Ingredient[]> => {
    // TODO: this currently only converts the results from the new API to the old format
    //       but this should be properly converted.
    //       See also https://github.com/wger-project/wger/pull/1724


    const languages = [languageCode];
    if (languageCode !== LANGUAGE_SHORT_ENGLISH && searchEnglish) {
        languages.push(LANGUAGE_SHORT_ENGLISH);
    }

    const url = makeUrl(
        ApiPath.INGREDIENTINFO_PATH,
        // eslint-disable-next-line camelcase
        { query: { name__search: name, language__code: languages.join(',') } }
    );

    const { data } = await axios.get(url);
    return data.results.map((entry: ApiIngredientType) => Ingredient.fromJson(entry));
};