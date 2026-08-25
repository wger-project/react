import i18n from 'i18next';
import { DateTime, DateTimeFormatOptions } from "luxon";


/** Milliseconds in a day. Only for durations; a calendar day can be 23 or 25 hours long */
export const DAY_MS = 24 * 60 * 60 * 1000;

// Calendar arithmetic, not milliseconds: a DST day is 23 or 25 hours long
export const dayOf = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), date.getDate());
export const shiftDays = (date: Date, days: number): Date =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
// getDay() counts from Sunday, the week starts on Monday
export const mondayOf = (date: Date): Date => shiftDays(date, -((date.getDay() + 6) % 7));
export const daysBetween = (from: Date, to: Date): number => Math.round(
    (Date.UTC(to.getFullYear(), to.getMonth(), to.getDate())
        - Date.UTC(from.getFullYear(), from.getMonth(), from.getDate())) / DAY_MS
);

export function isSameDay(date1: Date, date2: Date): boolean {
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
}

/*
 * A date as a relative phrase ("today", "3 weeks ago"), in the locale's own
 * words via Intl.
 *
 * Counts calendar days rather than elapsed hours, so an entry from late
 * yesterday still reads as yesterday this morning. The unit grows with the
 * distance: days within a week, then weeks, months, years.
 */
export function dateToRelative(date: Date, locale?: string, now: Date = new Date()): string {
    const dayMs = 24 * 60 * 60 * 1000;
    // Rounded because a DST day is 23 or 25 hours long
    const days = Math.round((
        new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
        - new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
    ) / dayMs);

    const format = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    if (Math.abs(days) < 7) {
        return format.format(-days, 'day');
    }
    if (Math.abs(days) < 31) {
        return format.format(-Math.round(days / 7), 'week');
    }
    if (Math.abs(days) < 365) {
        return format.format(-Math.round(days / 30), 'month');
    }
    return format.format(-Math.round(days / 365), 'year');
}

/*
 * Util function that converts a date to a YYYY-MM-DD string
 *
 * This is built from the local date components on purpose: the shorter
 * date.toISOString().split('T')[0] first converts to UTC, so for dates like
 * "local midnight" it returns the previous day for every timezone ahead of UTC
 * (and the counterpart yyyymmddToDate would shift behind UTC). Since these
 * strings represent calendar dates the user picked (Django DateFields), the
 * local calendar day is the correct one.
 */
export function dateToYYYYMMDD(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/*
 * Util function that parses a YYYY-MM-DD string (as returned by Django DateFields)
 * to a Date at local midnight.
 *
 * Note that new Date("YYYY-MM-DD") must not be used for these strings: the spec
 * parses them as UTC midnight, which is the previous day in timezones behind UTC.
 */
export function yyyymmddToDate(dateStr: string): Date {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
}


/*
 * Returns the localized time from a date object
 */
export function dateTimeToLocaleHHMM(dateTime: Date | null, locale?: string, options?: Intl.DateTimeFormatOptions) {
    if (dateTime == null) {
        return null;
    }
    locale = locale ?? i18n.language;
    options = options ?? { hour: '2-digit', minute: '2-digit' };

    return dateTime.toLocaleTimeString(
        locale ? [locale] : [],
        options
    );
}

export function dateTimeToLocale(dateTime: Date | null, locale?: string, options?: Intl.DateTimeFormatOptions,) {
    if (dateTime == null) {
        console.warn("dateTimeToLocaleHHMM called with null datetime!");
        return '';
    }

    locale = locale ?? i18n.language;
    options = options ?? {
        year: '2-digit',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    };

    return dateTime.toLocaleString(locale ? [locale] : [], options);
}

export function luxonDateTimeToLocale(dateTime: DateTime | null, locale?: string, options?: DateTimeFormatOptions,) {
    if (dateTime == null) {
        console.warn("luxonDateTimeToLocale called with null datetime!");
        return '';
    }

    locale = locale ?? i18n.language;
    options = options ?? DateTime.DATE_MED;

    return dateTime.toLocaleString(options, { locale: locale });
}

export function dateToLocale(dateTime: Date | null, locale?: string, options?: Intl.DateTimeFormatOptions) {
    if (dateTime == null) {
        console.warn('dateToLocale called with null date!');
        return '';
    }

    locale = locale ?? i18n.language;
    options = options ?? {
        year: '2-digit',
        month: '2-digit',
        day: '2-digit',
    };


    return dateTime.toLocaleString(locale ? [locale] : [], options);
}

/*
 * Converts a date object to a non localized string in the format HH:MM
 */
export function dateTimeToHHMM(date: Date | null) {
    if (date == null) {
        return null;
    }
    const [hour, minute] = date.toTimeString().split(':');
    return `${hour}:${minute}`;
}

/*
 * Converts HH:MM to a date object
 *
 * Note that this is only used when converting times from the api, so we don't
 * have to consider that there could be annoying AMs and PMs in the string
 */
export function HHMMToDateTime(time: string | null) {

    if (time == null) {
        return null;
    }

    const [hour, minute] = time.split(':', 2);
    const dateTime = new Date();
    dateTime.setHours(parseInt(hour));
    dateTime.setMinutes(parseInt(minute));

    return dateTime;
}
