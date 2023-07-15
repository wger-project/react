import axios from 'axios';
import { makeHeader, makeUrl } from "utils/url";
import { DiaryEntry, DiaryEntryAdapter } from "components/Nutrition/models/diaryEntry";
import { fetchPaginated } from "utils/requests";
import { API_MAX_PAGE_SIZE } from "utils/consts";

export const API_NUTRITIONAL_DIARY_PATH = 'nutritiondiary';

export const getNutritionalDiaryEntries = async (planId: number): Promise<DiaryEntry[]> => {
    const adapter = new DiaryEntryAdapter();
    const url = makeUrl(API_NUTRITIONAL_DIARY_PATH, { query: { plan: planId, limit: API_MAX_PAGE_SIZE } });
    const out: DiaryEntry[] = [];

    for await  (const page of fetchPaginated(url, makeHeader())) {
        for (const logData of page) {
            out.push(adapter.fromJson(logData));
        }
    }

    return out;
};


export interface AddDiaryEntryParams {
    plan: number,
    meal?: number,
    ingredient: number,
    weight_unit: number,
    datetime: string,
    amount: number
}

export interface EditDiaryEntryParams extends AddDiaryEntryParams {
    id: number,
}

export const addNutritionalDiaryEntry = async (data: AddDiaryEntryParams): Promise<DiaryEntry> => {
    const response = await axios.post(
        makeUrl(API_NUTRITIONAL_DIARY_PATH,),
        // eslint-disable-next-line camelcase
        { plan: data.plan, ingredient: data.ingredient, weight_unit: data.weight_unit, amount: data.amount },
        { headers: makeHeader() }
    );

    return new DiaryEntryAdapter().fromJson(response.data);
};

export const editNutritionalDiaryEntry = async (data: EditDiaryEntryParams): Promise<DiaryEntry> => {
    const response = await axios.patch(
        makeUrl(API_NUTRITIONAL_DIARY_PATH, { id: data.id }),
        // eslint-disable-next-line camelcase
        { plan: data.plan, ingredient: data.ingredient, weight_unit: data.weight_unit, amount: data.amount },
        { headers: makeHeader() }
    );

    return new DiaryEntryAdapter().fromJson(response.data);
};

export const deleteNutritionalDiaryEntry = async (id: number): Promise<void> => {
    await axios.delete(
        makeUrl(API_NUTRITIONAL_DIARY_PATH, { id: id }),
        { headers: makeHeader() },
    );
};
