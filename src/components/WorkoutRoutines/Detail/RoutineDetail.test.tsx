import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from '@testing-library/react';
import { RoutineDetail } from "components/WorkoutRoutines/Detail/RoutineDetail";
import React from "react";
import { MemoryRouter, Route, Routes } from "react-router";
import { getLanguages, getRoutine } from "services";
import { testLanguages } from "tests/exerciseTestdata";
import { getTestQueryClient } from "tests/queryClient";
import { testPrivateTemplate1, testRoutine1 } from "tests/workoutRoutinesTestData";

jest.mock("services");

describe("Smoke tests the RoutineDetail component", () => {

    beforeEach(() => {
        (getRoutine as jest.Mock).mockResolvedValue(testRoutine1);
        (getLanguages as jest.Mock).mockResolvedValue(testLanguages);
    });

    test('renders the detail page', async () => {

        // Act
        render(
            <QueryClientProvider client={getTestQueryClient()}>
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
        await waitFor(() => {
            expect(screen.getByText('Test routine 1')).toBeInTheDocument();
        });

        expect(screen.queryByText('routines.template')).not.toBeInTheDocument();
        expect(screen.getByText('Full body routine')).toBeInTheDocument();
        expect(screen.getByText('Every day is leg day 🦵🏻')).toBeInTheDocument();
        expect(screen.getByText('Squats')).toBeInTheDocument();
        expect(screen.getByText('4 Sets, 5 x 20 @ 2Rir')).toBeInTheDocument();
    });

    test('renders chip for templates', async () => {
        (getRoutine as jest.Mock).mockResolvedValue(testPrivateTemplate1);

        // Act
        render(
            <QueryClientProvider client={getTestQueryClient()}>
                <MemoryRouter initialEntries={['/test/101']}>
                    <Routes>
                        <Route path="/test/:routineId" element={<RoutineDetail />} />
                    </Routes>
                </MemoryRouter>
            </QueryClientProvider>
        );

        // Assert
        await waitFor(() => {
            expect(getRoutine).toHaveBeenCalled();
        });
        await waitFor(() => {
            expect(screen.getByText('routines.template')).toBeInTheDocument();
        });
    });
});
