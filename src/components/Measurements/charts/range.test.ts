import {
    displayCutoffFor,
    entryFilterFor,
    fetchCutoffFor
} from "@/components/Measurements/charts/range";
import { describe, expect, test } from 'vitest';

const noon = new Date(2026, 5, 15, 12, 30);

describe('fetchCutoffFor', () => {
    test('fetches the widest average window beyond the cutoff', () => {
        // The first days in range average the days before them, so those have
        // to be fetched as well, and how many depends on a setting this bound
        // must not vary with. Rounding to midnight also makes it immune to the
        // hour the clock change shifts cutoffFor by
        expect(fetchCutoffFor('lastMonth', noon)).toStrictEqual(new Date(2026, 3, 16));
        expect(fetchCutoffFor('last3Months', noon)).toStrictEqual(new Date(2026, 1, 15));
        expect(fetchCutoffFor('lastYear', noon)).toStrictEqual(new Date(2025, 4, 16));
    });

    test('a week is today plus the six days before it', () => {
        // 2026-06-15 minus 6 days minus the 30 day average lead
        expect(fetchCutoffFor('lastWeek', noon)).toStrictEqual(new Date(2026, 4, 10));
        expect(displayCutoffFor('lastWeek', noon)).toStrictEqual(new Date(2026, 5, 9));
    });

    test('is stable across the day, so it can go into a query key', () => {
        // Derived from the current instant it would differ on every render,
        // and the query would refetch forever
        const morning = new Date(2026, 5, 15, 6, 0);
        const evening = new Date(2026, 5, 15, 23, 59);

        expect(fetchCutoffFor('last3Months', morning))
            .toStrictEqual(fetchCutoffFor('last3Months', evening));
    });

    test('the full history is fetched whole', () => {
        expect(fetchCutoffFor('all', noon)).toBeNull();
    });
});

describe('entryFilterFor', () => {
    test('filters the entries by the fetch cutoff', () => {
        expect(entryFilterFor('last3Months', noon))
            .toStrictEqual({ "date__gte": new Date(2026, 1, 15).toISOString() });
    });

    test('the full history needs no filter', () => {
        expect(entryFilterFor('all', noon)).toStrictEqual({});
    });

    test('the display cutoff is the range itself, with no lead', () => {
        // The counted values behind the histogram carry no date and cannot be
        // trimmed afterwards, so reading them with the average lead would bin
        // a month and a half into a chart labelled one month
        const now = new Date(2026, 4, 20, 15, 30);
        const display = displayCutoffFor('lastMonth', now)!;
        const fetch = fetchCutoffFor('lastMonth', now)!;

        expect(display).toStrictEqual(new Date(2026, 3, 20));
        expect(display.getTime()).toBeGreaterThan(fetch.getTime());
    });

    test('both query cutoffs sit at midnight, so they hold across renders', () => {
        const now = new Date(2026, 4, 20, 15, 30);

        for (const cutoff of [displayCutoffFor('lastMonth', now)!, fetchCutoffFor('lastMonth', now)!]) {
            expect(cutoff.getHours()).toBe(0);
            expect(cutoff.getMinutes()).toBe(0);
        }
    });
});
