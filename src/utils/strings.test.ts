import { getTranslationKey, makeServerKey, truncateLongNames } from "utils/strings";

describe("slugify utilities", () => {

    test('whitespace', () => {
        expect(makeServerKey('test 123')).toEqual('test_123');
    });

    test('several whitespaces', () => {
        expect(makeServerKey('test   123')).toEqual('test___123');
    });

    test('capital letters', () => {
        expect(makeServerKey('TeST123')).toEqual('test123');
    });

    test('parenthesis', () => {
        expect(makeServerKey('Test(123)')).toEqual('test_123_');
    });

    test('dash', () => {
        expect(makeServerKey('Test-123')).toEqual('test_123');
    });

    test('special chars are kept', () => {
        expect(makeServerKey('abc*/&%$§')).toEqual('abc*/&%$§');
    });
});

describe("translation key utilities", () => {

    test('key', () => {
        expect(getTranslationKey('test 123')).toEqual('server.test_123');
    });

    test('several whitespaces', () => {
        expect(getTranslationKey('test   123')).toEqual('server.test___123');
    });

    test('capital letters', () => {
        expect(getTranslationKey('TeST123')).toEqual('server.test123');
    });

    test('special chars are kept', () => {
        expect(getTranslationKey('abc*/&%$§')).toEqual('server.abc*/&%$§');
    });
});

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
