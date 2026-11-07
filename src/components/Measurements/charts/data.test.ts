import {
    aggregatePerDay,
    averagePerDay,
    chartPointsFor,
    downsample,
    movingAverage,
    overallChange,
    smoothedTrendline,
    weeklyDeltas
} from "@/components/Measurements/charts/data";
import { ChartPoint } from "@/components/Measurements/charts/series";
import { MeasurementEntry } from "@/components/Measurements/models/Entry";
import { describe, expect, test } from 'vitest';

const entry = (date: Date, value: number, extraData: Record<string, unknown> = {}) =>
    new MeasurementEntry('d-1', 'c-1', date, value, '', 'user', extraData);

const point = (date: Date, value: number): ChartPoint => ({ date: date.getTime(), value: value });

const day = (dayOfMonth: number, hour: number = 0) => new Date(2023, 1, dayOfMonth, hour);

describe('chartPointsFor', () => {
    test('returns the points chronologically', () => {
        const points = chartPointsFor([
            entry(day(3), 30),
            entry(day(1), 10),
            entry(day(2), 20),
        ], 'cm', 'cm');

        expect(points.map(p => p.value)).toEqual([10, 20, 30]);
    });

    test('converts the value into the target unit', () => {
        const points = chartPointsFor([entry(day(1), 176.37, { unit: 'lb' })], 'kg', 'kg');

        expect(points[0].value).toBe(80);
    });

    test('lifts the bounds of a daily aggregate, converted along with the value', () => {
        const points = chartPointsFor(
            [entry(day(1), 176.37, { unit: 'lb', min: 154.32, max: 198.42 })],
            'kg',
            'kg',
        );

        expect(points[0].min).toBe(70);
        expect(points[0].max).toBe(90);
    });

    test('leaves a plain sample without bounds', () => {
        const points = chartPointsFor([entry(day(1), 80)], 'kg', 'kg');

        expect(points[0]).toStrictEqual({ date: day(1).getTime(), value: 80 });
    });

    test('ignores a half-written range', () => {
        const points = chartPointsFor([entry(day(1), 80, { min: 70 })], 'kg', 'kg');

        expect(points[0].min).toBeUndefined();
        expect(points[0].max).toBeUndefined();
    });
});

describe('movingAverage', () => {
    test('returns an empty series unchanged', () => {
        expect(movingAverage([])).toEqual([]);
    });

    test('averages over the 7 days preceding each point', () => {
        const result = movingAverage([
            point(day(1), 10),
            point(day(2), 20),
            point(day(3), 30),
        ]);

        expect(result.map(p => p.value)).toEqual([10, 15, 20]);
    });

    test('drops points that fell out of the window', () => {
        const result = movingAverage([
            point(day(1), 10),
            point(day(20), 30),
            point(day(21), 50),
        ]);

        // the first point is more than 7 days away and no longer counts
        expect(result.map(p => p.value)).toEqual([10, 30, 40]);
    });

    test('sorts the input before averaging', () => {
        const result = movingAverage([point(day(2), 20), point(day(1), 10)]);

        expect(result.map(p => p.value)).toEqual([10, 15]);
    });

    test('a wider window reaches further back', () => {
        const points = [point(day(1), 10), point(day(12), 20)];

        // the first point is outside 7 days but inside 14
        expect(movingAverage(points, 7).map(p => p.value)).toEqual([10, 20]);
        expect(movingAverage(points, 14).map(p => p.value)).toEqual([10, 15]);
    });

    test('carries no range, an average has no spread of its own', () => {
        const result = movingAverage([{ date: day(1).getTime(), value: 10, min: 5, max: 15 }]);

        expect(result[0]).toStrictEqual({ date: day(1).getTime(), value: 10 });
    });
});

describe('smoothedTrendline', () => {
    test('returns an empty series unchanged', () => {
        expect(smoothedTrendline([])).toEqual([]);
    });

    test('is seeded with the first value', () => {
        const result = smoothedTrendline([point(day(1), 10), point(day(2), 20)]);

        expect(result[0].value).toBe(10);
        expect(result[1].value).toBeGreaterThan(10);
        expect(result[1].value).toBeLessThan(20);
    });
});

describe('downsample', () => {
    test('returns a series that already fits unchanged', () => {
        const points = [point(day(1), 10), point(day(2), 20)];

        expect(downsample(points, 200)).toBe(points);
    });

    test('condenses into the finest calendar unit that fits', () => {
        // three samples in each of two hours
        const points = [
            point(day(1, 8), 10), point(day(1, 8), 20), point(day(1, 8), 30),
            point(day(1, 9), 40), point(day(1, 9), 50), point(day(1, 9), 60),
        ];

        const result = downsample(points, 4);

        expect(result.map(p => p.value)).toEqual([20, 50]);
        expect(result.map(p => p.date)).toEqual([day(1, 8).getTime(), day(1, 9).getTime()]);
    });

    test('carries the extremes of the bucket as a range', () => {
        const points = [
            point(day(1, 8), 10), point(day(1, 8), 20), point(day(1, 8), 30),
            point(day(1, 9), 40), point(day(1, 9), 50), point(day(1, 9), 60),
        ];

        const result = downsample(points, 4);

        expect(result[0].min).toBe(10);
        expect(result[0].max).toBe(30);
    });

    test('an already condensed point contributes its bounds, not its value', () => {
        const points = [
            { date: day(1, 8).getTime(), value: 20, min: 5, max: 95 },
            { date: day(1, 8).getTime(), value: 30, min: 25, max: 35 },
            { date: day(1, 9).getTime(), value: 40 },
            { date: day(1, 9).getTime(), value: 50 },
        ];

        const result = downsample(points, 3);

        expect(result[0].min).toBe(5);
        expect(result[0].max).toBe(95);
    });

    test('falls back to coarser units until the series fits', () => {
        // one sample per hour over four days is too many for a per-hour bucket
        const points = [];
        for (let d = 1; d <= 4; d++) {
            for (let hour = 0; hour < 24; hour++) {
                points.push(point(day(d, hour), hour));
            }
        }

        const result = downsample(points, 10);

        expect(result).toHaveLength(4);
        expect(result.map(p => p.date)).toEqual([1, 2, 3, 4].map(d => day(d).getTime()));
    });

    test('returns the coarsest bucketing even when it still exceeds the limit', () => {
        const points = [];
        for (let month = 0; month < 12; month++) {
            points.push({ date: new Date(2023, month, 1).getTime(), value: month });
        }

        expect(downsample(points, 3)).toHaveLength(12);
    });
});

