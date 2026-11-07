import { chartPointsFor, measurementSeries, MeasurementEntry } from "@/components/Measurements";
import { makeWeightEntry } from "@/tests/weight/testData";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, test } from 'vitest';
import { testQueryClient } from "@/tests/queryClient";
import { WeightChart } from "./WeightChart";

// See https://github.com/maslianok/react-resize-detector#testing-with-enzyme-and-jest
// Recharts only paints SVG content once a ResizeObserver entry reports real
// dimensions, which neither happy-dom nor jsdom provide. We therefore only
// assert the chart mounts; the EMA logic is covered in ema.test.ts.

const renderChart = (weights: MeasurementEntry[], height?: number) =>
    render(
        <QueryClientProvider client={testQueryClient}>
            <WeightChart weights={weights} unit="kg" categoryUnit="kg" height={height} />
        </QueryClientProvider>
    );

describe("WeightChart", () => {
    test('mounts with weight data', () => {
        renderChart([
            makeWeightEntry(new Date('2021-12-10'), 80, { id: 'd-1' }),
            makeWeightEntry(new Date('2021-12-20'), 90, { id: 'd-2' }),
        ]);
    });

    test('mounts with empty data', () => {
        renderChart([]);
    });

    test('mounts with a single entry', () => {
        renderChart([makeWeightEntry(new Date('2021-12-10'), 80, { id: 'd-1' })]);
    });

    test('mounts with unsorted data', () => {
        renderChart([
            makeWeightEntry(new Date('2021-12-20'), 90, { id: 'd-2' }),
            makeWeightEntry(new Date('2021-12-10'), 80, { id: 'd-1' }),
            makeWeightEntry(new Date('2021-12-15'), 85, { id: 'd-3' }),
        ]);
    });

    test('draws the day the range starts on whole', () => {
        // A Monday noon; six days back is 9 June, the first day of the week
        // the selector labels as one
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 5, 15, 12, 0));

        render(
            <QueryClientProvider client={testQueryClient}>
                <WeightChart
                    weights={[
                        makeWeightEntry(new Date(2026, 5, 9, 9, 0), 80, { id: 'd-1' }),
                        makeWeightEntry(new Date(2026, 5, 15, 8, 0), 82, { id: 'd-2' }),
                    ]}
                    unit="kg"
                    categoryUnit="kg"
                    range="lastWeek" />
            </QueryClientProvider>
        );

        // The range starts at that day's midnight, not at the hour of day the
        // clock shows, so the morning entry is part of it. With only one entry
        // left there would be nothing to average and no overall change
        expect(screen.getByText(/overallChangeWeight/)).toBeInTheDocument();

        vi.useRealTimers();
    });

    test('respects the height prop', () => {
        renderChart(
            [
                makeWeightEntry(new Date('2021-12-10'), 80, { id: 'd-1' }),
                makeWeightEntry(new Date('2021-12-20'), 85, { id: 'd-2' }),
            ],
            500,
        );
    });
});

describe("the series the chart is built from", () => {
    test('converts mixed units to the display unit before plotting', () => {
        const weights = [
            makeWeightEntry(new Date('2021-12-20'), 90, { id: 'd-2', unit: 'lb' }),
            makeWeightEntry(new Date('2021-12-10'), 80, { id: 'd-1', unit: 'kg' }),
        ];

        const inKg = measurementSeries(chartPointsFor(weights, 'kg', 'kg'))[0].points
            .map(p => p.value);
        const inLb = measurementSeries(chartPointsFor(weights, 'lb', 'kg'))[0].points
            .map(p => p.value);

        expect(inKg).toStrictEqual([80, 40.82]);
        expect(inLb).toStrictEqual([176.37, 90]);
    });
});
