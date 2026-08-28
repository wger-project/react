import { buildHistogram, niceBinWidth } from "@/components/Measurements/charts/histogram";
import { describe, expect, test } from 'vitest';

describe('niceBinWidth', () => {
    test('rounds the span split into ~20 bins up to 1, 2 or 5 times a power of ten', () => {
        // span 14.6 / 20 = 0.73 -> 1, not an edge like 59.3-61.3
        expect(niceBinWidth(59.3, 73.9)).toBe(1);
        // span 30000 / 20 = 1500 -> 2000
        expect(niceBinWidth(0, 30000)).toBe(2000);
        // span 9 / 20 = 0.45 -> 0.5
        expect(niceBinWidth(1, 10)).toBe(0.5);
    });

    test('a span of nothing still has a width', () => {
        expect(niceBinWidth(80, 80)).toBe(1);
    });
});

describe('buildHistogram', () => {
    const counted = (...values: number[]) => values.map(value => ({ value: value, count: 1 }));

    test('aligns the bin edges to round multiples of the width', () => {
        const result = buildHistogram(counted(79.7, 82.3), 0, 0.5);

        expect(result.firstEdge).toBe(79.5);
        expect(result.firstEdge + result.counts.length * result.binWidth).toBe(82.5);
    });

    test('keeps empty bins between the occupied ones, a gap is information', () => {
        const result = buildHistogram(counted(60, 61, 65), 0, 2);

        expect(result.counts).toEqual([2, 0, 1]);
    });

    test('counts a value as often as it occurred', () => {
        // What the aggregated read hands over: a year of readings arrives as
        // the distinct values it covers, with their counts
        const result = buildHistogram([{ value: 60, count: 30 }, { value: 61, count: 5 }], 61, 1);

        expect(result.counts).toEqual([30, 5]);
    });

    test('takes the median of the values, odd and even', () => {
        expect(buildHistogram(counted(60, 62, 70), 70, 2).median).toBe(62);
        expect(buildHistogram(counted(60, 63, 65, 70), 70, 2).median).toBe(64);
    });

    test('the median weighs the counts, not the distinct values', () => {
        // Thirty readings at 60 and one at 90: the middle reading is a 60,
        // which an unweighted median over the two values would miss
        const result = buildHistogram([{ value: 60, count: 30 }, { value: 90, count: 1 }], 90, 10);

        expect(result.median).toBe(60);
    });

    test('derives a width from the span when the type brings none', () => {
        expect(buildHistogram(counted(59.3, 73.9), 0).binWidth).toBe(1);
    });

    test('doubles the width until an outlier no longer stretches it into hundreds of bins', () => {
        // 20 to 350 at 0.5 kg would be 661 bins; doubling keeps the edges round
        const result = buildHistogram(counted(20, 80, 350), 350, 0.5);

        expect(result.binWidth).toBe(4);
        expect(result.counts.length).toBeLessThanOrEqual(100);
        expect(result.counts.reduce((sum, count) => sum + count, 0)).toBe(3);
    });
});
