import { dateTick, spansYears, valueWithUnit } from "@/components/Measurements/charts/format";
import { ChartPoint } from "@/components/Measurements/charts/series";
import { describe, expect, test } from 'vitest';

const point = (date: Date): ChartPoint => ({ date: date.getTime(), value: 0 });

describe('spansYears', () => {
    test('is false for an empty series', () => {
        expect(spansYears([])).toBe(false);
    });

    test('is false while the points stay within one year', () => {
        expect(spansYears([point(new Date(2023, 0, 1)), point(new Date(2023, 11, 31))])).toBe(false);
    });

    test('is true once they cross into another one', () => {
        expect(spansYears([point(new Date(2023, 11, 31)), point(new Date(2024, 0, 1))])).toBe(true);
    });
});

describe('dateTick', () => {
    const date = new Date(2023, 4, 17).getTime();

    test('leaves the year out while the chart stays within one', () => {
        expect(dateTick(false)(date)).not.toContain('23');
    });

    test('shows the year once the ticks need it', () => {
        expect(dateTick(true)(date)).toContain('23');
    });
});

describe('valueWithUnit', () => {
    test('separates the value from its unit', () => {
        expect(valueWithUnit(42, 'cm', 'en')).toBe('42 cm');
    });

    test('cuts the artefacts of summing floats down to what the server stores', () => {
        expect(valueWithUnit(11529.939999999999, 'count', 'en')).toBe('11,529.94 count');
    });

    test('formats the number for the locale', () => {
        expect(valueWithUnit(1234.5, 'kcal', 'de')).toBe('1.234,5 kcal');
    });
});
