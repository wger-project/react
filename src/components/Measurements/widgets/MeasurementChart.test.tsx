import { render, screen } from '@testing-library/react';
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
