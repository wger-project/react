import { MeasurementBucket, MeasurementValueCount } from "@/components/Measurements/models/Bucket";
import { isSummedPerDay, MeasurementCategory } from "@/components/Measurements/models/Category";
import { MeasurementEntry } from "@/components/Measurements/models/Entry";
import {
    useMeasurementBucketsQuery,
    useMeasurementValueCountsQuery
} from "@/components/Measurements/queries";
import type { Mock } from 'vitest';

/**
 * Answers the aggregated chart reads from the entries the [categories] carry.
 *
 * The charts read those separately from the categories in production; a test
 * that seeds one list would otherwise have to build the condensed shapes by
 * hand. One bucket per entry, which is what the server returns for a series
 * short enough not to be condensed, and daily totals for the summed metrics,
 * which it condenses whatever the count.
 */
export const mockChartQueries = (categories: MeasurementCategory[]) => {
    const flat = categories.flatMap(category => [category, ...category.children]);
    const byId = new Map(flat.map(category => [category.id, category]));

    (useMeasurementBucketsQuery as Mock).mockImplementation((ids: string[]) => ({
        data: ids.flatMap(id => bucketsFor(byId.get(id))),
    }));

    (useMeasurementValueCountsQuery as Mock).mockImplementation((id: string) => ({
        data: valueCountsFor(byId.get(id)),
    }));
};

const startOf = (entry: MeasurementEntry, summed: boolean): number => {
    const date = entry.date;

    return summed
        ? new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
        : date.getTime();
};

const groupBy = <T>(items: T[], key: (item: T) => number): Map<number, T[]> => {
    const out = new Map<number, T[]>();
    for (const item of items) {
        out.set(key(item), [...(out.get(key(item)) ?? []), item]);
    }

    return out;
};

/**
 * The buckets the server returns for a category: one per entry, or daily
 * totals for the summed metrics, which it condenses whatever the count.
 */
export const bucketsFor = (category: MeasurementCategory | undefined): MeasurementBucket[] => {
    if (category === undefined) {
        return [];
    }
    const summed = isSummedPerDay(category.metricType);

    return [...groupBy(category.entries, entry => startOf(entry, summed)).entries()]
        .map(([start, entries]) => new MeasurementBucket(
            category.id!,
            new Date(start),
            (entries[0].extraData.unit as string) ?? null,
            entries.length,
            entries.reduce((sum, entry) => sum + entry.value, 0),
            Math.min(...entries.map(entry => (entry.extraData.min as number) ?? entry.value)),
            Math.max(...entries.map(entry => (entry.extraData.max as number) ?? entry.value)),
        ))
        .sort((a, b) => a.start.getTime() - b.start.getTime());
};

const valueCountsFor = (category: MeasurementCategory | undefined): MeasurementValueCount[] => {
    if (category === undefined) {
        return [];
    }
    const summed = isSummedPerDay(category.metricType);

    // A summed metric distributes its daily totals, the sample types every
    // reading, which is the split the server makes
    const values = summed
        ? [...groupBy(category.entries, entry => startOf(entry, true)).values()].map(entries => ({
            value: entries.reduce((sum, entry) => sum + entry.value, 0),
            newest: new Date(Math.max(...entries.map(entry => entry.date.getTime()))),
        }))
        : category.entries.map(entry => ({ value: entry.value, newest: entry.date }));

    return [...groupBy(values, item => item.value).entries()].map(([value, items]) =>
        new MeasurementValueCount(
            category.id!,
            value,
            null,
            items.length,
            new Date(Math.max(...items.map(item => item.newest.getTime()))),
        ));
};
