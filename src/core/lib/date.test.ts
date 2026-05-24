import { calculatePastDate, dateTimeToHHMM, dateToYYYYMMDD, formatNaiveDate } from "@/core/lib/date";

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
});

describe("test time utility", () => {

    test('convert time 1', () => {
        const result = dateTimeToHHMM(new Date(2022, 0, 1, 23, 10, 22));
        expect(result).toStrictEqual('23:10');
    });

});


describe('calculatePastDate', () => {

    it('should return undefined for empty string filter', () => {
        expect(calculatePastDate('', new Date('2023-08-14'))).toBeUndefined();
    });

    it('should return the correct date for lastWeek filter', () => {
        const result = calculatePastDate('lastWeek', new Date('2023-02-14'));
        expect(result).toStrictEqual('2023-02-07');
    });

    it('should return the correct date for lastMonth filter', () => {
        const result = calculatePastDate('lastMonth', new Date('2023-02-14'));
        expect(result).toStrictEqual('2023-01-14');
    });

    it('should return the correct date for lastHalfYear filter', () => {
        const result = calculatePastDate('lastHalfYear', new Date('2023-08-14'));
        expect(result).toStrictEqual('2023-02-14');
    });

    it('should return the correct date for lastYear filter', () => {
        const result = calculatePastDate('lastYear', new Date('2023-02-14'));
        expect(result).toStrictEqual('2022-02-14');
    });
});

describe('formatNaiveDate - Timezone-Agnostic Validation', () => {
    it('should format a valid naive date string exactly as returned from the API without day shift', () => {
        const naiveDate = '2026-05-12';
        
        // en-US should format YYYY-MM-DD to MM/DD/YYYY
        const formattedUS = formatNaiveDate(naiveDate, 'en-US');
        expect(formattedUS).toBe('05/12/2026');

        // it-IT should format YYYY-MM-DD to DD/MM/YYYY
        const formattedIT = formatNaiveDate(naiveDate, 'it-IT');
        expect(formattedIT).toBe('12/05/2026');
    });

    it('should format standard JS Date objects timezone-agnostically', () => {
        // E.g. date parsed in UTC representing "2026-05-12"
        const dateObject = new Date('2026-05-12T00:00:00Z');
        
        const formattedUS = formatNaiveDate(dateObject, 'en-US');
        expect(formattedUS).toBe('05/12/2026');

        const formattedIT = formatNaiveDate(dateObject, 'it-IT');
        expect(formattedIT).toBe('12/05/2026');
    });

    it('should correctly format month boundaries without falling back to previous/next month', () => {
        // First day of month
        expect(formatNaiveDate('2026-01-01', 'en-US')).toBe('01/01/2026');
        // Last day of month
        expect(formatNaiveDate('2026-12-31', 'en-US')).toBe('12/31/2026');
        // Leap year date
        expect(formatNaiveDate('2024-02-29', 'en-US')).toBe('02/29/2024');
    });

    it('should return an empty string for invalid dates or malformed formats', () => {
        expect(formatNaiveDate('')).toBe('');
        expect(formatNaiveDate(null)).toBe('');
        expect(formatNaiveDate(undefined)).toBe('');
        expect(formatNaiveDate('invalid-date')).toBe('');
        expect(formatNaiveDate('2026-13-45')).toBe(''); // Out of bounds month/day
        expect(formatNaiveDate('12/05/2026')).toBe(''); // Not YYYY-MM-DD format
    });

    it('should handle fallback date parsing for standard ISO datetime strings safely', () => {
        const isoString = '2026-05-12T00:00:00Z';
        expect(formatNaiveDate(isoString, 'en-US')).toBe('05/12/2026');
    });
});