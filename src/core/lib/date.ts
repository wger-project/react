import { FilterType } from "@/components/Weight/widgets/FilterButtons";
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
 */
export function dateToYYYYMMDD(date: Date): string {
    return date.toISOString().split('T')[0];
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

/**
 * Formats a naive "YYYY-MM-DD" date string, standard ISO-8601 datetime string,
 * or standard JS Date object into a localized date format without applying local
 * browser timezone translation (i.e. timezone-agnostic).
 *
 * @param date - The naive date string or Date object
 * @param locale - Optional locale for formatting (defaults to active i18n language or 'en-US')
 * @returns The formatted date string, or an empty string if the input is invalid
 */
export function formatNaiveDate(date: string | Date | null | undefined, locale?: string): string {
    if (!date) {
        return '';
    }

    const resolvedLocale = locale ?? i18n.language ?? 'en-US';
    let utcDate: Date;

    if (date instanceof Date) {
        if (isNaN(date.getTime())) {
            return '';
        }
        utcDate = date;
    } else if (typeof date === 'string') {
        const trimmed = date.trim();
        // ISO-8601 regex strictly matching YYYY-MM-DD with optional time and timezone components
        const isoRegex = /^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?(Z|[+-]\d{2}:?\d{2})?)?$/;
        const match = trimmed.match(isoRegex);

        if (!match) {
            return ''; // Strictly reject non-conforming formats
        }

        const year = parseInt(match[1], 10);
        const month = parseInt(match[2], 10) - 1; // JS months are 0-indexed
        const day = parseInt(match[3], 10);

        const hasTime = !!match[4];

        if (!hasTime) {
            utcDate = new Date(Date.UTC(year, month, day));
            // Strict validation: Ensure JavaScript didn't silently roll the date over
            if (
                utcDate.getUTCFullYear() !== year ||
                utcDate.getUTCMonth() !== month ||
                utcDate.getUTCDate() !== day
            ) {
                return '';
            }
        } else {
            utcDate = new Date(trimmed);
            if (isNaN(utcDate.getTime())) {
                return '';
            }
        }
    } else {
        return '';
    }

    // Format explicitly using the UTC timezone and consistent fields
    return utcDate.toLocaleDateString(resolvedLocale, {
        timeZone: 'UTC',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
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