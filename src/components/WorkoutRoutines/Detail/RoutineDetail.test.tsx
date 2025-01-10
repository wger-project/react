import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from '@testing-library/react';
import { RoutineDetail } from "components/WorkoutRoutines/Detail/RoutineDetail";
import React from "react";
import { MemoryRouter, Route, Routes } from "react-router";
import { getLanguages, getRoutine } from "services";
import { testLanguages } from "tests/exerciseTestdata";
import { testQueryClient } from "tests/queryClient";
import { testRoutine1 } from "tests/workoutRoutinesTestData";

jest.mock("services");

describe("Smoke tests the RoutineDetail component", () => {

    beforeEach(() => {
        (getRoutine as jest.Mock).mockResolvedValue(testRoutine1);
        (getLanguages as jest.Mock).mockResolvedValue(testLanguages);
    });

    test('renders the detail page', async () => {

        // Act
        render(
            <QueryClientProvider client={testQueryClient}>
                <MemoryRouter initialEntries={['/test/101']}>
                    <Routes>
                        <Route path="/test/:routineId" element={<RoutineDetail />} />
                    </Routes>
                </MemoryRouter>
            </QueryClientProvider>
        );

        // Assert
        await waitFor(() => {
            expect(getRoutine).toHaveBeenCalledWith(101);
            expect(getLanguages).toHaveBeenCalledTimes(1);
        });
        expect(screen.getByText('Test routine 1')).toBeInTheDocument();
        expect(screen.getByText('Full body routine')).toBeInTheDocument();
        expect(screen.getByText('Every day is leg day 🦵🏻')).toBeInTheDocument();
        expect(screen.getByText('Squats')).toBeInTheDocument();
        expect(screen.getByText('4 Sets, 5 x 20 @ 2Rir')).toBeInTheDocument();
    });
});
