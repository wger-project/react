import { numberGramLocale, numberLocale } from './numbers';

describe('test the numberLocale function', () => {
    test('groups the thousands and drops the decimals in the english locale', () => {
        const result = numberLocale(1234567.123, 'en-US');
        expect(result).toBe('1,234,567');
    });

    test('rounds to the nearest integer in the english locale', () => {
        const result = numberLocale(1234.567, 'en-US');
        expect(result).toBe('1,235');
    });

    test('groups the thousands with a space in the french locale', () => {
        const result = numberLocale(9876543, 'fr-FR');
        expect(result).toBe('9 876 543');
    });

    test('groups the thousands with a space in the russian locale', () => {
        const result = numberLocale(12345, 'ru');
        expect(result).toBe('12 345');
    });

    test('formats zero without fraction digits', () => {
        const result = numberLocale(0, 'de-DE');
        expect(result).toBe('0');
    });
});

describe('test the numberGramLocale function', () => {
    test('appends the gram unit and drops the decimals in the english locale', () => {
        const result = numberGramLocale(1234567.123, 'en-US');
        expect(result).toBe('1,234,567 g');
    });

    test('rounds to the nearest integer and appends the gram unit in the english locale', () => {
        const result = numberGramLocale(1234.567, 'en-US');
        expect(result).toBe('1,235 g');
    });

    test('groups with a space and appends the gram unit in the french locale', () => {
        const result = numberGramLocale(9876543, 'fr-FR');
        expect(result).toBe('9 876 543 g');
    });

    test('uses the localised gram unit in the russian locale', () => {
        const result = numberGramLocale(12345, 'ru');
        expect(result).toBe('12 345 г');
    });

    test('formats zero with the gram unit', () => {
        const result = numberGramLocale(0, 'de-DE');
        expect(result).toBe('0 g');
    });
});
