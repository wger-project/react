import axios from 'axios';
import { DiaryEntry, DiaryEntryAdapter } from "components/Nutrition/models/diaryEntry";
import { getWeightUnit } from "services/ingredientweightunit";
import { API_MAX_PAGE_SIZE, ApiPath } from "utils/consts";
import { dateToYYYYMMDD } from "utils/date";
import { fetchPaginated } from "utils/requests";
import { makeHeader, makeUrl } from "utils/url";


export const getNutritionalDiaryEntries = async (
    planId: number,
    date?: Date
): Promise<DiaryEntry[]> => {
    const adapter = new DiaryEntryAdapter();

    const query = { plan: planId, limit: API_MAX_PAGE_SIZE };
    if (date) {
        // @ts-ignore
        // eslint-disable-next-line camelcase
        query.datetime__date = dateToYYYYMMDD(date);
    }
    const url = makeUrl(ApiPath.NUTRITIONAL_DIARY, { query: query });
    const out: DiaryEntry[] = [];

    for await (const page of fetchPaginated(url, makeHeader())) {
        for (const logData of page) {
            const entry = adapter.fromJson(logData);

            entry.weightUnit = await getWeightUnit(entry.weightUnitId);
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
