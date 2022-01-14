/*
 * Util function that converts a date to a YYYY-MM-DD string
 */
export function dateToYYYYMMDD(date: Date): string {
    return date.toISOString().split('T')[0];
}