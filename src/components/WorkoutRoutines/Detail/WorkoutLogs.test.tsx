import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from '@testing-library/react';
import { WorkoutLogs } from "components/WorkoutRoutines/Detail/WorkoutLogs";
import { useRoutineDetailQuery, useRoutineLogQuery } from "components/WorkoutRoutines/queries";
import React from 'react';
import { MemoryRouter, Route, Routes } from "react-router";
import { testWorkoutLogs } from "tests/workoutLogsRoutinesTestData";
import { testRoutine1 } from "tests/workoutRoutinesTestData";

jest.mock("components/WorkoutRoutines/queries");

const { ResizeObserver } = window;

const queryClient = new QueryClient();

describe("Test the RoutineLogs component", () => {

    beforeEach(() => {
        const crypto = require('crypto');
        Object.defineProperty(globalThis, 'crypto', {
            value: { getRandomValues: (arr: string | any[]) => crypto.randomBytes(arr.length) }
        });

        // @ts-ignore
        delete window.ResizeObserver;
        window.ResizeObserver = jest.fn().mockImplementation(() => ({
            observe: jest.fn(),
            unobserve: jest.fn(),
            disconnect: jest.fn()
        }));

        // @ts-ignore
        useRoutineLogQuery.mockImplementation(() => ({
            isSuccess: true,
            isLoading: false,
            data: testWorkoutLogs
        }));

        // @ts-ignore
        useRoutineDetailQuery.mockImplementation(() => ({
            isSuccess: true,
            isLoading: false,
            data: testRoutine1
        }));
    });

    afterEach(() => {
        window.ResizeObserver = ResizeObserver;
        jest.restoreAllMocks();
    });

    test('renders the log page for a routine', async () => {

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={['/log/101']}>
                    <Routes>
                        <Route path="log/:routineId" element={<WorkoutLogs />} />
                    </Routes>
                </MemoryRouter>
            </QueryClientProvider>
        );

        // Assert
        expect(useRoutineDetailQuery).toHaveBeenCalledWith(101);
        expect(useRoutineLogQuery).toHaveBeenCalledWith(101, false, { "repetition_unit": 1, "weight_unit__in": "1,2" });
        expect(screen.getByText('Every day is leg day 🦵🏻')).toBeInTheDocument();
        expect(screen.getByText('routines.addLogToDay')).toBeInTheDocument();
        expect(screen.getByText('Squats')).toBeInTheDocument();
    });
});
