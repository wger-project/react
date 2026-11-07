import { dateToLocale } from "@/core/lib/date";
import { numberDecimalLocale } from "@/core/lib/numbers";

/** Whether the points fall into more than one calendar year */
export const spansYears = (points: { date: number }[]): boolean => {
    if (points.length === 0) {
        return false;
    }

    const years = points.map(point => new Date(point.date).getFullYear());

    return Math.min(...years) !== Math.max(...years);
};

/**
 * Label of a date on an axis. The year is left out while the chart stays
 * within one, where it is the same on every tick and only costs space.
 */
export const dateTick = (withYear: boolean) => (value: number): string =>
    dateToLocale(new Date(value), undefined, withYear
        ? { year: '2-digit', month: '2-digit', day: '2-digit' }
        : { month: '2-digit', day: '2-digit' });

/** The unit a duration is stored in, which is what the health platforms deliver */
const MINUTES = 'min';

/**
 * A duration in minutes as hours and minutes, e.g. 452 as "7:32".
 *
 * Intl does the splitting, which gets the padding and the locale's own digits
 * right (7:32 reads ۷:۳۲ in Persian). The sign is ours: a duration is only
 * ever negative here as a change between two of them.
 */
export const hoursAndMinutes = (minutes: number, locale: string): string => {
    const rounded = Math.round(minutes);
    const absolute = Math.abs(rounded);

    return (rounded < 0 ? '-' : '') + new Intl.DurationFormat(locale, {
        style: 'digital',
        secondsDisplay: 'auto',
    }).format({ hours: Math.floor(absolute / 60), minutes: absolute % 60 });
};

/**
 * A measured value on its own, formatted the way its unit is read. For the
 * ends of a range, where only the last one carries the unit.
 *
 * [decimals] caps the fraction digits, for at-a-glance readings (see
 * displayDecimalsFor); without it the stored precision shows. A duration
 * ignores it, hours and minutes have no decimals to cap.
 */
export const valueOnly = (value: number, unit: string, locale: string, decimals?: number): string =>
    unit === MINUTES ? hoursAndMinutes(value, locale) : numberDecimalLocale(value, locale, decimals);

/**
 * The unit as it is shown. A duration is stored in minutes but read in hours,
 * and the symbol stays untranslated like every other category unit.
 */
export const unitLabel = (unit: string): string => unit === MINUTES ? 'h' : unit;

/**
 * A measured value with its unit, both localised. A value stands on its own
 * where there is no unit: a step count is a bare number, and so may be a
 * free-form category. [decimals] as in valueOnly.
 */
export const valueWithUnit = (value: number, unit: string, locale: string, decimals?: number): string =>
    unit === ''
        ? valueOnly(value, unit, locale, decimals)
        : `${valueOnly(value, unit, locale, decimals)} ${unitLabel(unit)}`;

/** Ticks a duration axis aims for, few enough that the labels stay apart */
const DURATION_TICKS = 6;

const MINUTES_PER_HOUR = 60;

/**
 * Domain and ticks of an axis of durations, undefined for every other unit,
 * where the library picks them.
 *
 * A duration is read in hours, so a tick belongs on a whole one: an axis
 * labelled 6:40, 8:20, 10:00 is arithmetically correct and unreadable. The
 * step grows in whole hours until few enough ticks are left, and the bounds
 * are widened to the hours around the data so no tick falls outside them.
 */
export const durationAxis = (
    unit: string,
    min: number,
    max: number,
): { domain: [number, number], ticks: number[] } | undefined => {
    if (unit !== MINUTES) {
        return undefined;
    }

    const from = Math.floor(min / MINUTES_PER_HOUR) * MINUTES_PER_HOUR;
    const to = Math.ceil(max / MINUTES_PER_HOUR) * MINUTES_PER_HOUR;
    const hours = Math.max(1, (to - from) / MINUTES_PER_HOUR);
    const step = Math.ceil(hours / DURATION_TICKS) * MINUTES_PER_HOUR;

    // The top follows the step rather than the data: a domain that ended below
    // the last tick would cut the values it was derived from
    const top = from + Math.ceil((to - from) / step) * step;

    const ticks = [];
    for (let tick = from; tick <= top; tick += step) {
        ticks.push(tick);
    }

    return { domain: [from, top], ticks };
};
