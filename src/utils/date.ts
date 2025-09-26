import { FilterType } from "components/BodyWeight/widgets/FilterButtons";
import i18n from 'i18next';


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
export function dateTimeToLocaleHHMM(dateTime: Date | null, locale?: string) {
    if (dateTime == null) {
        return null;
    }
    locale = locale ?? i18n.language;

    return dateTime.toLocaleTimeString(
        locale ? [locale] : [],
        { hour: '2-digit', minute: '2-digit' }
    );
}

export function dateTimeToLocale(dateTime: Date | null, locale?: string) {
    if (dateTime == null) {
        return null;
    }

    locale = locale ?? i18n.language;


    return dateTime.toLocaleString(locale ? [locale] : [], {
        year: '2-digit',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
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