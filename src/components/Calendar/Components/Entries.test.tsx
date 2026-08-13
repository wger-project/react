import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MeasurementEntry } from "@/components/Measurements";
import { WorkoutSession } from "@/components/Routines/models/WorkoutSession";
import { testQueryClient } from "@/tests/queryClient";
import { makeWeightEntry } from "@/tests/weight/testData";
import React from 'react';
import { TEST_INGREDIENT_1 } from "@/tests/ingredientTestdata";
import { TEST_DIARY_ENTRY_1, TEST_DIARY_ENTRY_2 } from "@/tests/nutritionDiaryTestdata";
import { testWorkoutLogs, testWorkoutSession } from "@/tests/workoutLogsRoutinesTestData";
import { dateToLocale } from "@/core/lib/date";
import { DayProps } from './CalendarComponent';
import Entries from './Entries';

vi.mock("@/components/Measurements/api/bodyWeight");
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

    test('Shows the workout session logs in a collapsible', async () => {
        const propsWithSession = {
            ...defaultProps,
            workoutSession: new WorkoutSession({ ...testWorkoutSession, logs: testWorkoutLogs })
        };

        render(
            <QueryClientProvider client={testQueryClient}>
                <Entries selectedDay={propsWithSession} />
            </QueryClientProvider>
        );

        // Initially only the session header with its summary is visible
        expect(screen.getByText('routines.workoutSession')).toBeInTheDocument();
        expect(screen.getByText(/everything is awesome/)).toBeInTheDocument();
        expect(screen.queryByText('8 × 80')).not.toBeInTheDocument();

        const user = userEvent.setup();
        await user.click(screen.getByText('routines.workoutSession'));

        // The logs are rendered as "repetitions × weight" per exercise
        expect(screen.getAllByText('Squats').length).toBe(testWorkoutLogs.length);
        expect(screen.getByText(/^8 × 80/)).toBeInTheDocument();
        expect(screen.getByText(/^8 × 82.5/)).toBeInTheDocument();
    });

    test('Shows the nutrition diary entries in a collapsible', async () => {
        const propsWithNutrition = {
            ...defaultProps,
            nutritionLogs: [TEST_DIARY_ENTRY_1, TEST_DIARY_ENTRY_2]
        };

        render(
            <QueryClientProvider client={testQueryClient}>
                <Entries selectedDay={propsWithNutrition} />
            </QueryClientProvider>
        );

        // Initially only the header is visible
        expect(screen.getByText('nutrition.nutritionalDiary')).toBeInTheDocument();
        expect(screen.queryByText(TEST_INGREDIENT_1.name)).not.toBeInTheDocument();

        const user = userEvent.setup();
        await user.click(screen.getByText('nutrition.nutritionalDiary'));

        expect(screen.getByText(TEST_INGREDIENT_1.name)).toBeInTheDocument();
        expect(screen.getByText(`${TEST_DIARY_ENTRY_1.amount} nutrition.gramShort`)).toBeInTheDocument();
    });
});