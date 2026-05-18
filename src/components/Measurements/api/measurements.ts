import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { MeasurementCategory, DynamicMeasurementType } from "@/components/Measurements/models/Category";
import { MeasurementEntry } from "@/components/Measurements/models/Entry";
import { ApiMeasurementCategoryType } from '@/types';
import { API_MAX_PAGE_SIZE } from "@/core/lib/consts";
import { dateToYYYYMMDD } from "@/core/lib/date";
import { fetchPaginated } from '@/core/lib/requests';
import { makeHeader, makeUrl } from "@/core/lib/url";

export const API_MEASUREMENTS_CATEGORY_PATH = 'measurement-category';
export const API_MEASUREMENTS_ENTRY_PATH = 'measurement';

export type MeasurementQueryOptions = {
    filtersetQueryCategories?: object,
    filtersetQueryEntries?: object,
}

export interface DynamicCategory {
    id: number;
    name: string;
    unit: string;
    dynamic_type: DynamicMeasurementType;
}

export const getDynamicCategories = async (): Promise<DynamicCategory[]> => {
    const url = makeUrl(`${API_MEASUREMENTS_CATEGORY_PATH}/dynamic-types`);
    const response = await axios.get(url, { headers: makeHeader() });
    return response.data;
};

export const useDynamicCategoriesQuery = () => {
    return useQuery({
        queryKey: [API_MEASUREMENTS_CATEGORY_PATH, 'dynamic'],
        queryFn: getDynamicCategories
    });
};

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

export interface AddMeasurementCategoryParams {
    name: string;
    unit: string;
    dynamic_type: DynamicMeasurementType;
}

export const addMeasurementCategory = async (data: AddMeasurementCategoryParams): Promise<MeasurementCategory> => {
    const response = await axios.post(
        makeUrl(API_MEASUREMENTS_CATEGORY_PATH),
        {
            name: data.name,
            unit: data.unit,
            dynamic_type: data.dynamic_type // eslint-disable-line camelcase
        },
        { headers: makeHeader() }
    );

    return MeasurementCategory.fromJson(response.data);
};

export interface editMeasurementCategoryParams {
    id: number,
    name: string;
    unit: string;
    dynamic_type: DynamicMeasurementType;
}

export const editMeasurementCategory = async (data: editMeasurementCategoryParams): Promise<MeasurementCategory> => {
    const response = await axios.patch(
        makeUrl(API_MEASUREMENTS_CATEGORY_PATH, { id: data.id }),
        {
            name: data.name,
            unit: data.unit,
            dynamic_type: data.dynamic_type // eslint-disable-line camelcase
        },
        { headers: makeHeader() }
    );

    return MeasurementCategory.fromJson(response.data);
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

    return MeasurementEntry.fromJson(response.data);
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

    return MeasurementEntry.fromJson(response.data);
};