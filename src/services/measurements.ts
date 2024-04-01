import axios from 'axios';
import { MeasurementCategory, MeasurementCategoryAdapter } from "components/Measurements/models/Category";
import { MeasurementEntry, MeasurementEntryAdapter } from "components/Measurements/models/Entry";
import { ApiMeasurementCategoryType, ApiMeasurementEntryType } from 'types';
import { dateToYYYYMMDD } from "utils/date";
import { makeHeader, makeUrl } from "utils/url";
import { ResponseType } from "./responseType";
import { fetchPaginated } from 'utils/requests';

export const API_MEASUREMENTS_CATEGORY_PATH = 'measurement-category';
export const API_MEASUREMENTS_ENTRY_PATH = 'measurement';


export const getMeasurementCategories = async (): Promise<MeasurementCategory[]> => {
    const adapter = new MeasurementCategoryAdapter();
    const entryAdapter = new MeasurementEntryAdapter();
    const { data: receivedCategories } = await axios.get<ResponseType<ApiMeasurementCategoryType>>(
        makeUrl(API_MEASUREMENTS_CATEGORY_PATH),
        { headers: makeHeader(), }
    );
    const categories = receivedCategories.results.map(l => adapter.fromJson(l));

    // Load entries for each category
    const entryResponses = categories.map(async (category) => {
        const out: MeasurementEntry[] = [];
        const url = makeUrl(API_MEASUREMENTS_ENTRY_PATH, { query: { category: category.id } });

        // Collect all pages of entries
        for await (const page of fetchPaginated(url, makeHeader())) {
            for (const entries of page) {
                out.push(entryAdapter.fromJson(entries));
            }
        }
        return out;
    });
    const settingsResponses = await Promise.all(entryResponses);

    // Save entries to each category
    let categoryId: number;
    settingsResponses.forEach((entries) => {
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

    const { data: receivedEntries } = await axios.get<ResponseType<ApiMeasurementEntryType>>(
        makeUrl(API_MEASUREMENTS_ENTRY_PATH, { query: { category: id.toString() } }),
        { headers: makeHeader(), }
    );
    const adapter = new MeasurementEntryAdapter();
    category.entries = receivedEntries.results.map(l => adapter.fromJson(l));

    return category;
};

export interface AddMeasurementCategoryParams {
    name: string;
    unit: string;
}

export const addMeasurementCategory = async (data: AddMeasurementCategoryParams): Promise<MeasurementCategory> => {
    const response = await axios.post(
        makeUrl(API_MEASUREMENTS_CATEGORY_PATH,),
        {
            name: data.name,
            unit: data.unit
        },
        { headers: makeHeader() }
    );

    const adapter = new MeasurementCategoryAdapter();
    return adapter.fromJson(response.data);
};

export interface editMeasurementCategoryParams {
    id: number,
    name: string;
    unit: string;
}

export const editMeasurementCategory = async (data: editMeasurementCategoryParams): Promise<MeasurementCategory> => {
    const response = await axios.patch(
        makeUrl(API_MEASUREMENTS_CATEGORY_PATH, { id: data.id }),
        {
            name: data.name,
            unit: data.unit
        },
        { headers: makeHeader() }
    );

    const adapter = new MeasurementCategoryAdapter();
    return adapter.fromJson(response.data);
};

export const deleteMeasurementCategory = async (id: number): Promise<void> => {
    await axios.delete(makeUrl(API_MEASUREMENTS_CATEGORY_PATH, { id: id }), { headers: makeHeader() });
};


export const deleteMeasurementEntry = async (id: number): Promise<void> => {
    await axios.delete(makeUrl(API_MEASUREMENTS_ENTRY_PATH, { id: id }), { headers: makeHeader() });
};

export interface editMeasurementParams {
    id: number,
    categoryId?: number,
    date: Date;
    value: number;
    notes: string;
}

export const editMeasurementEntry = async (data: editMeasurementParams): Promise<MeasurementEntry> => {
    const response = await axios.patch(
        makeUrl(API_MEASUREMENTS_ENTRY_PATH, { id: data.id }),
        {
            date: dateToYYYYMMDD(data.date),
            value: data.value,
            notes: data.notes
        },
        { headers: makeHeader() }
    );

    const adapter = new MeasurementEntryAdapter();
    return adapter.fromJson(response.data);
};

export interface AddMeasurementParams {
    categoryId: number;
    date: Date;
    value: number;
    notes: string;
}

export const addMeasurementEntry = async (data: AddMeasurementParams): Promise<MeasurementEntry> => {

    const response = await axios.post(
        makeUrl(API_MEASUREMENTS_ENTRY_PATH),
        {
            category: data.categoryId,
            date: dateToYYYYMMDD(data.date),
            value: data.value,
            notes: data.notes
        },
        { headers: makeHeader() }
    );

    const adapter = new MeasurementEntryAdapter();
    return adapter.fromJson(response.data);
};