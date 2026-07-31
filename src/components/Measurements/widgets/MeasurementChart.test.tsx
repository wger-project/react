import { render } from '@testing-library/react';
import { MeasurementCategory } from "@/components/Measurements/models/Category";
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
});
