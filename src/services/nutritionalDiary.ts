import axios from 'axios';
import { DiaryEntry, DiaryEntryAdapter } from "components/Nutrition/models/diaryEntry";
import { Ingredient } from "components/Nutrition/models/Ingredient";
import { getIngredient } from "services/ingredient";
import { getWeightUnit } from "services/ingredientweightunit";
import { API_MAX_PAGE_SIZE, ApiPath } from "utils/consts";
import { fetchPaginated } from "utils/requests";
import { makeHeader, makeUrl } from "utils/url";


export const getNutritionalDiaryEntries = async (planId: number, ingredientCache: Map<number, Ingredient>): Promise<DiaryEntry[]> => {
    const adapter = new DiaryEntryAdapter();
    const url = makeUrl(ApiPath.NUTRITIONAL_DIARY, { query: { plan: planId, limit: API_MAX_PAGE_SIZE } });
    const out: DiaryEntry[] = [];

    for await (const page of fetchPaginated(url, makeHeader())) {
        for (const logData of page) {
            let entry = adapter.fromJson(logData);

            const responses = await Promise.all([
                ingredientCache.get(entry.ingredientId) !== undefined
                    ? ingredientCache.get(entry.ingredientId)
                    : getIngredient(entry.ingredientId),
                getWeightUnit(entry.weightUnitId)
            ]);
            entry.ingredient = responses[0];
            entry.weightUnit = responses[1];
            out.push(entry);

            ingredientCache.set(entry.ingredientId, entry.ingredient!);
        }
    }
    return out;
};


export interface AddDiaryEntryParams {
    plan: number,
    meal?: number,
    ingredient: number,
    weight_unit: number | null,
    datetime: string,
    amount: number
}

export interface EditDiaryEntryParams extends AddDiaryEntryParams {
    id: number,
}

export const addNutritionalDiaryEntry = async (data: AddDiaryEntryParams): Promise<DiaryEntry> => {
    const response = await axios.post(
        makeUrl(ApiPath.NUTRITIONAL_DIARY),
        // eslint-disable-next-line camelcase
        data,
        { headers: makeHeader() }
    );

    return new DiaryEntryAdapter().fromJson(response.data);
};

export const editNutritionalDiaryEntry = async (data: EditDiaryEntryParams): Promise<DiaryEntry> => {
    const response = await axios.patch(
        makeUrl(ApiPath.NUTRITIONAL_DIARY, { id: data.id }),
        // eslint-disable-next-line camelcase
        data,
        { headers: makeHeader() }
    );

    return new DiaryEntryAdapter().fromJson(response.data);
};

export const deleteNutritionalDiaryEntry = async (id: number): Promise<void> => {
    await axios.delete(
        makeUrl(ApiPath.NUTRITIONAL_DIARY, { id: id }),
        { headers: makeHeader() },
    );
};
