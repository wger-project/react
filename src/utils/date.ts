/*
 * Util function that converts a date to a YYYY-MM-DD string
 */
export function dateToYYYYMMDD(date: Date): string {
    return date.toISOString().split('T')[0];
}

// Map the numbers 1 - 7 to the days of the week
export const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
];

export function isSameDay(date1: Date, date2: Date): boolean {
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
}

/*
 * Returns the localized time from a date object
 */
export function dateTimeToLocaleYYYYMMDD(dateTime: Date | null) {
    if (dateTime == null) {
        return null;
    }

    return dateTime.toLocaleDateString([]);
}

/*
 * Returns the localized time from a date object
 */
export function dateTimeToLocaleHHMM(dateTime: Date | null, locale?: string) {
    if (dateTime == null) {
        return null;
    }


    return dateTime.toLocaleTimeString(locale ? [locale] : [], { hour: '2-digit', minute: '2-digit' });
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

    const [hour, minute] = time.split(':');
    const dateTime = new Date();
    dateTime.setHours(parseInt(hour));
    dateTime.setMinutes(parseInt(minute));
    return dateTime;
}