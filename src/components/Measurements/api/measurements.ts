import axios from 'axios';
import { MeasurementCategory } from "@/components/Measurements/models/Category";
import { MeasurementEntry } from "@/components/Measurements/models/Entry";
import { ApiMeasurementCategoryType } from '@/types';
import { API_MAX_PAGE_SIZE } from "@/core/lib/consts";
import { fetchPaginated } from '@/core/lib/requests';
import { makeHeader, makeUrl } from "@/core/lib/url";

export const API_MEASUREMENTS_CATEGORY_PATH = 'measurement-category';
export const API_MEASUREMENTS_ENTRY_PATH = 'measurement';

export type MeasurementQueryOptions = {
    filtersetQueryCategories?: object,
    filtersetQueryEntries?: object,
}

export const getMeasurementCategories = async (options?: MeasurementQueryOptions): Promise<MeasurementCategory[]> => {
    const { filtersetQueryCategories = {}, filtersetQueryEntries = {} } = options || {};

    const categories: MeasurementCategory[] = [];
    const categoryUrl = makeUrl(API_MEASUREMENTS_CATEGORY_PATH, {
        query: {
            limit: API_MAX_PAGE_SIZE,
            ...filtersetQueryCategories
        }
    });

    for await (const page of fetchPaginated(categoryUrl, makeHeader())) {
        for (const catData of page) {
            categories.push(MeasurementCategory.fromJson(catData));
        }
    }

    // Load entries for each category
    const entryResponses = categories.map(async (category) => {
        const out: MeasurementEntry[] = [];
        const url = makeUrl(API_MEASUREMENTS_ENTRY_PATH, {
            query: {
                category: category.id,
                limit: API_MAX_PAGE_SIZE,
                ...filtersetQueryEntries,
            }
        });

        // Collect all pages of entries
        for await (const page of fetchPaginated(url, makeHeader())) {
            for (const entries of page) {
                out.push(MeasurementEntry.fromJson(entries));
            }
        }
        return out;
    });
    const settingsResponses = await Promise.all(entryResponses);

    // Save entries to each category
    let categoryId: string;
    settingsResponses.forEach((entries) => {
        if (entries.length > 0) {
            categoryId = entries[0].category;
            categories.findLast(c => c.id === categoryId)!.entries = entries;
        }
    });

    return categories;
};

export const getMeasurementCategory = async (id: string): Promise<MeasurementCategory> => {
    const { data: receivedCategories } = await axios.get<ApiMeasurementCategoryType>(
        makeUrl(API_MEASUREMENTS_CATEGORY_PATH, { id: id }),
        { headers: makeHeader() },
    );

    const category = MeasurementCategory.fromJson(receivedCategories);
    const measurements: MeasurementEntry[] = [];
    const url = makeUrl(API_MEASUREMENTS_ENTRY_PATH, { query: { category: category.id } });

    // Collect all pages of entries
    for await (const page of fetchPaginated(url, makeHeader())) {
        for (const entries of page) {
            measurements.push(MeasurementEntry.fromJson(entries));
        }
    }

    category.entries = measurements;

    return category;
};

export const addMeasurementCategory = async (category: MeasurementCategory): Promise<MeasurementCategory> => {
    const response = await axios.post(
        makeUrl(API_MEASUREMENTS_CATEGORY_PATH,),
        category.toJson(),
        { headers: makeHeader() }
    );

    return MeasurementCategory.fromJson(response.data);
};

export const editMeasurementCategory = async (category: MeasurementCategory): Promise<MeasurementCategory> => {
    const response = await axios.patch(
        makeUrl(API_MEASUREMENTS_CATEGORY_PATH, { id: category.id! }),
        category.toJson(),
        { headers: makeHeader() }
    );

    return MeasurementCategory.fromJson(response.data);
};

export const deleteMeasurementCategory = async (id: string): Promise<void> => {
    await axios.delete(makeUrl(API_MEASUREMENTS_CATEGORY_PATH, { id: id }), { headers: makeHeader() });
};


export const deleteMeasurementEntry = async (id: string): Promise<void> => {
    await axios.delete(makeUrl(API_MEASUREMENTS_ENTRY_PATH, { id: id }), { headers: makeHeader() });
};

export const editMeasurementEntry = async (entry: MeasurementEntry): Promise<MeasurementEntry> => {
    const response = await axios.patch(
        makeUrl(API_MEASUREMENTS_ENTRY_PATH, { id: entry.id! }),
        entry.toJson(),
        { headers: makeHeader() }
    );

    return MeasurementEntry.fromJson(response.data);
};

export const addMeasurementEntry = async (entry: MeasurementEntry): Promise<MeasurementEntry> => {

    const response = await axios.post(
        makeUrl(API_MEASUREMENTS_ENTRY_PATH),
        entry.toJson(),
        { headers: makeHeader() }
    );

    return MeasurementEntry.fromJson(response.data);
};