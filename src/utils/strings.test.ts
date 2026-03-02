import { truncateLongNames } from "utils/strings";

describe("truncate name utilities", () => {

    test('long name, default max length', () => {
        expect(truncateLongNames('Pizza is a dish of Italian origin consisting of...')).toEqual('Pizza is a dish of Ita…');
    });

    test('long name, custom max length', () => {
        expect(truncateLongNames('Pizza is a dish of Italian origin consisting of a usually round...', 10)).toEqual('Pizza is a…');
    });

    test('short name, default max length', () => {
        expect(truncateLongNames('Pizza is a dish')).toEqual('Pizza is a dish');
    });
});
