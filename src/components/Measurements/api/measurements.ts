import axios from 'axios';
import { MeasurementBucket, MeasurementValueCount } from "@/components/Measurements/models/Bucket";
import { MeasurementCategory, METRIC_TYPE_BODY_WEIGHT } from "@/components/Measurements/models/Category";
import { MeasurementEntry } from "@/components/Measurements/models/Entry";
import { ApiMeasurementCategoryType } from '@/types';
import { API_MAX_PAGE_SIZE } from "@/core/lib/consts";
import { fetchPaginated } from '@/core/lib/requests';
import { makeHeader, makeUrl } from "@/core/lib/url";

export const API_MEASUREMENTS_CATEGORY_PATH = 'measurement-category';
export const API_MEASUREMENTS_ENTRY_PATH = 'measurement';
export const API_MEASUREMENTS_AGGREGATE_PATH = 'measurement/aggregate';
export const API_MEASUREMENTS_VALUE_COUNTS_PATH = 'measurement/value-counts';

/**
 * Calendar unit the server condenses into. 'auto' takes the finest one that
 * keeps the series under the point limit, which is what a line chart wants;
 * the others exist because the chart is built on a unit and coarser points
 * would draw a grid of the wrong cells.
 */
export type BucketLevel = 'auto' | 'hour' | 'day' | 'week' | 'month';

/** The zone the buckets are cut in: a reading half an hour after midnight
 * belongs to the day the user had it, not to the one UTC was on. */
const browserTimezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

/**
 * The entries of one or more categories, condensed into chart points.
 *
 * [categoryIds] takes a group's components in one call, which is what lets the
 * halves of a reading meet on the same bucket.
 */
export const getMeasurementBuckets = async (
    categoryIds: string[],
    level: BucketLevel = 'auto',
    filtersetQuery: object = {},
): Promise<MeasurementBucket[]> => {
    const url = makeUrl(API_MEASUREMENTS_AGGREGATE_PATH, {
        query: {
            category__in: categoryIds.join(','),
            bucket: level,
            tz: browserTimezone(),
            ...filtersetQuery,
        }
    });
    const { data } = await axios.get(url, { headers: makeHeader() });

    return data.map((item: unknown) => MeasurementBucket.fromJson(item));
};

/**
 * How often each value of a category occurred, which is what the histogram
 * bins. [summedPerDay] counts daily totals instead, for the metrics whose
 * samples mean nothing on their own.
 */
export const getMeasurementValueCounts = async (
    categoryId: string,
    summedPerDay: boolean,
    filtersetQuery: object = {},
): Promise<MeasurementValueCount[]> => {
    const url = makeUrl(API_MEASUREMENTS_VALUE_COUNTS_PATH, {
        query: {
            category: categoryId,
            summed_per_day: summedPerDay ? 'true' : 'false',
            tz: browserTimezone(),
            ...filtersetQuery,
        }
    });
    const { data } = await axios.get(url, { headers: makeHeader() });

    return data.map((item: unknown) => MeasurementValueCount.fromJson(item));
};

/**
 * How much of each category's history a caller needs.
 *
 * 'all' is the history the entry filterset asks for. 'probe' fetches a single
 * entry per category, for callers that only ask whether a category holds
 * entries at all: the lists come back truncated, so `entries.length === 0` is
 * the only thing they may be read for. 'none' skips the entries, and with them
 * one request per category, for callers that need the categories themselves.
 */
export type EntryLoading = 'all' | 'probe' | 'none';

export type MeasurementQueryOptions = {
    filtersetQueryCategories?: object,
    filtersetQueryEntries?: object,
    entries?: EntryLoading,
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

/**
 * The first entry of a category, or none: enough to tell an empty category
 * from a filled one without reading a history that can run into thousands of
 * rows (the sleep stages alone write five entries a night).
 */
const probeMeasurementEntries = async (categoryId: string): Promise<MeasurementEntry[]> => {
    const url = makeUrl(API_MEASUREMENTS_ENTRY_PATH, {
        query: { category: categoryId, limit: 1 }
    });
    const { data } = await axios.get(url, { headers: makeHeader() });

    return data.results.map((entryData: unknown) => MeasurementEntry.fromJson(entryData));
};

export const getMeasurementCategories = async (options?: MeasurementQueryOptions): Promise<MeasurementCategory[]> => {
    const {
        filtersetQueryCategories = {},
        filtersetQueryEntries = {},
        entries = 'all',
    } = options || {};

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
    if (entries !== 'none') {
        await Promise.all(categories.map(async (category) => {
            category.entries = entries === 'probe'
                ? await probeMeasurementEntries(category.id!)
                : await getMeasurementEntries(category.id!, filtersetQueryEntries);
        }));
    }

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