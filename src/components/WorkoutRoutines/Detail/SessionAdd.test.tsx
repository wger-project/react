import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from '@testing-library/react';
import { SessionAdd } from "components/WorkoutRoutines/Detail/SessionAdd";
import React from "react";
import { MemoryRouter, Route, Routes } from "react-router";
import { getLanguages, getRoutine, searchSession } from "services";
import { testLanguages } from "tests/exerciseTestdata";
import { testQueryClient } from "tests/queryClient";
import { testWorkoutSession } from "tests/workoutLogsRoutinesTestData";
import { testRoutine1 } from "tests/workoutRoutinesTestData";

jest.mock("services");

describe("Smoke tests the SessionAdd component", () => {

    beforeEach(() => {
        (getRoutine as jest.Mock).mockResolvedValue(testRoutine1);
        (getLanguages as jest.Mock).mockResolvedValue(testLanguages);
        (searchSession as jest.Mock).mockResolvedValue(testWorkoutSession);
    });

    test('renders the form page', async () => {

        // Act
        render(
            <QueryClientProvider client={testQueryClient}>
                <MemoryRouter initialEntries={['/test/101/5']}>
                    <Routes>
                        <Route path="/test/:routineId/:dayId" element={<SessionAdd />} />
                    </Routes>
                </MemoryRouter>
            </QueryClientProvider>
        );

        // Assert
        await waitFor(() => {
            expect(getRoutine).toHaveBeenCalled();
            expect(getLanguages).toHaveBeenCalled();
            expect(searchSession).toHaveBeenCalled();
        });
        expect(screen.getByText('routines.addWeightLog')).toBeInTheDocument();
    });
});
