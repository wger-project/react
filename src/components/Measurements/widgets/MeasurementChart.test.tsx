import { render } from '@testing-library/react';
import { MeasurementCategory } from "@/components/Measurements/models/Category";
import { MeasurementEntry } from "@/components/Measurements/models/Entry";
import { aggregatePerDay, fillMissingDays, MeasurementChart } from "@/components/Measurements/widgets/MeasurementChart";
import React from 'react';
import { describe, expect, test } from 'vitest';

const entry = (id: string, date: Date, value: number) =>
    new MeasurementEntry(id, 'c-1', date, value, '');

// Recharts only paints SVG content once a ResizeObserver entry reports real
// dimensions, which jsdom does not provide. We therefore only assert the
// charts mount; the aggregation logic is covered separately below.
describe('MeasurementChart', () => {
    test('mounts a line chart for a custom category', () => {
        const category = new MeasurementCategory('c-1', 'Biceps', 'cm', [
            entry('d-1', new Date(2023, 1, 1), 30),
            entry('d-2', new Date(2023, 1, 2), 31),
        ]);

        render(<MeasurementChart category={category} />);
    });

    test('mounts a bar chart for a summed-per-day category', () => {
        const category = new MeasurementCategory('c-1', 'Steps', 'steps', [
            entry('d-1', new Date(2023, 1, 1, 8), 4000),
            entry('d-2', new Date(2023, 1, 1, 18), 6000),
        ], 'steps');

        render(<MeasurementChart category={category} />);
    });

    test('mounts with no entries', () => {
        render(<MeasurementChart category={new MeasurementCategory('c-1', 'Biceps', 'cm')} />);
        render(<MeasurementChart category={new MeasurementCategory('c-2', 'Steps', 'steps', [], 'steps')} />);
    });
});

describe('aggregatePerDay', () => {
    test('returns an empty array for no entries', () => {
        expect(aggregatePerDay([])).toEqual([]);
    });

    test('sums all samples of the same calendar day', () => {
        const result = aggregatePerDay([
            entry('d-1', new Date(2023, 1, 1, 8, 0), 4000),
            entry('d-2', new Date(2023, 1, 1, 18, 30), 6000),
            entry('d-3', new Date(2023, 1, 2, 9, 0), 3000),
        ]);

        expect(result).toEqual([
            { date: new Date(2023, 1, 1).getTime(), value: 10000 },
            { date: new Date(2023, 1, 2).getTime(), value: 3000 },
        ]);
    });

    test('sorts the buckets chronologically', () => {
        const result = aggregatePerDay([
            entry('d-1', new Date(2023, 1, 3), 30),
            entry('d-2', new Date(2023, 1, 1), 10),
            entry('d-3', new Date(2023, 1, 2), 20),
        ]);

        expect(result.map(r => r.value)).toEqual([10, 20, 30]);
    });
});

describe('fillMissingDays', () => {
    test('returns an empty array for no data', () => {
        expect(fillMissingDays([])).toEqual([]);
    });

    test('fills gaps with zero-value days', () => {
        const result = fillMissingDays([
            { date: new Date(2023, 1, 1).getTime(), value: 10 },
            { date: new Date(2023, 1, 4).getTime(), value: 40 },
        ]);

        expect(result).toEqual([
            { date: new Date(2023, 1, 1).getTime(), value: 10 },
            { date: new Date(2023, 1, 2).getTime(), value: 0 },
            { date: new Date(2023, 1, 3).getTime(), value: 0 },
            { date: new Date(2023, 1, 4).getTime(), value: 40 },
        ]);
    });

    test('keeps a contiguous series unchanged', () => {
        const data = [
            { date: new Date(2023, 1, 1).getTime(), value: 10 },
            { date: new Date(2023, 1, 2).getTime(), value: 20 },
        ];

        expect(fillMissingDays(data)).toEqual(data);
    });
});
