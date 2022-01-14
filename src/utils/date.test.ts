import { dateToYYYYMMDD } from "utils/date";

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