describe('aggregatePerDay', () => {
    test('returns an empty array for no points', () => {
        expect(aggregatePerDay([])).toEqual([]);
    });

    test('sums all samples of the same calendar day', () => {
        const result = aggregatePerDay([
            point(day(1, 8), 4000),
            point(day(1, 18), 6000),
            point(day(2, 9), 3000),
        ]);

        expect(result).toEqual([
            { date: day(1).getTime(), value: 10000 },
            { date: day(2).getTime(), value: 3000 },
        ]);
    });

    test('sorts the buckets chronologically', () => {
        const result = aggregatePerDay([point(day(3), 30), point(day(1), 10), point(day(2), 20)]);

        expect(result.map(r => r.value)).toEqual([10, 20, 30]);
    });
});

describe('averagePerDay', () => {
    test('returns an empty array for no points', () => {
        expect(averagePerDay([])).toEqual([]);
    });

    test('averages all samples of the same calendar day', () => {
        const result = averagePerDay([point(day(1, 8), 80), point(day(1, 18), 82)]);

        expect(result).toEqual([{ date: day(1).getTime(), value: 81 }]);
    });

    test('sorts the buckets chronologically', () => {
        const result = averagePerDay([point(day(3), 30), point(day(1), 10), point(day(2), 20)]);

        expect(result.map(r => r.value)).toEqual([10, 20, 30]);
    });
});

describe('weeklyDeltas', () => {
    // 5 January 2026 is a Monday
    const week = (index: number, dayOfWeek: number = 0) => new Date(2026, 0, 5 + 7 * index + dayOfWeek);

    test('returns an empty array for no points', () => {
        expect(weeklyDeltas([])).toEqual([]);
    });

    test('has no bar for a single week, which has nothing to compare against', () => {
        expect(weeklyDeltas([point(week(0), 80), point(week(0, 2), 81)])).toEqual([]);
    });

    test('subtracts the previous week, dated on the week it belongs to', () => {
        const result = weeklyDeltas([point(week(0), 80), point(week(1), 79), point(week(2), 79.5)]);

        expect(result.map(r => r.date)).toEqual([week(1).getTime(), week(2).getTime()]);
        expect(result.map(r => r.value)).toEqual([-1, 0.5]);
    });

    test('compares the weeks by their average, not by single readings', () => {
        // the low reading is an outlier within its week and must not decide the bar
        const result = weeklyDeltas([
            point(week(0), 80), point(week(0, 3), 82),
            point(week(1), 75), point(week(1, 3), 87),
        ]);

        expect(result.map(r => r.value)).toEqual([0]);
    });

    test('sums the weeks of a metric that is read as a total', () => {
        const result = weeklyDeltas([
            point(week(0), 3000), point(week(0, 1), 4000),
            point(week(1), 9000),
        ], true);

        expect(result.map(r => r.value)).toEqual([2000]);
    });

    test('takes the week after a gap against the last week that has readings', () => {
        // one bar on the week that was measured, holding the whole change, so
        // the bars still add up to the change across the range
        const result = weeklyDeltas([point(week(0), 80), point(week(3), 77)]);

        expect(result).toEqual([{ date: week(3).getTime(), value: -3 }]);
    });

    test('sorts unordered input by week first', () => {
        const result = weeklyDeltas([point(week(1), 79), point(week(0), 80)]);

        expect(result.map(r => r.value)).toEqual([-1]);
    });

    test('leaves the running week out of a summed metric', () => {
        // its total is still growing and would read as a drop until Sunday
        const result = weeklyDeltas(
            [point(week(0), 7000), point(week(1), 3000)],
            true,
            week(1, 2),
        );

        expect(result).toEqual([]);
    });

    test('keeps the running week of an averaged metric', () => {
        const result = weeklyDeltas(
            [point(week(0), 80), point(week(1), 79)],
            false,
            week(1, 2),
        );

        expect(result.map(r => r.value)).toEqual([-1]);
    });
});

describe('overallChange', () => {
    test('is null for an empty series', () => {
        expect(overallChange([])).toBeNull();
    });

    test('is the difference between the first and the last point', () => {
        expect(overallChange([point(day(1), 80), point(day(2), 78)])).toBe(-2);
    });
});
