import {
    groupChart,
    groupComponentPoints,
    groupComponentSeries,
    groupRangeEntries,
    groupReadingPage,
    groupReadings,
    groupStackedEntries,
    measurementSeries,
    stackableComponents,
} from "@/components/Measurements/charts/groups";
import { ChartPoint } from "@/components/Measurements/charts/series";
import { MeasurementCategory, MetricType } from "@/components/Measurements/models/Category";
import { MeasurementEntry } from "@/components/Measurements/models/Entry";
import { bucketsFor, CategorySeed } from "@/tests/chartQueries";
import { describe, expect, test } from 'vitest';

const point = (date: Date, value: number): ChartPoint => ({ date: date.getTime(), value: value });

const day = (dayOfMonth: number, hour: number = 0) => new Date(2023, 1, dayOfMonth, hour);

/** A group and the entries its components hold, which are read separately */
type SeededGroup = { group: MeasurementCategory, seeds: CategorySeed[] };

/** The points the aggregated read returns for a group */
const groupPoints = (seeded: SeededGroup) =>
    groupComponentPoints(seeded.group, seeded.seeds.flatMap(seed => bucketsFor(seed)));

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

describe('measurementSeries', () => {
    const points = [point(day(1), 10), point(day(2), 20), point(day(3), 30)];

    test('draws the values, the average and the trend', () => {
        const roles = measurementSeries(points).map(series => series.role);

        expect(roles).toEqual(['raw', 'average', 'trend']);
    });

    test('leaves out the line the user turned off', () => {
        expect(measurementSeries(points, null, { average_window: 'none' }).map(s => s.role))
            .toEqual(['raw', 'trend']);
        expect(measurementSeries(points, null, { trend: 'none' }).map(s => s.role))
            .toEqual(['raw', 'average']);
        expect(measurementSeries(points, null, { trend: 'none', average_window: 'none' })
            .map(s => s.role)).toEqual(['raw']);
    });
});
