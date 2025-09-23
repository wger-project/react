import { collectValidationErrors } from "utils/forms";

describe('test the collectValidationErrors function', () => {
    test('correctly collects all errors', () => {
        const result = collectValidationErrors({
            'field1': ['Error 1', 'Error 2'],
            'field2': ['Error 3'],
        });
        expect(result).toStrictEqual(['Error 1', 'Error 2', 'Error 3']);
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