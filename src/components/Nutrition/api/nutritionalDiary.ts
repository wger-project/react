import axios from 'axios';
import { DiaryEntry } from "@/components/Nutrition/models/diaryEntry";
import { getIngredients } from "@/components/Nutrition/api/ingredient";
import { ApiPath } from "@/core/lib/consts";
import { fetchAll } from "@/core/lib/requests";
import { makeHeader, makeUrl } from "@/core/lib/url";


export type NutritionalDiaryEntriesOptions = {
    filtersetQuery?: object;
}

export const getNutritionalDiaryEntries = async (options?: NutritionalDiaryEntriesOptions): Promise<DiaryEntry[]> => {
    const { filtersetQuery = {} } = options || {};

    const out = await fetchAll(makeUrl(ApiPath.NUTRITIONAL_DIARY, { query: filtersetQuery }), DiaryEntry.fromJson);

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

export const deleteNutritionalDiaryEntry = async (id: string): Promise<void> => {
    await axios.delete(
        makeUrl(ApiPath.NUTRITIONAL_DIARY, { id: id }),
        { headers: makeHeader() },
    );
};
