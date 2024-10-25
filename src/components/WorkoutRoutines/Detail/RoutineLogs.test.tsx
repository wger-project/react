import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from '@testing-library/react';
import { RoutineLogs } from "components/WorkoutRoutines/Detail/RoutineLogs";
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

        // @ts-expect-error this is ok and exists
        delete window.ResizeObserver;
        window.ResizeObserver = jest.fn().mockImplementation(() => ({
            observe: jest.fn(),
            unobserve: jest.fn(),
            disconnect: jest.fn()
        }));

        // @ts-expect-error mock will exist when this is run
        useRoutineLogQuery.mockImplementation(() => ({
            isSuccess: true,
            isLoading: false,
            data: testWorkoutLogs
        }));

        // @ts-expect-error mock will exist when this is run
        useRoutineDetailQuery.mockImplementation(() => ({
            isSuccess: true,
            isLoading: false,
            data: testRoutine1
        }));
    });

    test('renders the log page for a routine', async () => {

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={['/log/101']}>
                    <Routes>
                        <Route path="log/:routineId" element={<RoutineLogs />} />
                    </Routes>
                </MemoryRouter>
            </QueryClientProvider>
        );
        //await act(async () => {
        //    await new Promise((r) => setTimeout(r, 20));
        //});

        // Assert
        expect(useRoutineDetailQuery).toHaveBeenCalledWith(101);
        expect(useRoutineLogQuery).toHaveBeenCalledWith(101, false);
        expect(screen.getByText('Every day is leg day 🦵🏻')).toBeInTheDocument();
        expect(screen.getByText('routines.addLogToDay')).toBeInTheDocument();
        expect(screen.getByText('Squats')).toBeInTheDocument();
    });
});
