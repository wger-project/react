import axios from 'axios';
import { DiaryEntry, DiaryEntryAdapter } from "components/Nutrition/models/diaryEntry";
import { getIngredient } from "services/ingredient";
import { getWeightUnit } from "services/ingredientweightunit";
import { API_MAX_PAGE_SIZE, ApiPath } from "utils/consts";
import { fetchPaginated } from "utils/requests";
import { makeHeader, makeUrl } from "utils/url";


export type NutritionalDiaryEntriesOptions = {
    filtersetQuery?: object;
    loadUnit?: true,
    loadIngredient?: true
}

export const getNutritionalDiaryEntries = async (options?: NutritionalDiaryEntriesOptions): Promise<DiaryEntry[]> => {
    const adapter = new DiaryEntryAdapter();
    const { filtersetQuery = {}, loadUnit = true, loadIngredient = true } = options || {};

    const url = makeUrl(ApiPath.NUTRITIONAL_DIARY, {
        query: {
            limit: API_MAX_PAGE_SIZE,
            ...filtersetQuery
        }
    });
    const out: DiaryEntry[] = [];

    for await (const page of fetchPaginated(url, makeHeader())) {
        for (const logData of page) {
            const entry = adapter.fromJson(logData);

            if (loadUnit) {
                entry.weightUnit = await getWeightUnit(entry.weightUnitId);
            }

            if (loadIngredient) {
                entry.ingredient = await getIngredient(entry.ingredientId);
            }
            out.push(entry);
        }
    }
    return out;
};


export interface AddDiaryEntryParams {
    plan: number,
    meal?: number | null,
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
        data,
        { headers: makeHeader() }
    );

    return new DiaryEntryAdapter().fromJson(response.data);
};

export const editNutritionalDiaryEntry = async (data: EditDiaryEntryParams): Promise<DiaryEntry> => {
    const response = await axios.patch(
        makeUrl(ApiPath.NUTRITIONAL_DIARY, { id: data.id }),
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
