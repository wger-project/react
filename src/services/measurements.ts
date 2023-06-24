import axios from 'axios';
import { ApiMeasurementCategoryType, ApiMeasurementEntryType } from 'types';
import { ResponseType } from "./responseType";
import { makeHeader, makeUrl } from "utils/url";
import { MeasurementCategory, MeasurementCategoryAdapter } from "components/Measurements/models/Category";
import { MeasurementEntry, MeasurementEntryAdapter } from "components/Measurements/models/Entry";
import { dateToYYYYMMDD } from "utils/date";

export const API_MEASUREMENTS_CATEGORY_PATH = 'measurement-category';
export const API_MEASUREMENTS_ENTRY_PATH = 'measurement';


export const getMeasurementCategories = async (): Promise<MeasurementCategory[]> => {
    const url = makeUrl(API_MEASUREMENTS_CATEGORY_PATH);
    const { data: receivedCategories } = await axios.get<ResponseType<ApiMeasurementCategoryType>>(url, {
        headers: makeHeader(),
    });
    const adapter = new MeasurementCategoryAdapter();
    const categories = receivedCategories.results.map(l => adapter.fromJson(l));


    // Load entries for each category
    const entryResponses = categories.map((category) => {
        return axios.get<ResponseType<any>>(
            makeUrl(API_MEASUREMENTS_ENTRY_PATH, { query: { category: category.id } }),
            { headers: makeHeader() },
        );
    });
    const settingsResponses = await Promise.all(entryResponses);

    // Save entries to each category
    let categoryId: number;
    settingsResponses.forEach((response) => {
        const entries = response.data.results.map(l => new MeasurementEntryAdapter().fromJson(l));

        if (entries.length > 0) {
            categoryId = entries[0].category;
            categories.findLast(c => c.id === categoryId)!.entries = entries;
        }
    });

    return categories;
};

export const getMeasurementCategory = async (id: number): Promise<MeasurementCategory> => {
    const { data: receivedCategories } = await axios.get<ApiMeasurementCategoryType>(
        makeUrl(API_MEASUREMENTS_CATEGORY_PATH, { id: id }),
        { headers: makeHeader() },
    );

    const category = new MeasurementCategoryAdapter().fromJson(receivedCategories);

    const url = makeUrl(API_MEASUREMENTS_ENTRY_PATH, { query: { category: id.toString() } });
    const { data: receivedEntries } = await axios.get<ResponseType<ApiMeasurementEntryType>>(url, {
        headers: makeHeader(),
    });
    const adapter = new MeasurementEntryAdapter();
    category.entries = receivedEntries.results.map(l => adapter.fromJson(l));

    return category;
};

export const deleteMeasurementEntry = async (id: number): Promise<void> => {
    await axios.delete(makeUrl(API_MEASUREMENTS_ENTRY_PATH, { id: id }), { headers: makeHeader() });
};

export interface editMeasurementParams {
    id: number,
    categoryId: number;
    date: Date;
    value: number;
    notes: string;
}

export const editMeasurementEntry = async (data: editMeasurementParams): Promise<MeasurementEntry> => {
    const url = makeUrl(API_MEASUREMENTS_ENTRY_PATH, { id: data.id });
    const baseData = {
        category: data.categoryId,
        date: dateToYYYYMMDD(data.date),
        value: data.value,
        notes: data.notes
    };
    const response = await axios.patch(
        url,
        baseData,
        { headers: makeHeader() }
    );

    const adapter = new MeasurementEntryAdapter();
    return adapter.fromJson(response.data);
};