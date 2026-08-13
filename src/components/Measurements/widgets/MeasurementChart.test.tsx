import { createTheme, ThemeProvider } from "@mui/material";
import { QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from '@testing-library/react';
import { CategorySeed, mockChartQueries } from "@/tests/chartQueries";
import { testQueryClient } from "@/tests/queryClient";
import { MeasurementCategory, MetricType } from "@/components/Measurements/models/Category";
import { MeasurementEntry } from "@/components/Measurements/models/Entry";
import { MeasurementChart } from "@/components/Measurements/widgets/MeasurementChart";
import React from 'react';
import { describe, test } from 'vitest';

vi.mock("@/components/Measurements/queries");

/** The chart reads its points from the aggregated queries, not as entries */
const renderChart = (element: React.ReactElement, seeds: CategorySeed[]) => {
    mockChartQueries(seeds);

    return render(<QueryClientProvider client={testQueryClient}>{element}</QueryClientProvider>);
};

const entry = (id: string, date: Date, value: number) =>
    new MeasurementEntry(id, 'c-1', date, value, '');

/** A category with the history the server holds for it */
const seed = (category: MeasurementCategory, entries: MeasurementEntry[] = []): CategorySeed =>
    ({ category: category, entries: entries });

// Recharts only paints SVG content once a ResizeObserver entry reports real
// dimensions, which jsdom does not provide. We therefore only assert the
// charts mount; the aggregation logic is covered separately below.
describe('MeasurementChart', () => {
    test('mounts a line chart for a custom category', () => {
        const category = new MeasurementCategory('c-1', 'Biceps', 'cm');

        renderChart(<MeasurementChart category={category} />, [seed(category, [
            entry('d-1', new Date(2023, 1, 1), 30),
            entry('d-2', new Date(2023, 1, 2), 31),
        ])]);
    });

    test('mounts a bar chart for a summed-per-day category', () => {
        const category = new MeasurementCategory('c-1', 'Steps', 'steps', 'steps');

        renderChart(<MeasurementChart category={category} />, [seed(category, [
            entry('d-1', new Date(2023, 1, 1, 8), 4000),
            entry('d-2', new Date(2023, 1, 1, 18), 6000),
        ])]);
    });

    test('mounts with no entries', () => {
        const empty = new MeasurementCategory('c-1', 'Biceps', 'cm');
        const emptySummed = new MeasurementCategory('c-2', 'Steps', 'steps', 'steps');

        renderChart(<MeasurementChart category={empty} />, [seed(empty)]);
        renderChart(<MeasurementChart category={emptySummed} />, [seed(emptySummed)]);
    });

    test('mounts a combined chart for a group', () => {
        const group = new MeasurementCategory('g-1', 'Blood pressure', 'mmHg');
        const systolic = new MeasurementCategory('c-sys', 'Systolic', 'mmHg', 'blood_pressure', false, 'g-1');
        const diastolic = new MeasurementCategory('c-dia', 'Diastolic', 'mmHg', 'blood_pressure', false, 'g-1');
        group.children = [systolic, diastolic];

        renderChart(<MeasurementChart category={group} />, [
            seed(group),
            seed(systolic, [
                new MeasurementEntry('d-1', 'c-sys', new Date(2023, 1, 1, 8), 120, ''),
                new MeasurementEntry('d-2', 'c-sys', new Date(2023, 1, 2, 8), 125, ''),
            ]),
            seed(diastolic, [new MeasurementEntry('d-3', 'c-dia', new Date(2023, 1, 1, 8), 80, '')]),
        ]);
    });

    test('draws a heatmap when the category asks for one', () => {
        const category = new MeasurementCategory('c-1', 'Steps', 'steps', 'steps', false, null, 0, 'heatmap');

        renderChart(
            <MeasurementChart category={category} range="all" />,
            [seed(category, [entry('d-1', new Date(2023, 1, 1), 4000)])],
        );

        // Unlike the recharts charts, the grid is plain elements and does
        // render in jsdom
        expect(screen.getByRole('img')).toBeInTheDocument();
    });

    test('draws with the theme it is rendered in', () => {
        const category = new MeasurementCategory('c-1', 'Steps', 'steps', 'steps', false, null, 0, 'heatmap');
        const theme = createTheme({ palette: { primary: { main: 'rgb(1, 2, 3)' } } });

        mockChartQueries([seed(category, [entry('d-1', new Date(2023, 1, 1), 4000)])]);
        render(
            <QueryClientProvider client={testQueryClient}>
                <ThemeProvider theme={theme}>
                    <MeasurementChart category={category} range="all" />
                </ThemeProvider>
            </QueryClientProvider>
        );

        // The app mounts its own theme into a shadow root, so a chart reading
        // the exported one draws colours the page never set
        const cells = [...screen.getByRole('img').querySelectorAll('div')];
        expect(cells.some(cell => getComputedStyle(cell).backgroundColor.includes('1, 2, 3'))).toBe(true);
    });

    test('mounts a change chart with the overall change under it', () => {
        // 5 January 2026 is a Monday
        const category = new MeasurementCategory('c-1', 'Biceps', 'cm', 'custom', false, null, 0, 'delta');

        renderChart(<MeasurementChart category={category} range="all" />, [seed(category, [
            entry('d-1', new Date(2026, 0, 5), 30),
            entry('d-2', new Date(2026, 0, 12), 31),
        ])]);

        expect(screen.getByText(/overallChangeWeight/)).toBeInTheDocument();
    });

    test('a summed metric has no level to change, so no overall change', () => {
        const category = new MeasurementCategory('c-1', 'Steps', 'steps', 'steps', false, null, 0, 'delta');

        renderChart(<MeasurementChart category={category} range="all" />, [seed(category, [
            entry('d-1', new Date(2026, 0, 5), 4000),
            entry('d-2', new Date(2026, 0, 12), 6000),
        ])]);

        expect(screen.queryByText(/overallChangeWeight/)).not.toBeInTheDocument();
    });

    test('draws a distribution histogram when the category asks for one', () => {
        const category = new MeasurementCategory(
            'c-1', 'Biceps', 'cm', 'custom', false, null, 0, 'distribution',
        );

        renderChart(<MeasurementChart category={category} range="all" />, [seed(category,
            Array.from(
                { length: 20 },
                (_, i) => entry(`d-${i}`, new Date(2026, 0, 1 + i), 30 + i % 3),
            ),
        )]);

        // Plain elements like the heatmap, so the bars render in jsdom
        const chart = screen.getByRole('img', { name: 'measurements.chartTypes.distribution' });
        expect(screen.getByText(/distributionMedian/)).toBeInTheDocument();

        // Hovering a bin swaps the read-out to that bin's range and count
        fireEvent.mouseEnter(chart.firstChild!.firstChild as Element);
        expect(screen.getByText(/distributionEntryCount/)).toBeInTheDocument();
    });

    test('a summed distribution counts days and reads out as days', () => {
        const category = new MeasurementCategory(
            'c-1', 'Steps', 'steps', 'steps', false, null, 0, 'distribution',
        );

        renderChart(<MeasurementChart category={category} range="all" />, [seed(category,
            Array.from(
                { length: 20 },
                (_, i) => entry(`d-${i}`, new Date(2026, 0, 1 + i), 4000 + 100 * (i % 5)),
            ),
        )]);

        const chart = screen.getByRole('img', { name: 'measurements.chartTypes.distribution' });
        fireEvent.mouseEnter(chart.firstChild!.firstChild as Element);
        expect(screen.getByText(/distributionDayCount/)).toBeInTheDocument();
    });

    test('a selection from before the data changed is dropped, not read out of range', () => {
        // 20 distinct values spread over 20 bins, then the same category
        // shrunk to a single bin while the last bin is still hovered
        const category = new MeasurementCategory(
            'c-1', 'Biceps', 'cm', 'custom', false, null, 0, 'distribution',
        );
        const wide = seed(category,
            Array.from({ length: 20 }, (_, i) => entry(`d-${i}`, new Date(2026, 0, 1 + i), 30 + i)),
        );
        const narrow = seed(category,
            Array.from({ length: 20 }, (_, i) => entry(`d-${i}`, new Date(2026, 0, 1 + i), 30)),
        );

        const { rerender } = renderChart(<MeasurementChart category={category} range="all" />, [wide]);
        const chart = screen.getByRole('img', { name: 'measurements.chartTypes.distribution' });
        fireEvent.mouseEnter(chart.firstChild!.lastChild as Element);
        expect(screen.getByText(/distributionEntryCount/)).toBeInTheDocument();

        mockChartQueries([narrow]);
        rerender(
            <QueryClientProvider client={testQueryClient}>
                <MeasurementChart category={category} range="all" />
            </QueryClientProvider>,
        );

        expect(screen.queryByText(/distributionEntryCount/)).not.toBeInTheDocument();
        expect(screen.getByText(/distributionMedian/)).toBeInTheDocument();
    });

    test('too few values fall back to the derived chart instead of a noise histogram', () => {
        const category = new MeasurementCategory(
            'c-1', 'Biceps', 'cm', 'custom', false, null, 0, 'distribution',
        );

        renderChart(<MeasurementChart category={category} range="all" />, [seed(category, [
            entry('d-1', new Date(2026, 0, 5), 30),
            entry('d-2', new Date(2026, 0, 12), 31),
        ])]);

        expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    test('a summed distribution measures its days, not its samples', () => {
        // 30 samples on 4 days are 4 daily totals: not enough for a
        // histogram, whatever the sample count says
        const category = new MeasurementCategory(
            'c-1', 'Steps', 'steps', 'steps', false, null, 0, 'distribution',
        );

        renderChart(<MeasurementChart category={category} range="all" />, [seed(category,
            Array.from(
                { length: 30 },
                (_, i) => entry(
                    `d-${i}`,
                    new Date(2026, 0, 1 + (i % 4), 8 + Math.floor(i / 4)),
                    500,
                ),
            ),
        )]);

        expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    test('keeps the derived chart when the pick does not fit the metric type', () => {
        // Bars are not offered for a sample type, and a pick that does not fit
        // falls back to the derived chart instead of being drawn anyway
        const category = new MeasurementCategory('c-1', 'Biceps', 'cm', 'custom', false, null, 0, 'bar');

        renderChart(
            <MeasurementChart category={category} range="all" />,
            [seed(category, [entry('d-1', new Date(2023, 1, 1), 30)])],
        );

        expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    test('mounts a stacked chart for a sleep group', () => {
        const group = new MeasurementCategory('g-s', 'Sleep', 'min', 'sleep');
        const stage = (id: string, name: string, type: MetricType, value: number) => seed(
            new MeasurementCategory(id, name, 'min', type, false, 'g-s'),
            [new MeasurementEntry(`d-${id}`, id, new Date(2023, 1, 2), value, '')],
        );
        const stages = [
            stage('total', 'Total sleep', 'sleep_total', 480),
            stage('deep', 'Deep sleep', 'sleep_deep', 90),
            stage('rem', 'REM sleep', 'sleep_rem', 60),
        ];
        group.children = stages.map(stage => stage.category);

        renderChart(<MeasurementChart category={group} />, [seed(group), ...stages]);
    });
});
