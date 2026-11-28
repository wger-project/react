import { NumberParser } from '@internationalized/number';
import { dateLocale } from './date';

export enum LocaleUnit {
    GRAM = 'gram',
    KG = 'kilogram',
    LB = 'pound',
    PERCENT = 'percent',
}

/*
 * Formats a number, localised, no fraction digits
 */
export function numberLocale(num: number, locale: string) {
    return num.toLocaleString(locale, { maximumFractionDigits: 0 });
}

/*
 * Formats a number, localised, with up to [maxDecimals] fraction digits. The
 * default keeps as many as the server stores, and few enough to hide the
 * artefacts of summing floats
 */
export function numberDecimalLocale(num: number, locale: string, maxDecimals: number = 2) {
    return num.toLocaleString(locale, { maximumFractionDigits: maxDecimals });
}

/*
 * Formats a number with a unit, localised, no fraction digits
 *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat
 * https://tc39.es/ecma402/#table-sanctioned-single-unit-identifiers
 */
export function numberUnitLocale(num: number, locale: string, unit: LocaleUnit) {
    return num.toLocaleString(
        locale,
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

// One '.' or ',' that is not followed by exactly three digits, e.g. "80.5"
const SINGLE_DECIMAL_SEPARATOR = /^[^.,]*[.,](\d{0,2}|\d{4,})$/;

/*
 * Reads a number typed in the locale (default: page language with the
 * browser's region, as for dates), NaN if the text is none. A single dot or
 * comma counts as decimal separator in every locale, so "80.5" stays 80.5 in
 * German, while "1.234" there is still 1234
 */
export function parseNumberLocale(text: string, locale: string | undefined = dateLocale()): number {
    const trimmed = text.trim();
    if (trimmed === '') {
        return NaN;
    }

    if (SINGLE_DECIMAL_SEPARATOR.test(trimmed)) {
        const decimal = new Intl.NumberFormat(locale).formatToParts(1.5).find(p => p.type === 'decimal')?.value ?? '.';
        return new NumberParser(locale).parse(trimmed.replace(/[.,]/, decimal));
    }

    return new NumberParser(locale).parse(trimmed);
}

/*
 * Formats a number for a text field the user edits, so that parseNumberLocale
 * reads it back: localised decimal separator, no grouping
 */
export function formatNumberInput(num: number | null | undefined, locale: string | undefined = dateLocale()): string {
    if (num === null || num === undefined || Number.isNaN(num)) {
        return '';
    }
    return num.toLocaleString(locale, { useGrouping: false, maximumFractionDigits: 20 });
}
