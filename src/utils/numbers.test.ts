import { numberGramLocale, numberLocale } from './numbers';

describe('test the numberLocale function', () => {
    test('should format number with no commas and "gram" unit in English locale', () => {
        const result = numberLocale(1234567.123, 'en-US');
        expect(result).toBe('1,234,567');
    });

    test('should format number with commas, no decimal point and "gram" unit in English locale', () => {
        const result = numberLocale(1234.567, 'en-US');
        expect(result).toBe('1,235');
    });

    test('should format number with "gram" unit in French locale', () => {
        const result = numberLocale(9876543, 'fr-FR');
        expect(result).toBe('9 876 543');
    });

    test('should format number without commas in Russian locale', () => {
        const result = numberLocale(12345, 'ru');
        expect(result).toBe('12 345');
    });

    test('should format zero without fraction digits', () => {
        const result = numberLocale(0, 'de-DE');
        expect(result).toBe('0');
    });
});

describe('test the numberGramLocale function', () => {
    test('should format number without commas and "gram" unit in English locale', () => {
        const result = numberGramLocale(1234567.123, 'en-US');
        expect(result).toBe('1,234,567 g');
    });

    test('should format number with commas, decimal point and "gram" unit in English locale', () => {
        const result = numberGramLocale(1234.567, 'en-US');
        expect(result).toBe('1,235 g');
    });

    test('should format number with commas and "gram" unit in French locale', () => {
        const result = numberGramLocale(9876543, 'fr-FR');
        expect(result).toBe('9 876 543 g');
    });

    test('should format number with commas and "gram" unit in Russian locale', () => {
        const result = numberGramLocale(12345, 'ru');
        expect(result).toBe('12 345 г');
    });

    test('should format zero without fraction digits and "gram" unit', () => {
        const result = numberGramLocale(0, 'de-DE');
        expect(result).toBe('0 g');
    });
});
