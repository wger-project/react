import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from '@testing-library/react';
import { RoutineDetailsCard } from "components/WorkoutRoutines/Detail/RoutineDetailsCard";
import { useRoutineDetailQuery } from "components/WorkoutRoutines/queries";
import React from 'react';
import { MemoryRouter, Route, Routes } from "react-router";
import { testRoutine1 } from "tests/workoutRoutinesTestData";

jest.mock("components/WorkoutRoutines/queries");

const queryClient = new QueryClient();

describe("Test the RoutineDetail component", () => {

    beforeEach(() => {
        const crypto = require('crypto');
        Object.defineProperty(globalThis, 'crypto', {
            value: { getRandomValues: (arr: string | any[]) => crypto.randomBytes(arr.length) }
        });

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
                        <Route path="routine/:routineId" element={<RoutineDetailsCard />} />
                    </Routes>
                </MemoryRouter>
            </QueryClientProvider>
        );

        // Assert
        expect(useRoutineDetailQuery).toHaveBeenCalledWith(101);
        expect(screen.getByText('Full body routine')).toBeInTheDocument();
        expect(screen.getByText('Every day is leg day 🦵🏻')).toBeInTheDocument();
        expect(screen.getByText('Squats')).toBeInTheDocument();
    });
});
