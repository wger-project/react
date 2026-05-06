import { describe, expect, test } from 'vitest';
import { calculateEMA } from './ema';

describe('calculateEMA', () => {
    test('returns an empty array for empty input', () => {
        expect(calculateEMA([])).toEqual([]);
    });

    test('first point ema equals the first weight', () => {
        const result = calculateEMA([{ date: 1, weight: 80 }]);
        expect(result).toEqual([{ date: 1, weight: 80, ema: 80 }]);
    });

    test('ema converges to a constant series', () => {
        const result = calculateEMA([
            { date: 1, weight: 100 },
            { date: 2, weight: 100 },
            { date: 3, weight: 100 },
        ]);
        expect(result.map(p => p.ema)).toEqual([100, 100, 100]);
    });

    test('ema follows the recurrence ema_i = w_i * s + ema_{i-1} * (1 - s)', () => {
        const period = 10;
        const s = 2 / (period + 1);
        const weights = [{ date: 1, weight: 80 }, { date: 2, weight: 90 }];

        const result = calculateEMA(weights, period);

        expect(result[1].ema).toBeCloseTo(90 * s + 80 * (1 - s), 10);
    });

    test('honors a custom period', () => {
        const result = calculateEMA(
            [{ date: 1, weight: 80 }, { date: 2, weight: 90 }],
            2,
        );
        // s = 2/3, ema[1] = 90 * 2/3 + 80 * 1/3 = 86.666...
        expect(result[1].ema).toBeCloseTo(86.6666667, 6);
    });

    test('preserves extra fields on the input points', () => {
        const result = calculateEMA([
            { date: 1, weight: 80, label: 'a' },
            { date: 2, weight: 82, label: 'b' },
        ]);
        expect(result[0].label).toBe('a');
        expect(result[1].label).toBe('b');
    });
});
