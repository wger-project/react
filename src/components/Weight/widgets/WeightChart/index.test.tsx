import { QueryClientProvider } from "@tanstack/react-query";
import { render } from '@testing-library/react';
import { WeightEntry } from "@/components/Weight/models/WeightEntry";
import React from 'react';
import { describe, test } from 'vitest';
import { testQueryClient } from "@/tests/queryClient";
import { WeightChart } from "./index";

// See https://github.com/maslianok/react-resize-detector#testing-with-enzyme-and-jest
// Recharts only paints SVG content once a ResizeObserver entry reports real
// dimensions, which neither happy-dom nor jsdom provide. We therefore only
// assert the chart mounts; the EMA logic is covered in ema.test.ts.

const renderChart = (weights: WeightEntry[], height?: number) =>
    render(
        <QueryClientProvider client={testQueryClient}>
            <WeightChart weights={weights} height={height} />
        </QueryClientProvider>
    );

describe("WeightChart", () => {
    test('mounts with weight data', () => {
        renderChart([
            new WeightEntry(new Date('2021-12-10'), 80, 1),
            new WeightEntry(new Date('2021-12-20'), 90, 2),
        ]);
    });

    test('mounts with empty data', () => {
        renderChart([]);
    });

    test('mounts with a single entry', () => {
        renderChart([new WeightEntry(new Date('2021-12-10'), 80, 1)]);
    });

    test('mounts with unsorted data', () => {
        renderChart([
            new WeightEntry(new Date('2021-12-20'), 90, 2),
            new WeightEntry(new Date('2021-12-10'), 80, 1),
            new WeightEntry(new Date('2021-12-15'), 85, 3),
        ]);
    });

    test('respects the height prop', () => {
        renderChart(
            [
                new WeightEntry(new Date('2021-12-10'), 80, 1),
                new WeightEntry(new Date('2021-12-20'), 85, 2),
            ],
            500,
        );
    });
});
