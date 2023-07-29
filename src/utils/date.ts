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

export function dateTimeToHHMM(dateTime: Date | null) {
    if (dateTime == null) {
        return null;
    }

    return dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

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