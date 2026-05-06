import { processTimeSeries } from "./timeSeries";

describe("processTimeSeries tests", () => {
    test('sorts entries newest first and computes change, days, totalChange', () => {
        const entry1 = { date: new Date('2021-12-10'), value: 80 };
        const entry2 = { date: new Date('2021-12-20'), value: 95 };
        const entry3 = { date: new Date('2021-12-25'), value: 70 };

        const result = processTimeSeries([entry1, entry2, entry3], e => e.value);

        expect(result[0]).toStrictEqual({ entry: entry3, change: -25, days: 5, totalChange: -10 });
        expect(result[1]).toStrictEqual({ entry: entry2, change: 15, days: 10, totalChange: 15 });
        expect(result[2]).toStrictEqual({ entry: entry1, change: 0, days: 0, totalChange: 0 });
    });

    test('returns empty array for empty input', () => {
        expect(processTimeSeries([], e => e)).toStrictEqual([]);
    });

    test('totalChange accumulates correctly with multiple entries', () => {
        const entry1 = { date: new Date('2021-12-10'), value: 80 };
        const entry2 = { date: new Date('2021-12-15'), value: 75 };
        const entry3 = { date: new Date('2021-12-20'), value: 82 };
        const entry4 = { date: new Date('2021-12-25'), value: 70 };

        const result = processTimeSeries([entry1, entry2, entry3, entry4], e => e.value);

        expect(result[0].totalChange).toStrictEqual(-10);
        expect(result[1].totalChange).toStrictEqual(2);
        expect(result[2].totalChange).toStrictEqual(-5);
        expect(result[3].totalChange).toStrictEqual(0);
    });
});
