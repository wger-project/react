import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MeasurementEntry } from "@/components/Measurements";
import { testQueryClient } from "@/tests/queryClient";
import { makeWeightEntry } from "@/tests/weight/testData";
import React from 'react';
import { dateToLocale } from "@/core/lib/date";
import { DayProps } from './CalendarComponent';
import Entries from './Entries';

vi.mock('@/components/User/queries/profile', () => ({
    useProfileQuery: () => ({ isLoading: false, data: { useMetric: true } }),
}));

describe('Entries Component', () => {
    const mockDate = new Date('2025-4-25');

    const mockWeightEntry: MeasurementEntry = makeWeightEntry(mockDate, 75.5);

    const defaultProps: DayProps = {
        date: mockDate,
        weightEntry: undefined,
        measurements: [],
        nutritionLogs: [],
        workoutSession: undefined
    };

    test('Correctly shows date and title', () => {
        render(
            <QueryClientProvider client={testQueryClient}>
                <Entries selectedDay={defaultProps} />
            </QueryClientProvider>
        );

        expect(screen.getByText(/entries/i)).toBeInTheDocument();
        expect(screen.getByText(dateToLocale(mockDate), { exact: false })).toBeInTheDocument();
    });

    test('Shows weight entry, if available', () => {
        const propsWithWeight = {
            ...defaultProps,
            weightEntry: mockWeightEntry
        };

        render(
            <QueryClientProvider client={testQueryClient}>
                <Entries selectedDay={propsWithWeight} />
            </QueryClientProvider>
        );

        expect(screen.getByText('weight')).toBeInTheDocument();
        expect(screen.getByText('75.5 server.kg')).toBeInTheDocument();
    });

    test('Shows measurement directly, if theres only one entry', () => {
        const propsWithOneMeasurement = {
            ...defaultProps,
            measurements: [
                { name: 'Chest size', value: 95, unit: 'cm', date: mockDate }
            ]
        };

        render(
            <QueryClientProvider client={testQueryClient}>
                <Entries selectedDay={propsWithOneMeasurement} />
            </QueryClientProvider>
        );

        expect(screen.getByText('measurements.measurements')).toBeInTheDocument();
        expect(screen.getByText('Chest size: 95 cm')).toBeInTheDocument();
    });

    test('Show measurements in a collapsible', async () => {
        const propsWithMultipleMeasurements = {
            ...defaultProps,
            measurements: [
                { name: 'Chest size', value: 95, unit: 'cm', date: mockDate },
                { name: 'Arm size', value: 35, unit: 'cm', date: mockDate }
            ]
        };

        render(
            <QueryClientProvider client={testQueryClient}>
                <Entries selectedDay={propsWithMultipleMeasurements} />
            </QueryClientProvider>
        );

        // Initially only the header is visible
        expect(screen.getByText('measurements.measurements')).toBeInTheDocument();
        expect(screen.queryByText('Chest size')).not.toBeInTheDocument();
        expect(screen.queryByText('Arm size')).not.toBeInTheDocument();

        const user = userEvent.setup();
        await user.click(screen.getByText('measurements.measurements'));

        expect(screen.queryByText('Chest size')).toBeInTheDocument();
        expect(screen.getByText('Arm size')).toBeInTheDocument();
    });
});