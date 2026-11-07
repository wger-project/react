import { dotRadius, MAX_DOT_RADIUS } from "@/components/Measurements/charts/density";
import { describe, expect, test } from 'vitest';

describe('dotRadius', () => {
    test('starts at the maximum while the chart has not been measured', () => {
        expect(dotRadius(0, 500)).toBe(MAX_DOT_RADIUS);
    });

    test('is the maximum for a chart with room to spare', () => {
        expect(dotRadius(400, 10)).toBe(MAX_DOT_RADIUS);
    });

    test('shrinks as the points get denser', () => {
        expect(dotRadius(400, 100)).toBe(2);
        expect(dotRadius(400, 200)).toBe(1);
    });

    test('never goes below a visible minimum', () => {
        expect(dotRadius(400, 100000)).toBe(0.5);
    });

    test('is the maximum for a series without points', () => {
        expect(dotRadius(400, 0)).toBe(MAX_DOT_RADIUS);
    });
});
