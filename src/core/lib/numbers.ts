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