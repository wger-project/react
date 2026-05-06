import axios from 'axios';
import { DiaryEntry } from "@/components/Nutrition/models/diaryEntry";
import { getIngredients } from "@/services/ingredient";
import { API_MAX_PAGE_SIZE, ApiPath } from "@/utils/consts";
import { fetchPaginated } from "@/utils/requests";
import { makeHeader, makeUrl } from "@/utils/url";


export type NutritionalDiaryEntriesOptions = {
    filtersetQuery?: object;
}

export const getNutritionalDiaryEntries = async (options?: NutritionalDiaryEntriesOptions): Promise<DiaryEntry[]> => {
    const { filtersetQuery = {} } = options || {};

    const url = makeUrl(ApiPath.NUTRITIONAL_DIARY, {
        query: {
            limit: API_MAX_PAGE_SIZE,
            ...filtersetQuery
        }
    });
    const out: DiaryEntry[] = [];

    for await (const page of fetchPaginated(url, makeHeader())) {
        for (const logData of page) {
            out.push(DiaryEntry.fromJson(logData));
        }
    }

    if (out.length === 0) {
        return out;
    }

    const ingredientIds = [...new Set(out.map((entry) => entry.ingredientId))];
    const ingredients = await getIngredients(ingredientIds);
    const ingredientById = new Map(ingredients.map((i) => [i.id, i]));

    for (const entry of out) {
        const ingredient = ingredientById.get(entry.ingredientId) ?? null;
        entry.ingredient = ingredient;
        entry.weightUnit = entry.weightUnitId !== null && ingredient
            ? ingredient.weightUnits.find((u) => u.id === entry.weightUnitId) ?? null
            : null;
    }

    return out;
};


export const addNutritionalDiaryEntry = async (diaryEntry: DiaryEntry): Promise<DiaryEntry> => {
    const response = await axios.post(
        makeUrl(ApiPath.NUTRITIONAL_DIARY),
        diaryEntry.toJson(),
        { headers: makeHeader() }
    );

    return DiaryEntry.fromJson(response.data);
};

export const editNutritionalDiaryEntry = async (diaryEntry: DiaryEntry): Promise<DiaryEntry> => {
    const response = await axios.patch(
        makeUrl(ApiPath.NUTRITIONAL_DIARY, { id: diaryEntry.id! }),
        diaryEntry.toJson(),
        { headers: makeHeader() }
    );

    return DiaryEntry.fromJson(response.data);
};

export const deleteNutritionalDiaryEntry = async (id: number): Promise<void> => {
    await axios.delete(
        makeUrl(ApiPath.NUTRITIONAL_DIARY, { id: id }),
        { headers: makeHeader() },
    );
};
