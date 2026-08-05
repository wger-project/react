import { entryFilterFor, fetchCutoffFor } from "@/components/Measurements/charts/range";
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
});
