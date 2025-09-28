import { collectValidationErrors } from "utils/forms";

describe('test the collectValidationErrors function', () => {
    test('correctly collects all errors from lists', () => {
        const result = collectValidationErrors({
            'field1': ['Error 1', 'Error 2'],
            'field2': ['Error 3'],
        });
        expect(result).toStrictEqual(['field1: Error 1', 'field1: Error 2', 'field2: Error 3']);
    });
    test('correctly collects all errors from nested lists', () => {
        const result = collectValidationErrors({
            "main": [
                { "sub-list": ["This is a list"] }
            ],
        });
        expect(result).toStrictEqual(['main.sub-list: This is a list']);
    });
    test('correctly collects all errors from strings', () => {
        const result = collectValidationErrors({
            "language": "This is not a list",
        });
        expect(result).toStrictEqual(['language: This is not a list']);
    });

    test('correctly handles an emtpy object', () => {
        const result = collectValidationErrors({});
        expect(result).toStrictEqual([]);
    });

    test('correctly handles an undefined object', () => {
        const result = collectValidationErrors(undefined);
        expect(result).toStrictEqual([]);
    });

    test('correctly handles a null object', () => {
        const result = collectValidationErrors(null);
        expect(result).toStrictEqual([]);
    });

});