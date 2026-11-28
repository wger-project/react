import { NumberParser } from '@internationalized/number';
import { dateLocale } from './date';

export enum LocaleUnit {
    GRAM = 'gram',
    KG = 'kilogram',
    LB = 'pound',
    PERCENT = 'percent',
}

/*
 * The [locale] arguments below are the page language: like dates, numbers
 * take the browser's region on top (see dateLocale), so "de" with a Swiss
 * browser formats and reads as "de-CH".
 */

/*
 * Formats a number, localised, no fraction digits
 */
export function numberLocale(num: number, locale: string) {
    return num.toLocaleString(dateLocale(locale), { maximumFractionDigits: 0 });
}

/*
 * Formats a number, localised, with up to [maxDecimals] fraction digits. The
 * default keeps as many as the server stores, and few enough to hide the
 * artefacts of summing floats. [minDecimals] pads, e.g. a BMI of 17 as "17.0"
 */
export function numberDecimalLocale(num: number, locale: string, maxDecimals: number = 2, minDecimals: number = 0) {
    return num.toLocaleString(dateLocale(locale), {
        minimumFractionDigits: minDecimals,
        maximumFractionDigits: maxDecimals,
    });
}

/*
 * Formats a number with a unit, localised, no fraction digits
 *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat
 * https://tc39.es/ecma402/#table-sanctioned-single-unit-identifiers
 */
export function numberUnitLocale(num: number, locale: string, unit: LocaleUnit) {
    return num.toLocaleString(
        dateLocale(locale),
        { maximumFractionDigits: 0, unit: unit.valueOf(), style: 'unit' }
    );
}

export function numberGramLocale(num: number, locale: string) {
    return numberUnitLocale(num, locale, LocaleUnit.GRAM);
}

export function numberPercentLocale(num: number, locale: string) {
    return numberUnitLocale(num, locale, LocaleUnit.PERCENT);
}

export function numberKgLocale(num: number, locale: string) {
    return numberUnitLocale(num, locale, LocaleUnit.KG);
}

export function numberLbLocale(num: number, locale: string) {
    return numberUnitLocale(num, locale, LocaleUnit.LB);
}

// Text with exactly one '.' or ','
const SINGLE_SEPARATOR = /^([^.,]*)[.,]([^.,]*)$/;
// What a thousands group needs around it: 1–3 digits without a leading zero, then exactly three
const GROUP_BEFORE = /^[+-]?[1-9]\d{0,2}$/;
const GROUP_AFTER = /^\d{3}$/;

/*
 * Reads a number typed in the locale (default: the page language), NaN if
 * the text is none. A single dot or comma counts as decimal separator in every
 * locale unless it could be a thousands separator, so "80.5" and "0.125" stay
 * decimals in German, while "1.234" there is still 1234
 */
export function parseNumberLocale(text: string, locale?: string): number {
    const trimmed = text.trim();
    if (trimmed === '') {
        return NaN;
    }

    const resolved = dateLocale(locale);
    const single = SINGLE_SEPARATOR.exec(trimmed);
    if (single && !(GROUP_BEFORE.test(single[1].trim()) && GROUP_AFTER.test(single[2].trim()))) {
        const decimal = new Intl.NumberFormat(resolved).formatToParts(1.5).find(p => p.type === 'decimal')?.value ?? '.';
        return new NumberParser(resolved).parse(trimmed.replace(/[.,]/, decimal));
    }

    return new NumberParser(resolved).parse(trimmed);
}

/*
 * Formats a number for a text field the user edits, so that parseNumberLocale
 * reads it back: localised decimal separator, no grouping
 */
export function formatNumberInput(num: number | null | undefined, locale?: string): string {
    if (num === null || num === undefined || Number.isNaN(num)) {
        return '';
    }
    return num.toLocaleString(dateLocale(locale), { useGrouping: false, maximumFractionDigits: 20 });
}
