import { measurementSeries, MeasurementEntry } from "@/components/Measurements";
import { makeWeightEntry } from "@/tests/weight/testData";
import { QueryClientProvider } from "@tanstack/react-query";
import { render } from '@testing-library/react';
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

        const inKg = measurementSeries(weights, 'kg', 'kg')[0].points.map(p => p.value);
        const inLb = measurementSeries(weights, 'lb', 'kg')[0].points.map(p => p.value);

        expect(inKg).toStrictEqual([80, 40.82]);
        expect(inLb).toStrictEqual([176.37, 90]);
    });
});
