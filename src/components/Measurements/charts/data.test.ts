import { MeasurementCategory, MetricType } from "@/components/Measurements/models/Category";
import { MeasurementEntry } from "@/components/Measurements/models/Entry";
import {
    aggregatePerDay,
    chartPointsFor,
    downsample,
    fillMissingDays,
    groupChart,
    groupComponentSeries,
    groupRangeEntries,
    groupStackedEntries,
    moving7dAverage,
    overallChange,
    smoothedTrendline,
    stackableComponents
} from "@/components/Measurements/charts/data";
import { ChartPoint } from "@/components/Measurements/charts/series";
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

describe('moving7dAverage', () => {
    test('returns an empty series unchanged', () => {
        expect(moving7dAverage([])).toEqual([]);
    });

    test('averages over the 7 days preceding each point', () => {
        const result = moving7dAverage([
            point(day(1), 10),
            point(day(2), 20),
            point(day(3), 30),
        ]);

        expect(result.map(p => p.value)).toEqual([10, 15, 20]);
    });

    test('drops points that fell out of the window', () => {
        const result = moving7dAverage([
            point(day(1), 10),
            point(day(20), 30),
            point(day(21), 50),
        ]);

        // the first point is more than 7 days away and no longer counts
        expect(result.map(p => p.value)).toEqual([10, 30, 40]);
    });

    test('sorts the input before averaging', () => {
        const result = moving7dAverage([point(day(2), 20), point(day(1), 10)]);

        expect(result.map(p => p.value)).toEqual([10, 15]);
    });

    test('carries no range, an average has no spread of its own', () => {
        const result = moving7dAverage([{ date: day(1).getTime(), value: 10, min: 5, max: 15 }]);

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

describe('fillMissingDays', () => {
    test('returns an empty array for no data', () => {
        expect(fillMissingDays([])).toEqual([]);
    });

    test('fills gaps with zero-value days', () => {
        const result = fillMissingDays([point(day(1), 10), point(day(4), 40)]);

        expect(result).toEqual([
            { date: day(1).getTime(), value: 10 },
            { date: day(2).getTime(), value: 0 },
            { date: day(3).getTime(), value: 0 },
            { date: day(4).getTime(), value: 40 },
        ]);
    });

    test('keeps a contiguous series unchanged', () => {
        const data = [point(day(1), 10), point(day(2), 20)];

        expect(fillMissingDays(data)).toEqual(data);
    });
});

describe('groups', () => {

    const bloodPressure = (readings: [Date, number, number | null][]) => {
        const group = new MeasurementCategory('g-1', 'Blood pressure', 'mmHg', [], 'blood_pressure');
        const systolic = new MeasurementCategory('c-sys', 'Systolic', 'mmHg', [], 'custom', false, 'g-1', 0);
        const diastolic = new MeasurementCategory('c-dia', 'Diastolic', 'mmHg', [], 'custom', false, 'g-1', 1);

        for (const [date, high, low] of readings) {
            systolic.entries.push(new MeasurementEntry(null, 'c-sys', date, high, ''));
            if (low !== null) {
                diastolic.entries.push(new MeasurementEntry(null, 'c-dia', date, low, ''));
            }
        }
        group.children = [systolic, diastolic];

        return group;
    };

    test('pairs the components of a reading into one range', () => {
        const result = groupRangeEntries(bloodPressure([[day(1), 120, 80]]));

        expect(result).toStrictEqual([{ date: day(1).getTime(), value: 100, min: 80, max: 120 }]);
    });

    test('skips a half reading, it has no range', () => {
        const result = groupRangeEntries(bloodPressure([[day(1), 120, 80], [day(2), 125, null]]));

        expect(result.map(r => r.date)).toEqual([day(1).getTime()]);
    });

    test('sorts the readings chronologically', () => {
        const result = groupRangeEntries(bloodPressure([[day(3), 130, 90], [day(1), 120, 80]]));

        expect(result.map(r => r.max)).toEqual([120, 130]);
    });

    test('reads the low and high end from the values, not from the component order', () => {
        const group = bloodPressure([[day(1), 80, 120]]);

        expect(groupRangeEntries(group)[0]).toMatchObject({ min: 80, max: 120 });
    });

    test('builds one named component series per child', () => {
        const series = groupComponentSeries(bloodPressure([[day(1), 120, 80]]));

        expect(series.map(s => s.label)).toEqual(['Systolic', 'Diastolic']);
        expect(series.map(s => s.role)).toEqual(['component', 'component']);
        expect(series[0].points.map(p => p.value)).toEqual([120]);
    });

    test('two components are charted as ranges', () => {
        const chart = groupChart(bloodPressure([[day(1), 120, 80]]));

        expect(chart.kind).toBe('range');
    });

    test('a group whose readings are all unpaired falls back to component lines', () => {
        const chart = groupChart(bloodPressure([[day(1), 120, null], [day(2), 125, null]]));

        expect(chart.kind).toBe('components');
    });

    test('three components cannot be a range', () => {
        const group = bloodPressure([[day(1), 120, 80]]);
        const third = new MeasurementCategory('c-map', 'Mean', 'mmHg', [], 'custom', false, 'g-1', 2);
        third.entries = [new MeasurementEntry(null, 'c-map', day(1), 93, '')];
        group.children = [...group.children, third];

        const chart = groupChart(group);

        expect(chart.kind).toBe('components');
    });
});

describe('sleep group', () => {
    /** A sleep group: the total plus two stages, all on the same night */
    const sleep = (withStages: boolean = true) => {
        const group = new MeasurementCategory('g-s', 'Sleep', 'min', [], 'sleep');
        const child = (
            id: string,
            name: string,
            type: MetricType,
            order: number,
            value: number | null,
        ) => {
            const category = new MeasurementCategory(id, name, 'min', [], type, false, 'g-s', order);
            category.entries = value === null
                ? []
                : [new MeasurementEntry(`e-${id}`, id, day(2), value, '')];
            return category;
        };

        group.children = [
            child('total', 'Total sleep', 'sleep_total', 0, 480),
            child('deep', 'Deep sleep', 'sleep_deep', 1, withStages ? 90 : null),
            child('rem', 'REM sleep', 'sleep_rem', 2, withStages ? 60 : null),
        ];
        return group;
    };

    test('the roll-up component is left out of the stack', () => {
        // Total sleep covers the stages, so stacking it would count the night
        // twice
        expect(stackableComponents(sleep()).map(c => c.metricType))
            .toEqual(['sleep_deep', 'sleep_rem']);
    });

    test('stacked entries carry one value per component and day', () => {
        const stacked = groupStackedEntries(stackableComponents(sleep()));

        expect(stacked).toStrictEqual([{ date: day(2).getTime(), values: [90, 60] }]);
    });

    test('several entries of one day add up within their component', () => {
        // A nap next to the night: the bar shows the day, not the segment
        const group = sleep();
        const deep = group.children[1];
        deep.entries = [...deep.entries, new MeasurementEntry('e-nap', 'deep', day(2, 14), 20, '')];

        expect(groupStackedEntries(stackableComponents(group))[0].values).toEqual([110, 60]);
    });

    test('a summed group stacks its components', () => {
        const chart = groupChart(sleep());

        expect(chart.kind).toBe('stacked');
        expect(chart.kind === 'stacked' && chart.labels).toEqual(['Deep sleep', 'REM sleep']);
    });

    test('without stage data the group falls back to component lines', () => {
        // Only the total reported, so there is nothing to stack. Falling
        // through keeps the chart from going blank while data exists
        expect(groupChart(sleep(false)).kind).toBe('components');
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
