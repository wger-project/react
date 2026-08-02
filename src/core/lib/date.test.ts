import { dateTimeToHHMM, dateToYYYYMMDD, yyyymmddToDate } from "@/core/lib/date";

/*
 * All date helpers must behave the same in every timezone, so the whole suite
 * runs three times: behind UTC, at UTC and ahead of UTC.
 *
 * Assigning process.env.TZ at runtime resets Node's timezone cache (POSIX
 * only, works on Linux and macOS). This trick is limited to tests that build
 * all their dates inside the test body - dates created at module load time
 * (e.g. the shared fixtures in src/tests/) keep the timezone that was active
 * during import. For those, the full test suite is run with different TZ
 * values in the CI instead.
 */
const originalTz = process.env.TZ;

describe.each([
    ['America/Toronto', 300],
    ['UTC', 0],
    ['Asia/Kolkata', -330],
])('with TZ=%s', (tz, expectedOffset) => {

    beforeAll(() => {
        process.env.TZ = tz;
    });

    afterAll(() => {
        process.env.TZ = originalTz;
    });

    test('sanity check: the timezone switch actually works', () => {
        // in winter, when no DST is in effect anywhere
        expect(new Date(2022, 0, 15).getTimezoneOffset()).toBe(expectedOffset);
    });

    describe("test date utility", () => {

        test('convert date 1', () => {
            const result = dateToYYYYMMDD(new Date(2022, 0, 1, 23));
            expect(result).toStrictEqual('2022-01-01');
        });

        test('convert date 2', () => {
            const result = dateToYYYYMMDD(new Date(2022, 5, 2, 23, 10, 34));
            expect(result).toStrictEqual('2022-06-02');
        });

        test('convert date 3', () => {
            const result = dateToYYYYMMDD(new Date('January 17, 2022 03:24:00'));
            expect(result).toStrictEqual('2022-01-17');
        });

        test('convert date at local midnight', () => {
            const result = dateToYYYYMMDD(new Date(2022, 0, 1));
            expect(result).toStrictEqual('2022-01-01');
        });
    });

    describe("test yyyymmddToDate", () => {

        test('parses to local midnight', () => {
            const result = yyyymmddToDate('2023-05-01');
            expect(result).toStrictEqual(new Date(2023, 4, 1));
        });

        // These must hold in every timezone, otherwise dates drift by one day
        // on each load / save cycle
        test('roundtrip string -> date -> string', () => {
            expect(dateToYYYYMMDD(yyyymmddToDate('2025-05-01'))).toStrictEqual('2025-05-01');
            expect(dateToYYYYMMDD(yyyymmddToDate('2024-12-31'))).toStrictEqual('2024-12-31');
            expect(dateToYYYYMMDD(yyyymmddToDate('2024-02-29'))).toStrictEqual('2024-02-29');
        });

        test('roundtrip date -> string -> date', () => {
            const date = new Date(2025, 6, 24);
            expect(yyyymmddToDate(dateToYYYYMMDD(date))).toStrictEqual(date);
        });
    });

    describe("test time utility", () => {

        test('convert time 1', () => {
            const result = dateTimeToHHMM(new Date(2022, 0, 1, 23, 10, 22));
            expect(result).toStrictEqual('23:10');
        });

    });
});
