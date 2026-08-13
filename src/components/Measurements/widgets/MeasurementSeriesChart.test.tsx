import { render } from '@testing-library/react';
import { ChartPoint, ChartSeries } from "@/components/Measurements/charts/series";
import { bandData, MeasurementSeriesChart } from "@/components/Measurements/widgets/MeasurementSeriesChart";
import React from 'react';
import { describe, expect, test } from 'vitest';

const ranged = (date: number, value: number, min: number, max: number): ChartPoint =>
    ({ date: date, value: value, min: min, max: max });

const plain = (date: number, value: number): ChartPoint => ({ date: date, value: value });

const series = (role: ChartSeries['role'], points: ChartPoint[], label?: string): ChartSeries =>
    ({ role: role, points: points, label: label });

describe('bandData', () => {
    test('is empty for a series without ranges', () => {
        expect(bandData(series('raw', [plain(1, 10), plain(2, 20)]))).toEqual([]);
    });

    test('spans the bounds of the measured values', () => {
        const band = bandData(series('raw', [ranged(1, 10, 5, 15)]));

        expect(band).toStrictEqual([{ date: 1, range: [5, 15] }]);
    });

    test('is drawn for the components of a group', () => {
        expect(bandData(series('component', [ranged(1, 10, 5, 15)], 'Systolic'))).toHaveLength(1);
    });

    test('is never drawn for a derived series', () => {
        // condensing attaches a range to every point, so the average of a
        // dense series carries one too — but it has no spread of its own
        expect(bandData(series('average', [ranged(1, 10, 5, 15)]))).toEqual([]);
        expect(bandData(series('trend', [ranged(1, 10, 5, 15)]))).toEqual([]);
    });

    test('is skipped when only some points carry a range', () => {
        const band = bandData(series('raw', [ranged(1, 10, 5, 15), plain(2, 20)]));

        expect(band).toEqual([]);
    });
});

// Recharts only paints SVG content once a ResizeObserver entry reports real
// dimensions, which jsdom does not provide, so we only assert it mounts
describe('MeasurementSeriesChart', () => {
    test('mounts the values with their average and trend', () => {
        render(<MeasurementSeriesChart
            series={[
                series('raw', [plain(1, 10), plain(2, 20)]),
                series('average', [plain(1, 10), plain(2, 15)]),
                series('trend', [plain(1, 10), plain(2, 12)]),
            ]}
            unit="cm" />);
    });

    test('mounts the components of a group', () => {
        render(<MeasurementSeriesChart
            series={[
                series('component', [plain(1, 120)], 'Systolic'),
                series('component', [plain(1, 80)], 'Diastolic'),
            ]}
            unit="mmHg" />);
    });

    test('mounts without any series', () => {
        render(<MeasurementSeriesChart series={[]} unit="cm" />);
    });
});
