import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router";
import { useRoutineDetailQuery } from "components/WorkoutRoutines/queries";
import { RoutineDetails } from "components/WorkoutRoutines/Detail/RoutineDetails";
import { testRoutine1 } from "tests/workoutRoutinesTestData";

jest.mock("components/WorkoutRoutines/queries");

const queryClient = new QueryClient();

describe("Test the RoutineDetail component", () => {

    beforeEach(() => {
        // @ts-ignore
        useRoutineDetailQuery.mockImplementation(() => ({
            isSuccess: true,
            isLoading: false,
            data: testRoutine1
        }));
    });

    test('renders a specific routine', async () => {

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={['/routine/101']}>
                    <Routes>
                        <Route path="routine/:routineId" element={<RoutineDetails />} />
                    </Routes>
                </MemoryRouter>
            </QueryClientProvider>
        );
        //await act(async () => {
        //    await new Promise((r) => setTimeout(r, 20));
        //});

        // Assert
        expect(useRoutineDetailQuery).toHaveBeenCalledWith(101);
        expect(screen.getByText('Full body routine')).toBeInTheDocument();
        expect(screen.getByText('Every day is leg day 🦵🏻')).toBeInTheDocument();
        expect(screen.getByText('Squats')).toBeInTheDocument();
    });
});
