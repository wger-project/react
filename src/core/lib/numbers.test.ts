import { formatNumberInput, numberDecimalLocale, numberGramLocale, numberLocale, parseNumberLocale } from './numbers';

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

describe('test the parseNumberLocale function', () => {
    test.each([
        ['80,5', 'de', 80.5],
        ['1.234,5', 'de', 1234.5],
        ['1.234', 'de', 1234],
        ['1.234.567', 'de', 1234567],
        ['12.345', 'de', 12345],
        ['-1.234', 'de', -1234],
        ['80.5', 'en', 80.5],
        ['1,234.5', 'en', 1234.5],
        ['1,234', 'en', 1234],
        ['1 234,5', 'fr', 1234.5],
        ["1'234.5", 'de-CH', 1234.5],
        ['٨٠٫٥', 'ar-EG', 80.5],
        [' 80,5 ', 'de', 80.5],
        ['-2,5', 'de', -2.5],
        ['80', 'de', 80],
    ])('reads %j in %s as %d', (text, locale, expected) => {
        expect(parseNumberLocale(text, locale)).toBe(expected);
    });

    test.each([
        ['80.5', 'de', 80.5],
        ['80.25', 'de', 80.25],
        ['0.1234', 'de', 0.1234],
        ['80,5', 'en', 80.5],
        ['80.5', 'ar-EG', 80.5],
        ['0.125', 'de', 0.125],
        ['-0.125', 'de', -0.125],
        ['.125', 'de', 0.125],
        ['0,125', 'en', 0.125],
        ['1234.567', 'de', 1234.567],
    ])('reads the single separator in %j as decimal separator in %s', (text, locale, expected) => {
        expect(parseNumberLocale(text, locale)).toBe(expected);
    });

    test.each(['', '  ', 'abc', '2,5kg', '80,5,5'])('returns NaN for %j', text => {
        expect(parseNumberLocale(text, 'de')).toBeNaN();
    });
});

describe('test the formatNumberInput function', () => {
    test('uses the decimal comma and no grouping in the german locale', () => {
        expect(formatNumberInput(1234.5, 'de')).toBe('1234,5');
    });

    test('keeps every fraction digit', () => {
        expect(formatNumberInput(0.125, 'en')).toBe('0.125');
    });

    test('returns an empty string for missing values', () => {
        expect(formatNumberInput(null, 'de')).toBe('');
        expect(formatNumberInput(undefined, 'de')).toBe('');
    });

    test.each([80.5, 1234.5, 0.125, 1.234, 2])('reads its own output for %d back', num => {
        for (const locale of ['de', 'en', 'fr', 'de-CH', 'ar-EG']) {
            expect(parseNumberLocale(formatNumberInput(num, locale), locale)).toBe(num);
        }
    });
});

describe('the region of the browser', () => {
    beforeEach(() => {
        vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['de-CH']);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('formats, fills in and reads a plain language with it', () => {
        const swiss = (1234.5).toLocaleString('de-CH');

        expect(numberDecimalLocale(1234.5, 'de')).toBe(swiss);
        expect(formatNumberInput(1234.5, 'de')).toBe('1234.5');
        expect(parseNumberLocale(swiss, 'de')).toBe(1234.5);
    });

    test('leaves a locale that has a region alone', () => {
        expect(numberDecimalLocale(1234.5, 'de-DE')).toBe('1.234,5');
    });
});
