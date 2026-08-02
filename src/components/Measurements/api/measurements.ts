import axios from 'axios';
import { MeasurementCategory, METRIC_TYPE_BODY_WEIGHT } from "@/components/Measurements/models/Category";
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

/** Every entry of a category, over all pages */
export const getMeasurementEntries = async (categoryId: string, filtersetQuery: object = {}): Promise<MeasurementEntry[]> => {
    const out: MeasurementEntry[] = [];
    const url = makeUrl(API_MEASUREMENTS_ENTRY_PATH, {
        query: {
            category: categoryId,
            limit: API_MAX_PAGE_SIZE,
            ...filtersetQuery,
        }
    });

    // Collect all pages of entries
    for await (const page of fetchPaginated(url, makeHeader())) {
        for (const entryData of page) {
            out.push(MeasurementEntry.fromJson(entryData));
        }
    }
    return out;
};

export const getMeasurementCategories = async (options?: MeasurementQueryOptions): Promise<MeasurementCategory[]> => {
    const { filtersetQueryCategories = {}, filtersetQueryEntries = {} } = options || {};

    let categories: MeasurementCategory[] = [];
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

    // The official body weight category is managed via the body weight screens,
    // don't surface it between the regular measurement categories
    categories = categories.filter(c => !(c.isOfficial && c.metricType === METRIC_TYPE_BODY_WEIGHT));

    // Load entries for each category
    await Promise.all(categories.map(async (category) => {
        category.entries = await getMeasurementEntries(category.id!, filtersetQueryEntries);
    }));

    // Multi-value groups: attach the children to their parent, only the
    // top-level categories are returned
    const byId = new Map(categories.map(c => [c.id, c]));
    for (const category of categories) {
        if (category.parentId !== null) {
            byId.get(category.parentId)?.children.push(category);
        }
    }
    // For children, order is the position within the group (systolic before
    // diastolic); the chart colours the components by that position
    for (const category of categories) {
        category.children.sort((a, b) => a.order - b.order);
    }

    return categories.filter(c => c.parentId === null);
};

export const getMeasurementCategory = async (
    id: string,
    filtersetQueryEntries: object = {},
): Promise<MeasurementCategory> => {
    const { data: receivedCategories } = await axios.get<ApiMeasurementCategoryType>(
        makeUrl(API_MEASUREMENTS_CATEGORY_PATH, { id: id }),
        { headers: makeHeader() },
    );

    const category = MeasurementCategory.fromJson(receivedCategories);

    // Children of a multi-value group; empty for plain categories
    const childrenUrl = makeUrl(API_MEASUREMENTS_CATEGORY_PATH, {
        query: { parent: id, limit: API_MAX_PAGE_SIZE }
    });
    for await (const page of fetchPaginated(childrenUrl, makeHeader())) {
        for (const childData of page) {
            category.children.push(MeasurementCategory.fromJson(childData));
        }
    }
    category.children.sort((a, b) => a.order - b.order);

    await Promise.all([category, ...category.children].map(async (cat) => {
        cat.entries = await getMeasurementEntries(cat.id!, filtersetQueryEntries);
    }));

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

export const updateMeasurementCategoryOrder = async (id: string, order: number): Promise<void> => {
    await axios.patch(
        makeUrl(API_MEASUREMENTS_CATEGORY_PATH, { id: id }),
        { order: order },
        { headers: makeHeader() }
    );
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