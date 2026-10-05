import { Exercise } from "@/components/Exercises";
import { aggregateAnalytics, analyticsDateFilter, AnalyticsMetric } from "@/components/Routines/models/analytics";
import { RepetitionUnit, RepetitionUnitAdapter } from "@/components/Routines/models/RepetitionUnit";
import { analyticsLog } from "@/tests/analyticsTestData";
import { testExerciseSquats, testMuscleBiggus } from "@/tests/exerciseTestdata";

const all = { exerciseId: null, muscleId: null };
const day = new Date(2026, 5, 1).getTime();

describe('exercise analytics aggregation', () => {
    test.each<[AnalyticsMetric, number]>([['weight', 60], ['reps', 25], ['volume', 1150]])(
        '%s combines multiple routines, sessions and unassigned logs by calendar day', (metric, expected) => {
            const logs = [
                analyticsLog({ id: 'b', routineId: 2, sessionId: 'second', weight: 60, repetitions: 5 }),
                analyticsLog({ id: 'a' }),
                analyticsLog({ id: 'c', routineId: null, sessionId: null, weight: 35 }),
            ];
            expect(aggregateAnalytics(logs, metric, all).series[0].points).toEqual([{ date: day, value: expected }]);
        },
    );

    test('sorts days chronologically, keeps exercise IDs distinct and does not count duplicate logs', () => {
        const first = analyticsLog();
        const result = aggregateAnalytics([
            analyticsLog({ id: 'later', date: new Date(2026, 5, 2, 18), weight: 80 }),
            analyticsLog({ id: 'other', exerciseId: 999, exerciseObj: undefined, weight: 20 }),
            first, first,
        ], 'volume', all);
        expect(result.series.find(s => s.exerciseId === first.exerciseId)?.points).toEqual([
            { date: day, value: 500 }, { date: new Date(2026, 5, 2).getTime(), value: 800 },
        ]);
        expect(result.series).toHaveLength(2);
    });

    test('normalizes pounds before comparing weight or adding volume', () => {
        const logs = [analyticsLog(), analyticsLog({ id: 'lb', weight: 100, weightUnitId: 2 })];
        expect(aggregateAnalytics(logs, 'weight', all).series[0].points[0].value).toBe(50);
        expect(aggregateAnalytics(logs, 'volume', all).series[0].points[0].value).toBeCloseTo(953.59237);
    });

    test('bodyweight fallback separates reps, time and weighted volume for the same exercise', () => {
        const logs = [
            analyticsLog(),
            analyticsLog({ id: 'zero', weight: 0 }),
            analyticsLog({ id: 'null', weight: null }),
            analyticsLog({ id: 'body', weightUnitId: 3, weight: 100 }),
            analyticsLog({ id: 'seconds', repetitions: 30, weight: null, repetitionUnitId: 3,
                repetitionUnitObj: new RepetitionUnit(3, 'Seconds', 'TIME', 1) }),
            analyticsLog({ id: 'minutes', repetitions: 2, weight: 0, repetitionUnitId: 4,
                repetitionUnitObj: new RepetitionUnit(4, 'Minutes', 'TIME', 60) }),
        ];
        const result = aggregateAnalytics(logs, 'volume', all);
        expect(result.skipped).toBe(0);
        expect(Object.fromEntries(result.series.map(s => [s.unit, s.points[0].value]))).toEqual({
            kgReps: 500, reps: 30, seconds: 150,
        });
        const reps = aggregateAnalytics(logs, 'reps', all);
        expect(reps.series[0].points[0].value).toBe(40);
        expect(reps.skipped).toBe(2);
    });

    test('uses time metadata when present and supports units from older servers', () => {
        const unit = new RepetitionUnitAdapter().fromJson({ id: 99, name: 'Minutes', unit_type: 'TIME', multiplier: 60 });
        const result = aggregateAnalytics([
            analyticsLog({ id: 'modern', repetitions: 2, repetitionUnitId: 99, repetitionUnitObj: unit }),
            analyticsLog({ id: 'legacy', repetitions: 1, repetitionUnitId: 4, repetitionUnitObj: new RepetitionUnit(4, 'Minutes') }),
        ], 'volume', all);
        expect(result.series[0].points[0].value).toBe(180);
    });

    test('muscle filters include primary and secondary matches once, and intersect with exercise', () => {
        const secondary = new Exercise({ ...testExerciseSquats, id: 999, muscles: [], musclesSecondary: [testMuscleBiggus] });
        const both = new Exercise({ ...testExerciseSquats, musclesSecondary: [testMuscleBiggus] });
        const logs = [
            analyticsLog({ exerciseObj: both }),
            analyticsLog({ id: 'secondary', exerciseId: 999, exerciseObj: secondary, repetitions: 5 }),
            analyticsLog({ id: 'unrelated', exerciseId: 1000, exerciseObj: undefined }),
        ];
        const filter = { ...all, muscleId: testMuscleBiggus.id };
        const result = aggregateAnalytics(logs, 'reps', filter);
        expect(result.series).toHaveLength(1);
        expect(result.series[0]).toMatchObject({ exerciseId: null, points: [{ date: day, value: 15 }] });
        expect(aggregateAnalytics(logs, 'reps', { ...filter, exerciseId: 999 }).series[0].points[0].value).toBe(5);
    });

    test('does not turn missing values, distance, plates or assistance into weighted volume', () => {
        const result = aggregateAnalytics([
            analyticsLog({ id: 'missing', repetitions: null }),
            analyticsLog({ id: 'invalid', repetitions: NaN }),
            analyticsLog({ id: 'plates', weightUnitId: 4 }),
            analyticsLog({ id: 'assistance', weight: -20 }),
            analyticsLog({ id: 'distance', repetitionUnitId: 8, repetitionUnitObj: new RepetitionUnit(8, 'Meters', 'DISTANCE', 1) }),
            analyticsLog({ id: 'date', date: new Date('invalid') }),
        ], 'volume', all);
        expect(result).toEqual({ series: [], skipped: 6 });
    });

    test('keeps actual zero values and leaves empty results empty', () => {
        expect(aggregateAnalytics([analyticsLog({ weight: 0 })], 'weight', all).series[0].points[0].value).toBe(0);
        expect(aggregateAnalytics([], 'volume', all)).toEqual({ series: [], skipped: 0 });
    });

    test('unknown units and invalid duration multipliers cannot create a misleading value', () => {
        const logs = [
            analyticsLog({ id: 'no-rep-unit', repetitionUnitId: null, repetitionUnitObj: null }),
            analyticsLog({ id: 'negative-reps', repetitions: -1 }),
            analyticsLog({ id: 'duration', repetitionUnitId: 3,
                repetitionUnitObj: new RepetitionUnit(3, 'Seconds', 'TIME', 0) }),
        ];
        expect(aggregateAnalytics(logs, 'volume', all)).toEqual({ series: [], skipped: 3 });
        expect(aggregateAnalytics([analyticsLog({ weight: null })], 'weight', all)).toEqual({ series: [], skipped: 1 });
    });
});

describe('analytics date filters', () => {
    test('all history has no date bounds', () => {
        expect(analyticsDateFilter('all')).toEqual({});
    });

    test('a week includes seven complete local calendar days and has stable cache boundaries', () => {
        const now = new Date(2026, 5, 8, 10, 30);
        const filter = analyticsDateFilter('lastWeek', now);
        expect(filter).toEqual({
            date__gte: new Date(2026, 5, 2).toISOString(),
            date__lt: new Date(2026, 5, 9).toISOString(),
        });
        expect(analyticsDateFilter('lastWeek', new Date(2026, 5, 8, 23, 59))).toEqual(filter);
    });

    test.each([[2, 10], [2, 31], [10, 3]])('calendar bounds stay stable across DST around month %s day %s', (month, date) => {
        const early = analyticsDateFilter('lastWeek', new Date(2026, month, date, 0, 15));
        const late = analyticsDateFilter('lastWeek', new Date(2026, month, date, 23, 45));
        expect(early).toEqual(late);
        expect(early.date__gte).toBe(new Date(2026, month, date - 6).toISOString());
    });
});
