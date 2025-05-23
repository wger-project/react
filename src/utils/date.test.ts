import { calculatePastDate, dateTimeToHHMM, dateToYYYYMMDD } from "utils/date";

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