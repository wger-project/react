import {
    dateTick,
    durationAxis,
    hoursAndMinutes,
    spansYears,
    valueOnly,
    valueWithUnit
} from "@/components/Measurements/charts/format";
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

    test('caps the fraction digits for at-a-glance readings', () => {
        expect(valueWithUnit(61.87, 'bpm', 'en', 0)).toBe('62 bpm');
        expect(valueWithUnit(82.46, 'kg', 'en', 1)).toBe('82.5 kg');
    });

    test('shows a value stored in minutes as hours and minutes', () => {
        expect(valueWithUnit(452, 'min', 'de')).toBe('7:32 h');
    });
});

describe('hoursAndMinutes', () => {
    test('splits the minutes into hours and minutes', () => {
        expect(hoursAndMinutes(452, 'en')).toBe('7:32');
    });

    test('pads the minutes so the values line up', () => {
        expect(hoursAndMinutes(425, 'en')).toBe('7:05');
    });

    test('keeps a duration below an hour in the same shape', () => {
        expect(hoursAndMinutes(45, 'en')).toBe('0:45');
    });

    test('rounds to whole minutes', () => {
        expect(hoursAndMinutes(59.6, 'en')).toBe('1:00');
    });

    test('keeps the sign of a negative change', () => {
        expect(hoursAndMinutes(-95, 'en')).toBe('-1:35');
    });
});

describe('durationAxis', () => {
    test('leaves the ticks to the library for every other unit', () => {
        expect(durationAxis('kg', 60, 100)).toBeUndefined();
    });

    test('puts every tick on a whole hour', () => {
        expect(durationAxis('min', 0, 300)?.ticks).toEqual([0, 60, 120, 180, 240, 300]);
    });

    test('widens the step until the ticks are few enough', () => {
        expect(durationAxis('min', 0, 540)?.ticks).toEqual([0, 120, 240, 360, 480, 600]);
    });

    test('keeps the domain from cutting the values it was derived from', () => {
        const axis = durationAxis('min', 0, 540);

        expect(axis?.domain[1]).toBeGreaterThanOrEqual(540);
        expect(axis?.domain[1]).toBe(axis?.ticks[axis.ticks.length - 1]);
    });

    test('starts at the hour below the data instead of at zero', () => {
        expect(durationAxis('min', 385, 460)?.domain[0]).toBe(360);
    });
});

describe('valueOnly', () => {
    test('leaves the unit off', () => {
        expect(valueOnly(42, 'cm', 'en')).toBe('42');
    });

    test('reads a duration as hours and minutes', () => {
        expect(valueOnly(452, 'min', 'en')).toBe('7:32');
    });
});
