import { ChartPoint } from "@/components/Measurements/charts/series";
import { dateToLocale } from "@/core/lib/date";
import { numberDecimalLocale } from "@/core/lib/numbers";

/** Whether the points fall into more than one calendar year */
export const spansYears = (points: ChartPoint[]): boolean => {
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

/** A measured value with its unit, both localised */
export const valueWithUnit = (value: number, unit: string, locale: string): string =>
    `${numberDecimalLocale(value, locale)} ${unit}`;
