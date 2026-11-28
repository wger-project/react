import { formatLocale } from "@/core/lib/locale";

describe('formatLocale', () => {

    test('a bare page language takes the region from the browser', () => {
        expect(formatLocale('en', ['de-DE', 'en-NZ', 'en-US'])).toBe('en-NZ');
        expect(formatLocale('de', ['de-AT'])).toBe('de-AT');
    });

    test('a page language with a region is kept', () => {
        expect(formatLocale('en-GB', ['en-NZ'])).toBe('en-GB');
        expect(formatLocale('zh-Hans', ['zh-CN'])).toBe('zh-Hans');
    });

    test('without a matching browser language the page language is used', () => {
        expect(formatLocale('en', ['de-DE', 'en'])).toBe('en');
        expect(formatLocale('en', ['eu-ES'])).toBe('en');
    });
});
