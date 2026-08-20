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

export type MeasurementQueryOptions = {
    filtersetQueryCategories?: object,
}

/**
 * Every entry of a category, over all pages.
 *
 * [limit] stops at that many of the newest ones, in a single request: the
 * server orders by date descending, so a caller that shows the latest handful
 * has no reason to drain a history that runs into thousands of rows.
 */
export const getMeasurementEntries = async (
    categoryId: string,
    filtersetQuery: object = {},
    limit?: number,
): Promise<MeasurementEntry[]> => {
    const url = makeUrl(API_MEASUREMENTS_ENTRY_PATH, {
        query: {
            category: categoryId,
            limit: limit ?? API_MAX_PAGE_SIZE,
            ...filtersetQuery,
        }
    });

    if (limit !== undefined) {
        const { data } = await axios.get(url, { headers: makeHeader() });

        return data.results.map((entryData: unknown) => MeasurementEntry.fromJson(entryData));
    }

    // Collect all pages of entries
    const out: MeasurementEntry[] = [];
    for await (const page of fetchPaginated(url, makeHeader())) {
        for (const entryData of page) {
            out.push(MeasurementEntry.fromJson(entryData));
        }
    }
    return out;
};

/** One page of a category's entries, newest first, as a table pages through them */
export type MeasurementEntryPage = {
    entries: MeasurementEntry[],
    /** Entries the filter matches in total, i.e. how many pages there are */
    count: number,
    /**
     * The entry right after the page, none at the end of the history: the row
     * before it is a difference to it, and it is the one row a page is
     * otherwise missing.
     */
    next: MeasurementEntry | null,
};

/**
 * One page of a category's entries, rather than the history they are cut out
 * of: a table shows ten rows at a time, and a synced category holds thousands.
 */
export const getMeasurementEntryPage = async (
    categoryId: string,
    offset: number,
    limit: number,
    filtersetQuery: object = {},
): Promise<MeasurementEntryPage> => {
    // One row past the page, which is what its last row is measured against
    const url = makeUrl(API_MEASUREMENTS_ENTRY_PATH, {
        query: {
            category: categoryId,
            limit: limit + 1,
            offset: offset,
            ...filtersetQuery,
        }
    });
    const { data } = await axios.get(url, { headers: makeHeader() });
    const entries = data.results.map((entryData: unknown) => MeasurementEntry.fromJson(entryData));

    return {
        entries: entries.slice(0, limit),
        count: data.count,
        next: entries.length > limit ? entries[limit] : null,
    };
};

/** One page of the entries of a group's components, newest first */
export type GroupEntryPage = {
    entries: MeasurementEntry[],
    /** Whether the server held entries back, see groupReadingPage */
    truncated: boolean,
};

/**
 * The entries of a group's components down to {@link before}, the timestamp of
 * the oldest reading already shown. A cursor rather than an offset: the limit
 * cuts entries, which cannot be counted back into whole readings.
 */
export const getGroupEntryPage = async (
    categoryIds: string[],
    limit: number,
    before?: Date,
    filtersetQuery: object = {},
): Promise<GroupEntryPage> => {
    const url = makeUrl(API_MEASUREMENTS_ENTRY_PATH, {
        query: {
            category__in: categoryIds.join(','),
            limit: limit,
            ...(before !== undefined ? { date__lt: before.toISOString() } : {}),
            ...filtersetQuery,
        }
    });
    const { data } = await axios.get(url, { headers: makeHeader() });

    return {
        entries: data.results.map((entryData: unknown) => MeasurementEntry.fromJson(entryData)),
        // What the server itself says is left over, rather than whether the
        // page came back full: it caps `limit` at its own maximum, and a page
        // cut by that cap looks unfilled
        truncated: data.next !== null,
    };
};

/**
 * The newest entries across the given categories, newest first, in a single
 * request.
 *
 * What a card headline needs: for a leaf that is one entry, for a group one
 * per component, since the components of a reading share its timestamp and
 * the latest reading is therefore among the newest [categoryIds.length]
 * entries of the components together.
 */
export const getLatestMeasurementEntries = async (
    categoryIds: string[],
): Promise<MeasurementEntry[]> => {
    const url = makeUrl(API_MEASUREMENTS_ENTRY_PATH, {
        query: {
            category__in: categoryIds.join(','),
            limit: categoryIds.length,
        }
    });
    const { data } = await axios.get(url, { headers: makeHeader() });

    return data.results.map((entryData: unknown) => MeasurementEntry.fromJson(entryData));
};

/**
 * The oldest entry the filter matches, or none at all.
 *
 * The total change of a row is measured against it, so a table that holds a
 * page rather than the whole history has to ask for it: ordered by id as well,
 * since entries can share a date and the column would otherwise pick either.
 */
export const getOldestMeasurementEntry = async (
    categoryId: string,
    filtersetQuery: object = {},
): Promise<MeasurementEntry | null> => {
    const url = makeUrl(API_MEASUREMENTS_ENTRY_PATH, {
        query: {
            category: categoryId,
            limit: 1,
            ordering: 'date,id',
            ...filtersetQuery,
        }
    });
    const { data } = await axios.get(url, { headers: makeHeader() });

    return data.results.length > 0 ? MeasurementEntry.fromJson(data.results[0]) : null;
};

/**
 * The entries of every category at once, for the callers that show a window
 * of time rather than one category: asking per category would be one request
 * each, and would miss the components of a group, which are categories the
 * category list does not return on their own.
 */
export const getAllMeasurementEntries = async (filtersetQuery: object = {}): Promise<MeasurementEntry[]> => {
    const out: MeasurementEntry[] = [];
    const url = makeUrl(API_MEASUREMENTS_ENTRY_PATH, {
        query: {
            limit: API_MAX_PAGE_SIZE,
            ...filtersetQuery,
        }
    });

    for await (const page of fetchPaginated(url, makeHeader())) {
        for (const entryData of page) {
            out.push(MeasurementEntry.fromJson(entryData));
        }
    }
    return out;
};

export const getMeasurementCategories = async (options?: MeasurementQueryOptions): Promise<MeasurementCategory[]> => {
    const { filtersetQueryCategories = {} } = options || {};

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

/** A category, and whether it holds any entries at all */
export type CategoryEntryFlag = {
    category: MeasurementCategory,
    hasEntries: boolean,
}

/**
 * The categories, each with whether it holds entries: what the group picker
 * needs, since only an entry-free category may become a group parent.
 *
 * One entry per category is read to answer it, rather than a history that can
 * run into thousands of rows (the sleep stages alone write five entries a
 * night). The entries themselves are of no interest, so they don't leave here.
 */
export const getCategoryEntryFlags = async (): Promise<CategoryEntryFlag[]> => {
    const categories = await getMeasurementCategories();

    // The list nests the components of a group in their parent, but a
    // component is a category like any other here: it is the one that holds
    // the entries of its group, since a parent never does
    const flat = categories.flatMap(category => [category, ...category.children]);

    return Promise.all(flat.map(async (category) => ({
        category: category,
        hasEntries: (await getMeasurementEntries(category.id!, {}, 1)).length > 0,
    })));
};

export const getMeasurementCategory = async (id: string): Promise<MeasurementCategory> => {
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