import { MeasurementCategory, MetricType } from "@/components/Measurements/models/Category";
import { MeasurementEntry } from "@/components/Measurements/models/Entry";
import {
    aggregatePerDay,
    averagePerDay,
    buildHeatmapGrid,
    buildHistogram,
    chartPointsFor,
    downsample,
    fillMissingDays,
    heatmapDayAt,
    HEATMAP_MAX_WEEKS,
    groupChart,
    groupComponentSeries,
    groupComponentPoints,
    groupRangeEntries,
    groupReadingPage,
    groupReadings,
    groupStackedEntries,
    movingAverage,
    niceBinWidth,
    overallChange,
    smoothedTrendline,
    stackableComponents,
    weeklyDeltas
} from "@/components/Measurements/charts/data";
import { ChartPoint } from "@/components/Measurements/charts/series";
import { bucketsFor, CategorySeed } from "@/tests/chartQueries";
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

/** A group and the entries its components hold, which are read separately */
type SeededGroup = { group: MeasurementCategory, seeds: CategorySeed[] };

/** The points the aggregated read returns for a group */
const groupPoints = (seeded: SeededGroup) =>
    groupComponentPoints(seeded.group, seeded.seeds.flatMap(seed => bucketsFor(seed)));

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

describe('buildHeatmapGrid', () => {
    // 2 March 2026 is a Monday, 18 March a Wednesday
    const monday = new Date(2026, 2, 2);
    const wednesday = new Date(2026, 2, 18);
    const at = (date: Date, value: number): ChartPoint => ({ date: date.getTime(), value: value });

    test('starts on the Monday of the oldest week and ends with today', () => {
        const grid = buildHeatmapGrid([at(monday, 10), at(wednesday, 20)], HEATMAP_MAX_WEEKS, wednesday);

        expect(grid.start).toEqual(monday.getTime());
        expect(grid.weeks).toEqual(3);
        expect(heatmapDayAt(grid, 2, 2)).toEqual(wednesday.getTime());
    });

    test('leaves days without a measurement empty rather than zero', () => {
        const grid = buildHeatmapGrid([at(monday, 10)], HEATMAP_MAX_WEEKS, monday);

        expect(grid.values.get(heatmapDayAt(grid, 0, 0))).toEqual(10);
        expect(grid.values.get(heatmapDayAt(grid, 0, 1))).toBeUndefined();
    });

    test('runs up to today, so a stretch without measurements stays visible', () => {
        const grid = buildHeatmapGrid([at(monday, 10)], HEATMAP_MAX_WEEKS, wednesday);

        expect(grid.weeks).toEqual(3);
        expect(grid.values.get(heatmapDayAt(grid, 2, 2))).toBeUndefined();
    });

    test('caps a long history at a year of week columns', () => {
        const grid = buildHeatmapGrid(
            [at(new Date(2020, 0, 1), 10), at(wednesday, 20)],
            HEATMAP_MAX_WEEKS,
            wednesday,
        );

        expect(grid.weeks).toEqual(HEATMAP_MAX_WEEKS);
        expect(heatmapDayAt(grid, grid.weeks - 1, 2)).toEqual(wednesday.getTime());
    });

    test('anchors on the last measurement when the history ended long ago', () => {
        // Anchoring on today would put the whole history outside the grid and
        // draw an empty one
        const grid = buildHeatmapGrid(
            [at(monday, 10), at(wednesday, 20)],
            HEATMAP_MAX_WEEKS,
            new Date(2028, 0, 1),
        );

        expect(heatmapDayAt(grid, grid.weeks - 1, 2)).toEqual(wednesday.getTime());
        expect(grid.values.get(wednesday.getTime())).toEqual(20);
    });

    test('takes the top of the colour scale only from the days it shows', () => {
        // A spike outside the window would scale the colours of every visible
        // cell without being visible itself, washing out the whole grid
        const grid = buildHeatmapGrid(
            [at(new Date(2024, 0, 3), 45000), at(wednesday, 8000)],
            HEATMAP_MAX_WEEKS,
            wednesday,
        );

        expect(grid.maxValue).toEqual(8000);
        expect(grid.values.has(new Date(2024, 0, 3).getTime())).toBe(false);
    });

    test('takes the top of the colour scale from the largest value', () => {
        const grid = buildHeatmapGrid(
            [at(monday, 10), at(wednesday, 8000)],
            HEATMAP_MAX_WEEKS,
            wednesday,
        );

        expect(grid.maxValue).toEqual(8000);
    });

    test('is a full grid of the last year when there is nothing to show', () => {
        const grid = buildHeatmapGrid([]);

        expect(grid.weeks).toEqual(HEATMAP_MAX_WEEKS);
        expect(grid.maxValue).toEqual(0);
        expect(grid.values.size).toEqual(0);
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

    const bloodPressure = (readings: [Date, number, number | null][]): SeededGroup => {
        const group = new MeasurementCategory('g-1', 'Blood pressure', 'mmHg', 'blood_pressure');
        const systolic = new MeasurementCategory('c-sys', 'Systolic', 'mmHg', 'custom', false, 'g-1', 0);
        const diastolic = new MeasurementCategory('c-dia', 'Diastolic', 'mmHg', 'custom', false, 'g-1', 1);
        const systolicEntries: MeasurementEntry[] = [];
        const diastolicEntries: MeasurementEntry[] = [];

        for (const [date, high, low] of readings) {
            systolicEntries.push(new MeasurementEntry(null, 'c-sys', date, high, ''));
            if (low !== null) {
                diastolicEntries.push(new MeasurementEntry(null, 'c-dia', date, low, ''));
            }
        }
        group.children = [systolic, diastolic];

        return {
            group: group,
            seeds: [
                { category: systolic, entries: systolicEntries },
                { category: diastolic, entries: diastolicEntries },
            ],
        };
    };

    test('pairs the components of a reading into one range', () => {
        const result = groupRangeEntries(groupPoints(bloodPressure([[day(1), 120, 80]])));

        expect(result).toStrictEqual([{ date: day(1).getTime(), value: 100, min: 80, max: 120 }]);
    });

    test('skips a half reading, it has no range', () => {
        const result = groupRangeEntries(groupPoints(bloodPressure([[day(1), 120, 80], [day(2), 125, null]])));

        expect(result.map(r => r.date)).toEqual([day(1).getTime()]);
    });

    test('sorts the readings chronologically', () => {
        const result = groupRangeEntries(groupPoints(bloodPressure([[day(3), 130, 90], [day(1), 120, 80]])));

        expect(result.map(r => r.max)).toEqual([120, 130]);
    });

    test('reads the low and high end from the values, not from the component order', () => {
        const seeded = bloodPressure([[day(1), 80, 120]]);

        expect(groupRangeEntries(groupPoints(seeded))[0]).toMatchObject({ min: 80, max: 120 });
    });

    test('builds one named component series per child', () => {
        const series = groupComponentSeries(bloodPressure([[day(1), 120, 80]]).group, groupPoints(bloodPressure([[day(1), 120, 80]])));

        expect(series.map(s => s.label)).toEqual(['Systolic', 'Diastolic']);
        expect(series.map(s => s.role)).toEqual(['component', 'component']);
        expect(series[0].points.map(p => p.value)).toEqual([120]);
    });

    test('two components are charted as ranges', () => {
        const chart = groupChart(bloodPressure([[day(1), 120, 80]]).group, groupPoints(bloodPressure([[day(1), 120, 80]])));

        expect(chart.kind).toBe('range');
    });

    test('a group whose readings are all unpaired falls back to component lines', () => {
        const chart = groupChart(
            bloodPressure([[day(1), 120, null], [day(2), 125, null]]).group,
            groupPoints(bloodPressure([[day(1), 120, null], [day(2), 125, null]])),
        );

        expect(chart.kind).toBe('components');
    });

    test('three components cannot be a range', () => {
        const seeded = bloodPressure([[day(1), 120, 80]]);
        const third = new MeasurementCategory('c-map', 'Mean', 'mmHg', 'custom', false, 'g-1', 2);
        const group = seeded.group;
        group.children = [...group.children, third];
        seeded.seeds = [
            ...seeded.seeds,
            { category: third, entries: [new MeasurementEntry(null, 'c-map', day(1), 93, '')] },
        ];

        const chart = groupChart(group, groupPoints(seeded));

        expect(chart.kind).toBe('components');
    });
});

describe('groupReadings', () => {

    const group = () => {
        const bloodPressure = new MeasurementCategory('g-1', 'Blood pressure', 'mmHg', 'blood_pressure');
        bloodPressure.children = [
            new MeasurementCategory('c-sys', 'Systolic', 'mmHg', 'blood_pressure_systolic', false, 'g-1', 0),
            new MeasurementCategory('c-dia', 'Diastolic', 'mmHg', 'blood_pressure_diastolic', false, 'g-1', 1),
        ];
        return bloodPressure;
    };

    /** The entries of one reading, newest first as the API returns them */
    const reading = (date: Date, high: number, low: number | null) => [
        new MeasurementEntry('e-sys', 'c-sys', date, high, ''),
        ...(low === null ? [] : [new MeasurementEntry('e-dia', 'c-dia', date, low, '')]),
    ];

    test('pairs the components sharing a timestamp into one reading', () => {
        const readings = groupReadings(group(), reading(day(1, 8), 120, 80));

        expect(readings).toHaveLength(1);
        expect(readings[0].date).toEqual(day(1, 8));
        expect([...readings[0].values]).toEqual([['c-sys', 120], ['c-dia', 80]]);
    });

    test('keeps a reading only some components reported', () => {
        const readings = groupReadings(group(), reading(day(1, 8), 120, null));

        expect([...readings[0].values]).toEqual([['c-sys', 120]]);
    });

    test('returns the readings newest first', () => {
        const readings = groupReadings(group(), [
            ...reading(day(1, 8), 120, 80),
            ...reading(day(3, 8), 130, 90),
        ]);

        expect(readings.map(r => r.date)).toEqual([day(3, 8), day(1, 8)]);
    });

    test('ignores entries of a category that is not a component', () => {
        const stray = new MeasurementEntry('e-x', 'c-other', day(1, 8), 42, '');

        expect(groupReadings(group(), [stray])).toEqual([]);
    });

    test('reads the values through the unit helper', () => {
        const weight = new MeasurementCategory('g-w', 'Weights', 'kg', 'custom');
        weight.children = [new MeasurementCategory('c-kg', 'Left', 'kg', 'custom', false, 'g-w', 0)];
        const entries = [new MeasurementEntry('e-1', 'c-kg', day(1), 220, '', 'user', { unit: 'lb' })];

        expect([...groupReadings(weight, entries)[0].values]).toEqual([['c-kg', 99.79]]);
    });
});

describe('groupReadingPage', () => {

    const group = () => {
        const bloodPressure = new MeasurementCategory('g-1', 'Blood pressure', 'mmHg', 'blood_pressure');
        bloodPressure.children = [
            new MeasurementCategory('c-sys', 'Systolic', 'mmHg', 'blood_pressure_systolic', false, 'g-1', 0),
            new MeasurementCategory('c-dia', 'Diastolic', 'mmHg', 'blood_pressure_diastolic', false, 'g-1', 1),
        ];
        return bloodPressure;
    };

    /** [count] complete readings, newest first */
    const entriesFor = (count: number) => {
        const entries: MeasurementEntry[] = [];
        for (let index = 0; index < count; index++) {
            entries.push(new MeasurementEntry('e-sys', 'c-sys', day(count - index), 120, ''));
            entries.push(new MeasurementEntry('e-dia', 'c-dia', day(count - index), 80, ''));
        }
        return entries;
    };

    test('hands over what it was given when the page was not truncated', () => {
        const page = groupReadingPage(group(), entriesFor(3), 10, false);

        expect(page.readings).toHaveLength(3);
        expect(page.hasMore).toBe(false);
    });

    test('drops the oldest reading of a truncated page, it may be missing components', () => {
        const page = groupReadingPage(group(), entriesFor(3), 10, true);

        expect(page.readings.map(r => r.date)).toEqual([day(3), day(2)]);
        expect(page.hasMore).toBe(true);
    });

    test('cuts at the page size, and says there is more', () => {
        const page = groupReadingPage(group(), entriesFor(5), 2, false);

        expect(page.readings.map(r => r.date)).toEqual([day(5), day(4)]);
        expect(page.hasMore).toBe(true);
    });

    test('keeps a page holding a single timestamp, there is nothing to drop it for', () => {
        const page = groupReadingPage(group(), entriesFor(1), 10, true);

        expect(page.readings).toHaveLength(1);
        expect(page.hasMore).toBe(true);
    });
});

describe('sleep group', () => {
    /** A sleep group: the total plus two stages, all on the same night */
    const sleep = (withStages: boolean = true): SeededGroup => {
        const group = new MeasurementCategory('g-s', 'Sleep', 'min', 'sleep');
        const child = (
            id: string,
            name: string,
            type: MetricType,
            order: number,
            value: number | null,
        ): CategorySeed => ({
            category: new MeasurementCategory(id, name, 'min', type, false, 'g-s', order),
            entries: value === null
                ? []
                : [new MeasurementEntry(`e-${id}`, id, day(2), value, '')],
        });

        const seeds = [
            child('total', 'Total sleep', 'sleep_total', 0, 480),
            child('deep', 'Deep sleep', 'sleep_deep', 1, withStages ? 90 : null),
            child('rem', 'REM sleep', 'sleep_rem', 2, withStages ? 60 : null),
        ];
        group.children = seeds.map(seed => seed.category);

        return { group: group, seeds: seeds };
    };

    test('the roll-up component is left out of the stack', () => {
        // Total sleep covers the stages, so stacking it would count the night
        // twice
        expect(stackableComponents(sleep().group).map(c => c.metricType))
            .toEqual(['sleep_deep', 'sleep_rem']);
    });

    test('stacked entries carry one value per component and day', () => {
        const seeded = sleep();
        const stacked = groupStackedEntries(stackableComponents(seeded.group), groupPoints(seeded));

        expect(stacked).toStrictEqual([{ date: day(2).getTime(), values: [90, 60] }]);
    });

    test('several entries of one day add up within their component', () => {
        // A nap next to the night: the bar shows the day, not the segment
        const seeded = sleep();
        const deep = seeded.seeds[1];
        deep.entries = [...deep.entries!, new MeasurementEntry('e-nap', 'deep', day(2, 14), 20, '')];

        expect(groupStackedEntries(stackableComponents(seeded.group), groupPoints(seeded))[0].values)
            .toEqual([110, 60]);
    });

    test('a summed group stacks its components', () => {
        const chart = groupChart(sleep().group, groupPoints(sleep()));

        expect(chart.kind).toBe('stacked');
        expect(chart.kind === 'stacked' && chart.labels).toEqual(['Deep sleep', 'REM sleep']);
    });

    test('without stage data the group falls back to component lines', () => {
        // Only the total reported, so there is nothing to stack. Falling
        // through keeps the chart from going blank while data exists
        expect(groupChart(sleep(false).group, groupPoints(sleep(false))).kind).toBe('components');
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
