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
