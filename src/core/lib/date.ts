import { FilterType } from "@/components/Weight/api/weight";
import i18n from 'i18next';
import { DateTime, DateTimeFormatOptions } from "luxon";


export function isSameDay(date1: Date, date2: Date): boolean {
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
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

/*
 * Util function that calculates a date in the past based on a string filter
 * and returns it as a YYYY-MM-DD string for API queries.
 *
 * @param filter - A string representing the desired time period (e.g., 'lastWeek', 'lastMonth')
 * @param currentDate - (Optional) The current date to base calculations on. Defaults to `new Date()`.
 *                      This parameter allows for testing or custom date bases.
 * @returns - Date string in the format YYYY-MM-DD or undefined for no filtering
 */
export function calculatePastDate(filter: FilterType, currentDate: Date = new Date()): string | undefined {

    // Dictionary for filters
    const filterMap: Record<FilterType, (() => void) | undefined> = {
        lastWeek: () => currentDate.setDate(currentDate.getDate() - 7),
        lastMonth: () => currentDate.setMonth(currentDate.getMonth() - 1),
        lastHalfYear: () => currentDate.setMonth(currentDate.getMonth() - 6),
        lastYear: () => currentDate.setFullYear(currentDate.getFullYear() - 1),
        '': undefined
    };

    // Execute the corresponding function for the filter
    const applyFilter = filterMap[filter];
    if (applyFilter) {
        applyFilter();
    } else {
        return undefined;
    }

    return dateToYYYYMMDD(currentDate);
}