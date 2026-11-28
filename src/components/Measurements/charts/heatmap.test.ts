import { fillMissingDays } from "@/components/Measurements/charts/data";
import { buildHeatmapGrid, HEATMAP_MAX_WEEKS, heatmapDayAt } from "@/components/Measurements/charts/heatmap";
import { ChartPoint } from "@/components/Measurements/charts/series";
import { describe, expect, test } from 'vitest';

const point = (date: Date, value: number): ChartPoint => ({ date: date.getTime(), value: value });

const day = (dayOfMonth: number, hour: number = 0) => new Date(2023, 1, dayOfMonth, hour);

describe('buildHeatmapGrid', () => {
    // 2 March 2026 is a Monday, 18 March a Wednesday
    const monday = new Date(2026, 2, 2);
    const wednesday = new Date(2026, 2, 18);
    const at = (date: Date, value: number): ChartPoint => ({ date: date.getTime(), value: value });

    test('starts on the Monday of the oldest week and ends with today', () => {
        const grid = buildHeatmapGrid([at(monday, 10), at(wednesday, 20)], HEATMAP_MAX_WEEKS, wednesday);

        expect(grid.start).toEqual(monday.getTime());
        expect(grid.weeks).toEqual(3);
        expect(heatmapDayAt(grid, 2, 2)).toEqual(wednesday.getTime());
    });

    test('leaves days without a measurement empty rather than zero', () => {
        const grid = buildHeatmapGrid([at(monday, 10)], HEATMAP_MAX_WEEKS, monday);

        expect(grid.values.get(heatmapDayAt(grid, 0, 0))).toEqual(10);
        expect(grid.values.get(heatmapDayAt(grid, 0, 1))).toBeUndefined();
    });

    test('runs up to today, so a stretch without measurements stays visible', () => {
        const grid = buildHeatmapGrid([at(monday, 10)], HEATMAP_MAX_WEEKS, wednesday);

        expect(grid.weeks).toEqual(3);
        expect(grid.values.get(heatmapDayAt(grid, 2, 2))).toBeUndefined();
    });

    test('caps a long history at a year of week columns', () => {
        const grid = buildHeatmapGrid(
            [at(new Date(2020, 0, 1), 10), at(wednesday, 20)],
            HEATMAP_MAX_WEEKS,
            wednesday,
        );

        expect(grid.weeks).toEqual(HEATMAP_MAX_WEEKS);
        expect(heatmapDayAt(grid, grid.weeks - 1, 2)).toEqual(wednesday.getTime());
    });

    test('anchors on the last measurement when the history ended long ago', () => {
        // Anchoring on today would put the whole history outside the grid and
        // draw an empty one
        const grid = buildHeatmapGrid(
            [at(monday, 10), at(wednesday, 20)],
            HEATMAP_MAX_WEEKS,
            new Date(2028, 0, 1),
        );

        expect(heatmapDayAt(grid, grid.weeks - 1, 2)).toEqual(wednesday.getTime());
        expect(grid.values.get(wednesday.getTime())).toEqual(20);
    });

    test('takes the top of the colour scale only from the days it shows', () => {
        // A spike outside the window would scale the colours of every visible
        // cell without being visible itself, washing out the whole grid
        const grid = buildHeatmapGrid(
            [at(new Date(2024, 0, 3), 45000), at(wednesday, 8000)],
            HEATMAP_MAX_WEEKS,
            wednesday,
        );

        expect(grid.maxValue).toEqual(8000);
        expect(grid.values.has(new Date(2024, 0, 3).getTime())).toBe(false);
    });

    test('takes the top of the colour scale from the largest value', () => {
        const grid = buildHeatmapGrid(
            [at(monday, 10), at(wednesday, 8000)],
            HEATMAP_MAX_WEEKS,
            wednesday,
        );

        expect(grid.maxValue).toEqual(8000);
    });

    test('is a full grid of the last year when there is nothing to show', () => {
        const grid = buildHeatmapGrid([]);

        expect(grid.weeks).toEqual(HEATMAP_MAX_WEEKS);
        expect(grid.maxValue).toEqual(0);
        expect(grid.values.size).toEqual(0);
    });
});

describe('fillMissingDays', () => {
    test('returns an empty array for no data', () => {
        expect(fillMissingDays([])).toEqual([]);
    });

    test('fills gaps with zero-value days', () => {
        const result = fillMissingDays([point(day(1), 10), point(day(4), 40)]);

        expect(result).toEqual([
            { date: day(1).getTime(), value: 10 },
            { date: day(2).getTime(), value: 0 },
            { date: day(3).getTime(), value: 0 },
            { date: day(4).getTime(), value: 40 },
        ]);
    });

    test('keeps a contiguous series unchanged', () => {
        const data = [point(day(1), 10), point(day(2), 20)];

        expect(fillMissingDays(data)).toEqual(data);
    });
});
