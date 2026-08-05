import { fireEvent, render, screen } from '@testing-library/react';
import { MeasurementCategory, MetricType } from "@/components/Measurements/models/Category";
import { MeasurementEntry } from "@/components/Measurements/models/Entry";
import { MeasurementChart } from "@/components/Measurements/widgets/MeasurementChart";
import React from 'react';
import { describe, test } from 'vitest';

const entry = (id: string, date: Date, value: number) =>
    new MeasurementEntry(id, 'c-1', date, value, '');

// Recharts only paints SVG content once a ResizeObserver entry reports real
// dimensions, which jsdom does not provide. We therefore only assert the
// charts mount; the aggregation logic is covered separately below.
describe('MeasurementChart', () => {
    test('mounts a line chart for a custom category', () => {
        const category = new MeasurementCategory('c-1', 'Biceps', 'cm', [
            entry('d-1', new Date(2023, 1, 1), 30),
            entry('d-2', new Date(2023, 1, 2), 31),
        ]);

        render(<MeasurementChart category={category} />);
    });

    test('mounts a bar chart for a summed-per-day category', () => {
        const category = new MeasurementCategory('c-1', 'Steps', 'steps', [
            entry('d-1', new Date(2023, 1, 1, 8), 4000),
            entry('d-2', new Date(2023, 1, 1, 18), 6000),
        ], 'steps');

        render(<MeasurementChart category={category} />);
    });

    test('mounts with no entries', () => {
        render(<MeasurementChart category={new MeasurementCategory('c-1', 'Biceps', 'cm')} />);
        render(<MeasurementChart category={new MeasurementCategory('c-2', 'Steps', 'steps', [], 'steps')} />);
    });

    test('mounts a combined chart for a group', () => {
        const group = new MeasurementCategory('g-1', 'Blood pressure', 'mmHg');
        const systolic = new MeasurementCategory('c-sys', 'Systolic', 'mmHg', [], 'blood_pressure', false, 'g-1');
        systolic.entries = [
            new MeasurementEntry('d-1', 'c-sys', new Date(2023, 1, 1, 8), 120, ''),
            new MeasurementEntry('d-2', 'c-sys', new Date(2023, 1, 2, 8), 125, ''),
        ];
        const diastolic = new MeasurementCategory('c-dia', 'Diastolic', 'mmHg', [], 'blood_pressure', false, 'g-1');
        diastolic.entries = [
            new MeasurementEntry('d-3', 'c-dia', new Date(2023, 1, 1, 8), 80, ''),
        ];
        group.children = [systolic, diastolic];

        render(<MeasurementChart category={group} />);
    });

    test('draws a heatmap when the category asks for one', () => {
        const category = new MeasurementCategory('c-1', 'Steps', 'steps', [
            entry('d-1', new Date(2023, 1, 1), 4000),
        ], 'steps', false, null, 0, 'heatmap');

        render(<MeasurementChart category={category} range="all" />);

        // Unlike the recharts charts, the grid is plain elements and does
        // render in jsdom
        expect(screen.getByRole('img')).toBeInTheDocument();
    });

    test('mounts a change chart with the overall change under it', () => {
        // 5 January 2026 is a Monday
        const category = new MeasurementCategory('c-1', 'Biceps', 'cm', [
            entry('d-1', new Date(2026, 0, 5), 30),
            entry('d-2', new Date(2026, 0, 12), 31),
        ], 'custom', false, null, 0, 'delta');

        render(<MeasurementChart category={category} range="all" />);

        expect(screen.getByText(/overallChangeWeight/)).toBeInTheDocument();
    });

    test('a summed metric has no level to change, so no overall change', () => {
        const category = new MeasurementCategory('c-1', 'Steps', 'steps', [
            entry('d-1', new Date(2026, 0, 5), 4000),
            entry('d-2', new Date(2026, 0, 12), 6000),
        ], 'steps', false, null, 0, 'delta');

        render(<MeasurementChart category={category} range="all" />);

        expect(screen.queryByText(/overallChangeWeight/)).not.toBeInTheDocument();
    });

    test('draws a distribution histogram when the category asks for one', () => {
        const category = new MeasurementCategory(
            'c-1', 'Biceps', 'cm',
            Array.from(
                { length: 20 },
                (_, i) => entry(`d-${i}`, new Date(2026, 0, 1 + i), 30 + i % 3),
            ),
            'custom', false, null, 0, 'distribution',
        );

        render(<MeasurementChart category={category} range="all" />);

        // Plain elements like the heatmap, so the bars render in jsdom
        const chart = screen.getByRole('img', { name: 'measurements.chartTypes.distribution' });
        expect(screen.getByText(/distributionMedian/)).toBeInTheDocument();

        // Hovering a bin swaps the read-out to that bin's range and count
        fireEvent.mouseEnter(chart.firstChild!.firstChild as Element);
        expect(screen.getByText(/distributionEntryCount/)).toBeInTheDocument();
    });

    test('a summed distribution counts days and reads out as days', () => {
        const category = new MeasurementCategory(
            'c-1', 'Steps', 'steps',
            Array.from(
                { length: 20 },
                (_, i) => entry(`d-${i}`, new Date(2026, 0, 1 + i), 4000 + 100 * (i % 5)),
            ),
            'steps', false, null, 0, 'distribution',
        );

        render(<MeasurementChart category={category} range="all" />);

        const chart = screen.getByRole('img', { name: 'measurements.chartTypes.distribution' });
        fireEvent.mouseEnter(chart.firstChild!.firstChild as Element);
        expect(screen.getByText(/distributionDayCount/)).toBeInTheDocument();
    });

    test('a selection from before the data changed is dropped, not read out of range', () => {
        // 20 distinct values spread over 20 bins, then the same category
        // shrunk to a single bin while the last bin is still hovered
        const wide = new MeasurementCategory(
            'c-1', 'Biceps', 'cm',
            Array.from({ length: 20 }, (_, i) => entry(`d-${i}`, new Date(2026, 0, 1 + i), 30 + i)),
            'custom', false, null, 0, 'distribution',
        );
        const narrow = new MeasurementCategory(
            'c-1', 'Biceps', 'cm',
            Array.from({ length: 20 }, (_, i) => entry(`d-${i}`, new Date(2026, 0, 1 + i), 30)),
            'custom', false, null, 0, 'distribution',
        );

        const { rerender } = render(<MeasurementChart category={wide} range="all" />);
        const chart = screen.getByRole('img', { name: 'measurements.chartTypes.distribution' });
        fireEvent.mouseEnter(chart.firstChild!.lastChild as Element);
        expect(screen.getByText(/distributionEntryCount/)).toBeInTheDocument();

        rerender(<MeasurementChart category={narrow} range="all" />);

        expect(screen.queryByText(/distributionEntryCount/)).not.toBeInTheDocument();
        expect(screen.getByText(/distributionMedian/)).toBeInTheDocument();
    });

    test('too few values fall back to the derived chart instead of a noise histogram', () => {
        const category = new MeasurementCategory('c-1', 'Biceps', 'cm', [
            entry('d-1', new Date(2026, 0, 5), 30),
            entry('d-2', new Date(2026, 0, 12), 31),
        ], 'custom', false, null, 0, 'distribution');

        render(<MeasurementChart category={category} range="all" />);

        expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    test('a summed distribution measures its days, not its samples', () => {
        // 30 samples on 4 days are 4 daily totals: not enough for a
        // histogram, whatever the sample count says
        const category = new MeasurementCategory(
            'c-1', 'Steps', 'steps',
            Array.from(
                { length: 30 },
                (_, i) => entry(
                    `d-${i}`,
                    new Date(2026, 0, 1 + (i % 4), 8 + Math.floor(i / 4)),
                    500,
                ),
            ),
            'steps', false, null, 0, 'distribution',
        );

        render(<MeasurementChart category={category} range="all" />);

        expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    test('keeps the derived chart when the pick does not fit the metric type', () => {
        // Bars are not offered for a sample type, and a pick that does not fit
        // falls back to the derived chart instead of being drawn anyway
        const category = new MeasurementCategory('c-1', 'Biceps', 'cm', [
            entry('d-1', new Date(2023, 1, 1), 30),
        ], 'custom', false, null, 0, 'bar');

        render(<MeasurementChart category={category} range="all" />);

        expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    test('mounts a stacked chart for a sleep group', () => {
        const group = new MeasurementCategory('g-s', 'Sleep', 'min', [], 'sleep');
        const stage = (id: string, name: string, type: MetricType, value: number) => {
            const category = new MeasurementCategory(id, name, 'min', [], type, false, 'g-s');
            category.entries = [new MeasurementEntry(`d-${id}`, id, new Date(2023, 1, 2), value, '')];
            return category;
        };
        group.children = [
            stage('total', 'Total sleep', 'sleep_total', 480),
            stage('deep', 'Deep sleep', 'sleep_deep', 90),
            stage('rem', 'REM sleep', 'sleep_rem', 60),
        ];

        render(<MeasurementChart category={group} />);
    });
});
